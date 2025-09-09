# RAGE Technical Implementation Details

This document provides comprehensive technical details about the RAGE implementation, covering the key architectural patterns, data structures, and algorithms that make the system work.

## Core Architecture Overview

RAGE is built on a modern microservices architecture using Python with FastAPI, designed for scalability and maintainability. The system follows clear separation of concerns with distinct layers for API endpoints, business logic, data access, and background processing.

### Technology Stack

**Backend Framework:**
- **FastAPI**: RESTful API with async endpoints and automatic OpenAPI documentation
- **Pydantic**: Data validation and serialization throughout the system
- **Celery**: Distributed task queue for background processing
- **Redis**: Task queue backend and caching layer

**Database Layer:**
- **Neo4j**: Primary graph database for storing frame instances and relationships
- **Vector Indexes**: Neo4j's native vector search capabilities for semantic similarity
- **HuggingFace Embeddings**: E5-mistral-7b-instruct model for 4096-dimensional embeddings

**Infrastructure:**
- **Docker & Docker Compose**: Containerized deployment and orchestration
- **Nginx**: Reverse proxy for API routing and SSL termination
- **Flower**: Celery task monitoring and management dashboard

## Frame Schema System

### Dynamic Registry Architecture

RAGE implements a sophisticated dynamic frame registry that automatically discovers and registers frame schemas from Python modules. This eliminates the need for manual enum updates and enables hot reloading of frame definitions.

```python
# app/frames/registry.py - Core registry implementation
class FrameRegistryManager:
    def discover_all_schemas(self) -> None:
        """Automatically discover all frame schemas from schema modules."""
        # Import all *_schemas.py files
        for schema_file in package_path.glob("*_schemas.py"):
            module_name = f"app.frames.{schema_file.stem}"
            importlib.import_module(module_name)
        
        # Update discovered schemas from global registry
        self.discovered_schemas.update(FRAME_SCHEMA_REGISTRY)
        
        # Auto-categorize and register with dynamic types
        self._categorize_schemas()
        self._register_with_dynamic_types()
```

### Frame Schema Definition

Frame schemas are defined using a declarative approach with automatic registration:

```python
# Example from app/frames/content_schemas.py
define_schema({
    "schema_id": "claim",
    "label": "Claim",
    "description": "A statement that can be supported or disputed",
    "slots": [
        FrameSlot(
            name="text",
            role_type=LITERAL_TEXT,
            required=True,
            description="The claim statement"
        ),
        FrameSlot(
            name="confidence",
            role_type=LITERAL_TEXT,
            required=False,
            description="Certainty level (certain, likely, uncertain)"
        ),
        FrameSlot(
            name="evidence",
            role_type="supporting_evidence",
            required=False,
            is_list=True,
            description="Supporting evidence frames"
        )
    ]
})
```

### Slot System and Validation

The slot system supports two fundamental types of fillers:

**Literal Slots**: Direct values like text, numbers, dates
```python
VALID_LITERAL_TYPES = [
    "literal_text",
    "literal_uri", 
    "literal_number",
    "literal_boolean",
    "literal_date",
    "literal_any"
]
```

**Frame Reference Slots**: References to other frame instances, enabling recursive composition
```python
# Slot validation in app/frames/slots.py
def validate_slot_value(slot: FrameSlot, value: Any, frame_registry: Dict[str, Any]) -> Tuple[bool, str]:
    """Validate a slot value against its schema definition."""
    if slot.role_type in VALID_LITERAL_TYPES:
        return validate_literal_value(slot, value)
    elif slot.role_type in frame_registry:
        return validate_frame_reference(slot, value)
    else:
        return False, f"Unknown role type: {slot.role_type}"
```

## Neo4j Graph Database Implementation

### Atomic Operations Client

The Neo4j client provides atomic operations for graph manipulation with proper serialization and transaction handling:

```python
# app/core/graph/client.py - Core database operations
class Neo4jClient:
    def create_node(self, labels: List[str], properties: Dict[str, Any]) -> str:
        """Create a node with given labels and properties."""
        properties = self._serialize_properties(properties)
        with self.driver.session() as session:
            result = session.run(f"""
                CREATE (n:{':'.join(labels)})
                SET {', '.join(f'n.{k} = ${k}' for k in properties.keys())}
                RETURN n.id as node_id
            """, properties)
            return result.single()["node_id"]
    
    def _serialize_properties(self, properties: Dict[str, Any]) -> Dict[str, Any]:
        """Serialize complex types to JSON strings for Neo4j compatibility."""
        serialized = {}
        for k, v in properties.items():
            if isinstance(v, (dict, list)):
                serialized[k] = json.dumps(v)
            else:
                serialized[k] = v
        return serialized
```

### Graph Search Service

The search service implements multiple search strategies with vector similarity and graph-aware context expansion:

```python
# Graph Service (canonical)
Use `app/core/graph/service.py` (`GraphService`) for all graph operations, including subtree retrieval and graph-aware traversal. The legacy `GraphSearchService` and `app/core/graph/search.py` have been removed.
    def vector_search(self, query: str, index_name: SearchIndex, 
                     k: int = 10, with_parent_info: bool = False) -> List[Dict[str, Any]]:
        """Search using vector similarity with optional context expansion."""
        embedding = self.embedding_generator.embed_query(query)
        
        if with_parent_info:
            # Include parent document/section context and frame relationships
            cypher = """
                CALL db.index.vector.queryNodes($index_name, $k, $embedding)
                YIELD node, score
                WHERE score >= $min_score
                
                // Get parent context
                OPTIONAL MATCH (d:Document)-[:HAS_SECTION]->(s:Section)-[:HAS_FRAME]->(node)
                
                // Get semantically related frames
                OPTIONAL MATCH (node)-[rel:SUPPORTS|ILLUSTRATES|RELATES_TO]-(related:Frame)
                
                RETURN node.*, score, d.title as parent_document_title,
                       s.title as parent_section_title,
                       collect(DISTINCT {id: related.id, relationship: type(rel)}) as related_frames
            """
```

### Vector Index Management

RAGE uses Neo4j's native vector search capabilities with multiple specialized indexes:

```python
class SearchIndex(Enum):
    """Available vector search indexes."""
    DOCUMENTS_RAW = "document_raw"      # Raw document content
    SECTIONS_RAW = "section_raw"        # Section-level content  
    FRAMES_RAW = "frame_raw"           # Individual frame content
    DOCUMENTS_SUMMARY = "document_summary"  # Document summaries
    SECTIONS_SUMMARY = "section_summary"    # Section summaries
    FRAMES_SUMMARY = "frame_summary"        # Frame summaries
```

## Document Processing Pipeline

### Async Processing Architecture

The document ingestion pipeline uses Celery for distributed processing with comprehensive progress tracking:

```python
# app/workers/tasks.py - Background processing
@celery_app.task(bind=True, name="process_document")
def process_document_task(self, document_id: str, content: str, metadata: Dict[str, Any]):
    """Process a document through the complete RAGE."""
    
    # Update task progress
    self.update_state(state="PROCESSING", meta={"stage": "parsing", "progress": 10})
    
    # 1. Parse document structure
    sections = parse_document_sections(content, metadata.get("format", "markdown"))
    
    # 2. Extract frames from each section in parallel
    self.update_state(state="PROCESSING", meta={"stage": "extracting", "progress": 30})
    frame_results = []
    for i, section in enumerate(sections):
        section_frames = extract_frames_from_section(section)
        frame_results.extend(section_frames)
        progress = 30 + (i / len(sections)) * 50
        self.update_state(state="PROCESSING", meta={"stage": "extracting", "progress": progress})
    
    # 3. Store in graph database
    self.update_state(state="PROCESSING", meta={"stage": "storing", "progress": 80})
    store_frames_in_graph(document_id, frame_results)
    
    return {"status": "completed", "frames_extracted": len(frame_results)}
```

### Frame Extraction Process

Frame extraction uses structured output generation with confidence scoring and validation:

```python
# app/core/extract/frames.py - Frame extraction logic
def extract_frames_from_text(text: str, context: Dict[str, Any]) -> List[ExtractedFrame]:
    """Extract frames from text using AI structured outputs."""
    
    # 1. Generate structured output using Pydantic models
    extraction_result = ai_client.create_structured_completion(
        messages=[
            {"role": "system", "content": get_extraction_prompt()},
            {"role": "user", "content": f"Extract frames from: {text}"}
        ],
        response_format=FrameExtractionResult
    )
    
    # 2. Validate each extracted frame
    validated_frames = []
    for frame in extraction_result.frames:
        try:
            # Normalize frame type against registry
            normalized_type = validate_and_normalize_frame_type(frame.frame_type)
            
            # Calculate confidence score
            confidence = calculate_frame_confidence(frame, text, context)
            
            # Create validated frame instance
            validated_frame = ExtractedFrame(
                frame_type=normalized_type,
                slot_values=frame.slot_values,
                confidence_score=confidence,
                source_text_span=frame.source_text_span
            )
            validated_frames.append(validated_frame)
            
        except ValidationError as e:
            logger.warning(f"Frame validation failed: {e}")
            continue
    
    return validated_frames
```

### Confidence Assessment Algorithm

The system implements multi-factor confidence scoring to assess extraction quality:

```python
def calculate_frame_confidence(frame: ExtractedFrame, source_text: str, 
                             context: Dict[str, Any]) -> float:
    """Calculate comprehensive confidence score for extracted frame."""
    
    # Factor 1: Slot completion rate (30% weight)
    schema = FRAME_SCHEMA_REGISTRY[frame.frame_type]
    required_slots = [s for s in schema.slots if s.required]
    filled_required = sum(1 for s in required_slots if s.name in frame.slot_values)
    completion_score = filled_required / len(required_slots) if required_slots else 1.0
    
    # Factor 2: Semantic coherence (40% weight)
    frame_embedding = embedding_generator.embed_text(frame.get_text_content())
    context_embedding = embedding_generator.embed_text(source_text)
    semantic_score = cosine_similarity(frame_embedding, context_embedding)
    
    # Factor 3: Schema fit quality (30% weight)
    schema_score = assess_schema_fit(frame, schema)
    
    # Weighted combination
    confidence = (0.3 * completion_score + 
                 0.4 * semantic_score + 
                 0.3 * schema_score)
    
    return min(max(confidence, 0.0), 1.0)  # Clamp to [0, 1]
```

## API Layer Implementation

### Comprehensive API Endpoint Reference

**Node Access & Retrieval (`/v2/node/`)**

- `GET /v2/node/{node_id}` - **Unified Node Retrieval**
  - Primary endpoint replacing multiple legacy endpoints
  - Flexible field selection with predefined sets: `all`, `basic`, `content`, `metadata`, `semantics`, `relationships`
  - Frame semantics support with slot confidence and relationships
  - Optional embeddings, children, parents, and relationship inclusion
  - Response formats: `semantic` (frame-centric) or `raw` (Neo4j)
  - Query parameters: `fields`, `field_set`, `include_children`, `include_parents`, `include_embeddings`, `include_relationships`, `frame_semantics`, `response_format`

- `GET /v2/node/text/{node_id}` - **Get Node Text** (Deprecated)
  - Legacy endpoint for text content only
  - Replaced by `/v2/node/{id}?fields=text`

- `GET /v2/node/title/{node_id}` - **Get Node Title** (Deprecated)
  - Legacy endpoint for title only
  - Replaced by `/v2/node/{id}?fields=title`

- `GET /v2/node/summary/{node_id}` - **Get Node Summary** (Deprecated)
  - Legacy endpoint for summary only
  - Replaced by `/v2/node/{id}?fields=summary`

**Tree Traversal & Graph Navigation (`/v2/tree/`)**

- `GET /v2/tree/{node_id}` - **Hierarchical Tree Traversal**
  - Unified tree navigation with flexible direction control
  - Traversal directions: `children`, `parents`, `both`, `neighbors`, `root`
  - Depth control (0-20 levels)
  - Node type filtering: `Document`, `Section`, `Frame`, `Chunk`, etc.
  - Relationship type filtering: `CONTAINS`, `SUPPORTS`, `ILLUSTRATES`, `CITES`, etc.
  - Optional embeddings and frame semantics inclusion
  - Query parameters: `direction`, `depth`, `node_types`, `relationship_types`, `include_embeddings`, `frame_semantics`, `limit`

- `GET /v2/tree/children/{node_id}` - **Get Children**
  - Convenience endpoint for child nodes
  - Calls main tree endpoint with `direction=children`
  - Query parameters: `depth` (1-15, default 3)

- `GET /v2/tree/parents/{node_id}` - **Get Parents**
  - Convenience endpoint for parent nodes
  - Calls main tree endpoint with `direction=parents`
  - Query parameters: `depth` (1-15, default 3)

- `GET /v2/tree/neighbors/{node_id}` - **Get Neighbors**
  - Convenience endpoint for immediate neighbors
  - Calls main tree endpoint with `direction=neighbors`

- `GET /v2/tree/root/{node_id}` - **Get Root Path**
  - Convenience endpoint for path to root document
  - Calls main tree endpoint with `direction=root`

**Search & Retrieval (`/v2/search/`)**

- `POST /v2/search/candidates` - **Advanced Vector Search**
  - Unified search endpoint replacing multiple legacy endpoints
  - Search strategies: `vector`, `hybrid`, `graph_aware`, `multi_index`, `semantic`
  - Reranking strategies: `similarity_only`, `confidence_weighted`, `intent_aware`, `balanced`, `comprehensive`
  - Frame type and document filtering
  - Context inclusion and relationship expansion
  - Request body: `UnifiedSearchRequest` with query, strategy, k, filters

- `POST /v2/search/answer` - **AI-Powered Answer Generation**
  - Graph RAG with source attribution
  - Multi-step process: vector search → context assembly → LLM generation → source attribution
  - Search strategies: `vector`, `hybrid`, `graph_aware`, `multi_index`, `semantic`
  - Model options: OpenAI GPT-4o, Anthropic Claude, Meta Llama
  - Optional reasoning traces and confidence scoring
  - Request body: `AnswerRequest` with query, strategy, model, parameters

- `POST /v2/search/semantic` - **Comprehensive Semantic Search**
  - Advanced search with multi-dimensional filtering
  - Custom boost factors for recency, confidence, frame types
  - Graph expansion with configurable depth
  - Pagination support with offset-based navigation
  - Comprehensive analytics and score distributions
  - Request body: `SemanticSearchRequest` with extensive filtering options

- `GET /v2/search/tags` - **Get Tags**
  - All tags with usage counts across the graph
  - Query parameters: `limit` (1-1000, default 100)

- `GET /v2/search/hypernyms` - **Get Hypernyms**
  - All hypernyms with usage counts across the graph
  - Query parameters: `limit` (1-1000, default 100)

- `GET /v2/search/hyponyms` - **Get Hyponyms**
  - All hyponyms with usage counts across the graph
  - Query parameters: `limit` (1-1000, default 100)

**Document Management (`/v2/documents/`)**

- `POST /v2/documents` - **Create Document**
  - Create and process new documents
  - Consolidates legacy document creation functionality
  - Request body: Document data with text, metadata, processing options

- `GET /v2/documents` - **List Documents**
  - List documents with pagination and filtering
  - Query parameters: `page` (default 1), `limit` (default 20)

- `GET /v2/documents/{doc_id}` - **Get Document**
  - Retrieve single document with full details
  - Consolidates legacy document retrieval functionality

**Graph Access (current)**

- Internal services use direct `Neo4jClient` for graph reads/writes (no internal HTTP)
- Public traversal and retrieval via `/v2/tree/{id}` and search endpoints
- Admin scripts under `scripts/admin/maintenance/` use direct client for index and data maintenance

**Writing Assistance (`/v2/writing/`)**

- `POST /v2/writing/complete` - **Text Completion**
  - Generate text completions using knowledge graph context
  - Query parameters: `text` (input text), `context` (optional context)

- `POST /v2/writing/rephrase` - **Text Rephrasing**
  - Rephrase text with different styles and tones
  - Query parameters: `text` (input text), `style` (default "academic")



### Async Endpoint Architecture

The API layer uses FastAPI's async capabilities with proper error handling and response models:

```python
# app/api/endpoints/document/add.py - Document addition endpoint
@router.post("/documents", response_model=DocumentAddResponse)
async def add_document(request: DocumentAddRequest) -> DocumentAddResponse:
    """Add and process a new document."""
    
    try:
        # 1. Validate and deduplicate content
        content_hash = hashlib.sha256(request.content.encode()).hexdigest()
        existing_doc = await check_document_exists(content_hash)
        if existing_doc:
            return DocumentAddResponse(
                document_id=existing_doc.id,
                status="already_exists",
                message="Document already processed"
            )
        
        # 2. Create document record
        document_id = str(uuid.uuid4())
        document = await create_document_record(document_id, request, content_hash)
        
        # 3. Queue background processing
        task = process_document_task.delay(document_id, request.content, request.metadata)
        
        # 4. Return immediate response with task tracking
        return DocumentAddResponse(
            document_id=document_id,
            status="processing",
            task_id=task.id,
            message="Document queued for processing"
        )
        
    except Exception as e:
        logger.error(f"Document addition failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
```

### Request/Response Models

All API operations use Pydantic models for validation and serialization:

```python
# app/api/models/document.py - API data models
class DocumentAddRequest(BaseModel):
    """Request model for adding documents."""
    content: str = Field(..., description="Document content")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Document metadata")
    title: Optional[str] = Field(None, description="Document title")
    format: str = Field("markdown", description="Content format")

class DocumentAddResponse(BaseModel):
    """Response model for document addition."""
    document_id: str = Field(..., description="Unique document identifier")
    status: str = Field(..., description="Processing status")
    task_id: Optional[str] = Field(None, description="Background task ID")
    message: str = Field(..., description="Status message")
    frames_extracted: Optional[int] = Field(None, description="Number of frames extracted")
```

## Embedding and Vector Search

### Embedding Generation Service

The system uses HuggingFace's E5-mistral-7b-instruct model for consistent semantic embeddings:

```python
# app/core/retrieval/embeddings.py - Embedding generation
class EmbeddingGenerator:
    """Service for generating semantic embeddings using HuggingFace models."""
    
    def __init__(self, model_name: str = "intfloat/e5-mistral-7b-instruct"):
        self.model_name = model_name
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model.to(self.device)
    
    def embed_query(self, query: str) -> List[float]:
        """Generate embedding for search query with query prefix."""
        prefixed_query = f"query: {query}"
        return self._generate_embedding(prefixed_query)
    
    def embed_text(self, text: str) -> List[float]:
        """Generate embedding for document text with passage prefix."""
        prefixed_text = f"passage: {text}"
        return self._generate_embedding(prefixed_text)
    
    def _generate_embedding(self, text: str) -> List[float]:
        """Core embedding generation with proper tokenization and pooling."""
        # Tokenize with truncation
        inputs = self.tokenizer(text, return_tensors="pt", truncation=True, 
                               max_length=512, padding=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        # Generate embeddings
        with torch.no_grad():
            outputs = self.model(**inputs)
            
        # Mean pooling with attention mask
        attention_mask = inputs["attention_mask"]
        embeddings = outputs.last_hidden_state
        mask_expanded = attention_mask.unsqueeze(-1).expand(embeddings.size()).float()
        sum_embeddings = torch.sum(embeddings * mask_expanded, 1)
        sum_mask = torch.clamp(mask_expanded.sum(1), min=1e-9)
        
        return (sum_embeddings / sum_mask)[0].cpu().numpy().tolist()
```

### Multi-Index Search Strategy

The retrieval system implements sophisticated search across multiple indexes with result fusion:

```python
# app/core/retrieval/service.py - Multi-index search
class RetrievalService:
    def search_candidates(self, query: str, strategy: str = "multi_index", 
                         k: int = 15) -> List[VectorCandidate]:
        """Search across multiple indexes with intelligent result fusion."""
        
        if strategy == "multi_index":
            # Search both raw content and summaries
            raw_results = self.graph_search.vector_search(
                query, SearchIndex.FRAMES_RAW, k=k, with_parent_info=True
            )
            summary_results = self.graph_search.vector_search(
                query, SearchIndex.FRAMES_SUMMARY, k=k//2
            )
            
            # Combine and deduplicate results
            combined_results = self._merge_search_results(raw_results, summary_results)
            
            # Re-rank using confidence and relationship boosting
            return self._rerank_results(combined_results, query)
        
        else:
            # Single index search
            index = SearchIndex.FRAMES_RAW if strategy == "content" else SearchIndex.FRAMES_SUMMARY
            return self.graph_search.vector_search(query, index, k=k)
    
    def _rerank_results(self, results: List[Dict], query: str) -> List[VectorCandidate]:
        """Re-rank results using multiple factors."""
        candidates = []
        
        for result in results:
            # Base similarity score
            base_score = result["score"]
            
            # Confidence boost
            confidence = result.get("confidence_score", 0.0)
            confidence_boost = confidence * 0.1
            
            # Relationship boost (nodes with more relationships rank higher)
            relationship_count = len(result.get("related_frames", []))
            relationship_boost = min(relationship_count * 0.05, 0.2)
            
            # Frame type boost (certain types are more important for queries)
            frame_type = result.get("schema_id", "")
            type_boost = self._get_frame_type_boost(frame_type, query)
            
            # Combined score
            final_score = base_score + confidence_boost + relationship_boost + type_boost
            
            candidates.append(VectorCandidate(
                id=result["id"],
                score=final_score,
                content=result.get("text", ""),
                metadata=self._extract_metadata(result)
            ))
        
        return sorted(candidates, key=lambda x: x.score, reverse=True)
```

## Performance Optimizations

### Batch Processing

The system implements efficient batch operations for high-throughput scenarios:

```python
# app/core/graph/client.py - Batch operations
def create_nodes_batch(self, nodes: List[Dict[str, Any]]) -> List[str]:
    """Create multiple nodes in a single transaction."""
    node_ids = []
    with self.driver.session() as session:
        with session.begin_transaction() as tx:
            for node_data in nodes:
                # Process each node within the same transaction
                result = tx.run(create_node_query, node_data["properties"])
                node_ids.append(result.single()["node_id"])
            tx.commit()
    return node_ids
```

### Caching Strategy

Redis caching is used for frequently accessed data and expensive computations:

```python
# app/utils/redis.py - Caching implementation  
class CacheManager:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.default_ttl = 3600  # 1 hour
    
    def get_or_compute(self, cache_key: str, compute_func: Callable, ttl: int = None) -> Any:
        """Get from cache or compute and store."""
        cached_value = self.redis.get(cache_key)
        if cached_value:
            return json.loads(cached_value)
        
        # Compute and cache
        value = compute_func()
        self.redis.setex(cache_key, ttl or self.default_ttl, json.dumps(value))
        return value
```

### Connection Pooling and Resource Management

The system implements proper connection pooling and resource cleanup:

```python
# app/config.py - Resource management
class DatabaseConfig:
    def __init__(self):
        self.neo4j_pool_size = int(os.getenv("NEO4J_POOL_SIZE", "50"))
        self.redis_pool_size = int(os.getenv("REDIS_POOL_SIZE", "20"))
    
    def create_neo4j_driver(self) -> Driver:
        return GraphDatabase.driver(
            NEO4J_URI, 
            auth=(NEO4J_USERNAME, NEO4J_PASSWORD),
            max_connection_lifetime=3600,
            max_connection_pool_size=self.neo4j_pool_size,
            connection_acquisition_timeout=60
        )
```

## Error Handling and Monitoring

### Comprehensive Error Handling

The system implements structured error handling with proper logging and recovery:

```python
# app/core/extract/frames.py - Error handling patterns
async def extract_frames_with_retry(text: str, max_retries: int = 3) -> List[ExtractedFrame]:
    """Extract frames with automatic retry on failure."""
    
    for attempt in range(max_retries):
        try:
            return await extract_frames_from_text(text)
            
        except ValidationError as e:
            logger.warning(f"Frame validation failed (attempt {attempt + 1}): {e}")
            if attempt == max_retries - 1:
                # Final attempt - log error and return empty list
                logger.error(f"Frame extraction failed after {max_retries} attempts")
                return []
            
        except Exception as e:
            logger.error(f"Unexpected error in frame extraction: {e}")
            if attempt == max_retries - 1:
                raise
            
        # Exponential backoff
        await asyncio.sleep(2 ** attempt)
```

### Monitoring and Observability

The system includes comprehensive monitoring for production deployment:

```python
# app/core/monitoring.py - Metrics collection
class MetricsCollector:
    def __init__(self):
        self.frame_extraction_counter = Counter("frames_extracted_total")
        self.extraction_duration = Histogram("frame_extraction_duration_seconds")
        self.confidence_scores = Histogram("frame_confidence_scores")
    
    def record_extraction(self, duration: float, frame_count: int, avg_confidence: float):
        """Record extraction metrics."""
        self.frame_extraction_counter.inc(frame_count)
        self.extraction_duration.observe(duration)
        self.confidence_scores.observe(avg_confidence)
```

This technical implementation demonstrates how RAGE combines frame semantics theory with modern software engineering practices to create a scalable, maintainable system for knowledge representation and processing. 