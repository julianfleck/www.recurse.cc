# Search API Documentation

## Overview

The RAGE search API provides a unified search interface with token-based query syntax and direct parameter support. It currently supports:

- **Direct ID Lookup**: Retrieve specific nodes by ID (single or multiple)
- **Content Semantic Search**: Vector-based similarity search across content
- **Combined Search**: Semantic search with structural filters (type, tag, etc.)
- **Structural Search**: Property-based filtering and pattern matching
- **Metadata Integration**: Tags, hypernyms, and hyponyms included in responses

**Key Features:**
- Token-based query syntax (`type:Frame`, `tag:ai`, `semantic:neural`)
- Direct parameter support (`id=node123`, `ids=id1,id2,id3`)
- ID lookup takes precedence over search queries
- Multiple field sets for controlling response payload
- Graph traversal with depth control for hierarchical retrieval
- Case-insensitive glob pattern matching
- Qualified type formatting in responses (`Frame:claim`, `Document:article`, etc.)
- Type alias support in filters (`type:doc` → `Document`, `type:sec` → `Section`)
- Comprehensive metadata denormalization
- Quoted, multi-word filter values (e.g., `title:"ephemeral interfaces" author:"john doe"`)
- Unified comprehensive reranking with weighted scoring and metadata/title/summary affinity boosts
- Built-in pagination with configurable page size and navigation metadata

## Query Syntax

Queries use space-separated tokens with `key:value` format:

```
type:claim tag:ai semantic:neural depth:2
```

Quoted values are supported for multi-word filters and semantic terms:

```
title:"ephemeral interfaces" author:"john doe" semantic:"artificial intelligence" type:Frame
```

## Direct Parameters

For convenience, you can also use direct query parameters:

### Single ID Lookup
- `id=f8f052784ef204ddc282df2cac2f00ad325be1d0a7c8a40f59b60645649e9fa4` - Direct ID parameter

### Multiple IDs Lookup
- `ids=id1,id2,id3` - Comma-separated list of IDs

### Parameter Priority
**Important**: When `id` or `ids` parameters are provided, they take precedence over the `query` parameter. The system will retrieve the specified node(s) and ignore any search query tokens.

### Combining with Other Parameters
- `id=node123&depth=2&field_set=metadata` - ID lookup with depth and field selection
- `ids=id1,id2&id=id3&depth=1` - Combined single and multiple ID lookup

## Supported Tokens

### Direct Lookup
- `id:node123` - Exact content node ID lookup

### Property Filters
- `title:*neural*` or `title:"ephemeral interfaces"` - Title matching (case-insensitive; supports wildcards and quotes)
- `source:arxiv` - Source filtering
- `author:smith` or `author:"john doe"` - Author filtering (supports quotes)

### Structural Filters
- `type:Frame` - Node type filtering (Frame, Document, Section)
- `type:*claim*` - Wildcard type matching
- `depth:2` - Graph traversal depth

Alias mapping for convenience:
- `type:doc`, `type:docs`, `type:article` → `type:Document`
- `type:sec`, `type:section`, `type:sect` → `type:Section`

### Metadata Filters
- `tag:machine_learning` or `tag:"user experience"` - Tag filtering (supports quotes)
- `tag:*ai*` - Wildcard tag matching
- `hypernym:technology` - Hypernym filtering
- `hyponym:neural_network` - Hyponym filtering

### Semantic Search
- `semantic:natural language query` or `semantic:"artificial intelligence"` - Vector similarity search
- `ephemeral interfaces` - Unrecognized tokens become semantic search terms (combined into one semantic string)

## Field Sets

Control what data is returned using the `field_set` parameter. Each field set includes different combinations of fields to balance between data richness and response size/performance.

### Field Set Comparison

| Field Set | Included Fields | Use Case | Response Size | Performance |
|-----------|----------------|----------|---------------|-------------|
| **`basic`** | `id`, `title`, `summary`, `type` | Quick browsing, search results lists | Smallest | Fastest |
| **`content`** | `id`, `title`, `text`, `summary`, `description`, `type` | Reading content, detailed search results | Medium | Medium |
| **`metadata`** | `id`, `title`, `created_at`, `updated_at`, `tags[]`, `hypernyms[]`, `hyponyms[]`, `source`, `type` | Analysis, filtering by metadata, content discovery | Large | Medium |
| **`all`** | All available fields | Complete data export, debugging | Largest | Slowest |

### Field Set Details

#### Basic Fields (All Field Sets)
- `id` - Unique node identifier
- `title` - Human-readable title
- `type` - Node type (Frame, Document, Section, etc.)

#### Content Fields
- `text` - Full text content of the node
- `summary` - AI-generated summary (when available)
- `description` - Additional descriptive text

#### Metadata Fields
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `tags[]` - Associated tags as array
- `hypernyms[]` - Broader category terms
- `hyponyms[]` - Narrower category terms
- `source` - Source attribution



### Field Set Recommendations

| Scenario | Recommended Field Set | Why |
|----------|----------------------|-----|
| **Search Results List** | `basic` | Fast loading, minimal data |
| **Reading Content** | `content` | Includes full text for reading |
| **Content Analysis** | `metadata` | Access to tags, timestamps, categorization |
| **Data Export** | `all` | Complete dataset for analysis |

### Field Set Behavior Notes

- **Inheritance**: All field sets include the basic fields (`id`, `title`, `type`)
- **Arrays**: Metadata fields like `tags[]`, `hypernyms[]`, `hyponyms[]` are returned as arrays
- **Conditional Fields**: Some fields (like `slots`, `confidence_score`) only appear for specific node types
- **Depth Interaction**: When `depth > 0`, child nodes inherit the same field set behavior
- **Performance**: Larger field sets require more database queries and increase response size

## Pagination

The search API includes built-in pagination to handle large result sets efficiently:

### Pagination Parameters

- `page` (integer, default: 1) - Page number (1-based)
- `limit` (integer, default: 20, max: 1000) - Number of results per page

### Pagination Response Metadata

Each search response includes a `pagination` object with navigation information:

```json
{
  "query": "type:Frame tag:ai",
  "nodes": [...],
  "total_found": 150,
  "search_time_ms": 125.0,
  "pagination": {
    "page": 2,
    "limit": 20,
    "total_count": 150,
    "total_pages": 8,
    "has_next": true,
    "has_previous": true
  }
}
```

Note: Pagination applies to top-level results only. When `depth > 0`, children are included under each root result and are not paginated.

### Pagination Fields

| Field | Type | Description |
|-------|------|-------------|
| `page` | integer | Current page number (1-based) |
| `limit` | integer | Number of results per page |
| `total_count` | integer | Total number of matching results |
| `total_pages` | integer | Total number of pages available |
| `has_next` | boolean | Whether there are more results after current page |
| `has_previous` | boolean | Whether there are results before current page |

### Pagination Examples

**First page with default limit:**
```bash
GET /search/?query=type:Frame&field_set=basic
```

**Specific page with custom limit:**
```bash
GET /search/?query=tag:ai&page=3&limit=50
```

**Last page navigation:**
```bash
GET /search/?query=semantic:neural&page=5&limit=10
```

### Best Practices for Pagination

- **Start with smaller limits** for faster initial responses (default 20 is recommended)
- **Use page navigation** instead of offset-based pagination for better performance
- **Check `has_next`/`has_previous`** to build navigation UI
- **Monitor `total_count`** to show result counts to users
- **Consider `total_pages`** for progress indicators

## Match Types

The `match_type` field in search results indicates how each result was found. This helps users understand the search strategy that led to each match:

### Available Match Types

| Match Type | Description | When It Appears | Example Use Case |
|------------|-------------|-----------------|------------------|
| **`concept_match`** | Found through semantic similarity search using vector embeddings | Pure semantic queries or combined searches | `"ephemeral interfaces"` → finds conceptually related content about temporary software |
| **`matched_by_summary`** | Found by searching within AI-generated summaries of content | Summary-optimized searches | Searching for concepts in content summaries |
| **`quick_search`** | Found using fast vector similarity without full semantic analysis | Optimized for speed over precision | Rapid scanning of large datasets |
| **`related_match`** | Found through score propagation from related nodes | When child nodes match and boost parent scores | Related content identified via hierarchical relationships |
| **`search_match`** | Generic fallback match type for any search method | Unknown or unspecified match methods | Catch-all for new search algorithms |

### Match Type Examples

#### Example: Concept Match
```json
{
  "id": "frame456",
  "title": "Interfaces Adapting to Thinking",
  "type": "Frame:thesis",
  "similarity": 0.843,
  "match_type": "concept_match"
}
```
*Found because the content conceptually relates to "ephemeral interfaces"*

#### Example: Summary Match
```json
{
  "id": "section123",
  "title": "Ephemeral Interfaces: When Software Materializes on Demand",
  "type": "Section",
  "similarity": 0.912,
  "match_type": "matched_by_summary"
}
```
*Found because the AI-generated summary contained relevant concepts*

#### Example: Related Match
```json
{
  "id": "frame789",
  "title": "Supporting Evidence for Interface Adaptation",
  "type": "Frame:evidence",
  "similarity": 0.756,
  "match_type": "related_match"
}
```
*Found because it's a parent node boosted by semantically matching child content*

### Understanding Match Types for Better Results

- **Higher similarity scores with `concept_match`**: Indicates strong semantic relevance
- **`matched_by_summary`** results: May be less detailed but highly relevant to the core concept
- **`related_match`** results: Parent nodes boosted by semantically matching children, indicating hierarchical relevance
- **Mix of match types**: Normal for comprehensive search results

The match type helps you interpret why each result was included and assess its relevance to your specific search intent.

## Search Scenarios

### 0. Direct ID Lookup

#### Example: Single ID lookup
**Request:**
```bash
GET /search/?id=f8f052784ef204ddc282df2cac2f00ad325be1d0a7c8a40f59b60645649e9fa4&field_set=metadata
```

**Response:**
```json
{
  "query": "id:f8f052784ef204ddc282df2cac2f00ad325be1d0a7c8a40f59b60645649e9fa4",
  "nodes": [
    {
      "id": "f8f052784ef204ddc282df2cac2f00ad325be1d0a7c8a40f59b60645649e9fa4",
      "title": "Setting the Stage for Implementation",
      "type": "Section",
      "created_at": "2025-08-25T13:06:33.078809",
      "updated_at": "2025-08-25T13:06:33.078809",
      "tags": ["implementation", "ephemeral interfaces"],
      "hypernyms": ["software development"],
      "hyponyms": ["prototyping", "deployment"]
    }
  ],
  "total_found": 1,
  "search_time_ms": 12.3,
  "filters_applied": ["id"]
}
```

#### Example: Multiple IDs lookup
**Request:**
```bash
GET /search/?ids=id1,id2,id3&depth=1&field_set=content
```

**Response:**
```json
{
  "query": "ids:id1,id2,id3",
  "nodes": [
    {
      "id": "id1",
      "title": "Thesis on Ephemeral Interfaces",
      "type": "Frame:thesis",
      "text": "The central argument that interfaces should adapt to cognitive processes...",
      "children": [
        {
          "id": "child1",
          "title": "Supporting Evidence",
          "type": "Frame:evidence"
        }
      ]
    },
    {
      "id": "id2",
      "title": "Implementation Strategy",
      "type": "Frame:method",
      "text": "Our approach involves three key phases..."
    }
  ],
  "total_found": 2,
  "search_time_ms": 23.1,
  "filters_applied": ["id"]
}
```

#### Example: ID lookup with depth (hierarchical retrieval)
**Request:**
```bash
GET /search/?id=parent123&depth=3&field_set=metadata
```

**Response:**
```json
{
  "query": "id:parent123",
  "nodes": [
    {
      "id": "parent123",
      "title": "Main Research Framework",
      "type": "Frame:thesis",
      "created_at": "2025-08-25T13:01:19.697969",
      "updated_at": "2025-08-25T13:01:19.697969",
      "tags": ["ephemeral interfaces", "cognitive science"],
      "children": [
        {
          "id": "child1",
          "title": "Theoretical Foundation",
          "type": "Frame:evidence",
          "children": [
            {
              "id": "grandchild1",
              "title": "Cognitive Load Analysis",
              "type": "Frame:analysis"
            }
          ]
        }
      ]
    }
  ],
  "total_found": 1,
  "search_time_ms": 45.7,
  "filters_applied": ["id"]
}
```

### 1. Basic Structural Search

#### Example: Find all claim frames
**Request:**
```bash
GET /search/?query=type:claim&field_set=basic&page=1&limit=10
```

**Response:**
```json
{
  "query": "type:claim",
  "nodes": [
    {
      "id": "abc123",
      "title": "Ephemeral Interfaces Enable Fluid Thinking",
      "type": "Frame:claim",
      "summary": "The central argument that interfaces should adapt to cognitive processes"
    }
  ],
  "total_found": 1,
  "search_time_ms": 45.2,
  "filters_applied": ["type"],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_count": 1,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

#### Example: Find content with AI tags (paginated)
**Request:**
```bash
GET /search/?query=tag:*ai*&field_set=metadata&page=1&limit=5
```

**Response:**
```json
{
  "query": "tag:*ai*",
  "nodes": [
    {
      "id": "frame123",
      "title": "AI-Powered Interface Adaptation",
      "type": "Frame:method",
      "created_at": "2025-08-25T13:06:33.078809",
      "updated_at": "2025-08-25T13:06:33.078809",
      "tags": ["ai", "machine learning", "interfaces"],
      "hypernyms": ["artificial intelligence", "human-computer interaction"],
      "hyponyms": ["neural networks", "adaptive systems"]
    }
  ],
  "total_found": 1,
  "search_time_ms": 32.1,
  "filters_applied": ["tag"],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total_count": 1,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

### 2. Semantic Search

#### Example: Pure semantic search
**Request:**
```bash
GET /search/?query=semantic:"ephemeral interfaces"&field_set=content&limit=10
```

**Response:**
```json
{
  "query": "semantic:ephemeral interfaces",
  "nodes": [
    {
      "id": "frame456",
      "title": "Interfaces Adapting to Thinking",
      "type": "Frame:thesis",
      "text": "But beneath these surface shifts lies a deeper transformation...",
      "summary": "The central argument that interfaces evolve to support cognition",
      "similarity": 0.843,
      "weighted_score": 1.267,
      "match_type": "semantic",
      "confidence_score": 0.85
    }
  ],
  "total_found": 1,
  "search_time_ms": 125.7,
  "filters_applied": ["semantic"]
}
```

#### Example: Semantic search with automatic fallback
When semantic search returns no results, the system automatically falls back to text-based search:

**Request:**
```bash
GET /search/?query=semantic:cognitive substrate&field_set=metadata&limit=5
```

**Response:** (if semantic search fails, falls back to text search for "cognitive substrate")
```json
{
  "query": "semantic:cognitive substrate",
  "nodes": [
    {
      "id": "frame789",
      "title": "Need for Sophisticated Cognitive Substrate",
      "type": "Frame:thesis",
      "tags": ["cognitive substrate", "ephemeral interfaces"],
      "hypernyms": ["cognitive science", "human-computer interaction"]
    }
  ],
  "total_found": 1,
  "search_time_ms": 78.3,
  "filters_applied": ["semantic"]
}
```

### 3. Combined Semantic + Filter Search

#### Example: Semantic search filtered by type
**Request:**
```bash
GET /search/?query=type:claim ephemeral&field_set=metadata&depth=1&limit=10
```

**Response:**
```json
{
  "query": "type:claim ephemeral",
  "nodes": [
    {
      "id": "frame111",
      "title": "Ephemeral Interfaces Enable Fluid Thinking",
      "type": "Frame:claim",
      "created_at": "2025-08-25T13:01:19.697969",
      "updated_at": "2025-08-25T13:01:19.697969",
      "tags": ["ephemeral interfaces", "cognitive fluidity"],
      "hypernyms": ["human-computer interaction"],
      "hyponyms": ["adaptive interfaces", "context-aware systems"],
      "children": [
        {
          "id": "frame112",
          "title": "Systems Generating Content and Interfaces",
          "type": "Frame:claim",
          "tags": ["ai", "interface generation"],
          "hypernyms": ["artificial intelligence"]
        }
      ]
    }
  ],
  "total_found": 1,
  "search_time_ms": 156.8,
  "filters_applied": ["type", "semantic"]
}
```

#### Example: Semantic search filtered by tags
**Request:**
```bash
GET /search/?query=tag:ai semantic:neural networks&field_set=content&limit=15
```

**Response:**
```json
{
  "query": "tag:ai semantic:neural networks",
  "nodes": [
    {
      "id": "frame222",
      "title": "Neural Processing Methods",
      "type": "Frame:method",
      "text": "Advanced techniques for processing neural network architectures...",
      "summary": "Analysis of neural processing methodologies",
      "tags": ["ai", "neural networks", "machine learning"]
    }
  ],
  "total_found": 1,
  "search_time_ms": 134.2,
  "filters_applied": ["tag", "semantic"]
}
```

#### Example: Complex multi-filter search
**Request:**
```bash
GET /search/?query=type:Frame tag:machine_learning hypernym:technology semantic:algorithms&field_set=metadata&depth=2&limit=20
```

**Response:**
```json
{
  "query": "type:Frame tag:machine_learning hypernym:technology semantic:algorithms",
  "nodes": [
    {
      "id": "frame333",
      "title": "Algorithmic Approaches in Machine Learning",
      "type": "Frame:method",
      "created_at": "2025-08-25T14:22:11.445123",
      "updated_at": "2025-08-25T14:22:11.445123",
      "tags": ["machine learning", "algorithms", "optimization"],
      "hypernyms": ["computer science", "artificial intelligence", "technology"],
      "hyponyms": ["gradient descent", "neural networks", "decision trees"]
    }
  ],
  "total_found": 1,
  "search_time_ms": 203.7,
  "filters_applied": ["type", "tag", "hypernym", "semantic"]
}
```

## Depth Traversal

Use `depth` parameter to include child nodes in the response:

- `depth=0` - No children (default)
- `depth=1` - Include direct children
- `depth=2` - Include children and grandchildren
- `depth=5` - Maximum depth

**Example with depth:**
```bash
GET /search/?query=type:thesis&field_set=metadata&depth=2&limit=5
```

## Wildcard Support

Wildcards (`*`, `?`) are supported in most filter types:

- `tag:*ai*` - Tags containing "ai"
- `type:*claim*` - Types containing "claim"
- `title:neural*` - Titles starting with "neural"
- `hypernym:tech*` - Hypernyms starting with "tech"

## Token Processing Rules

1. **Recognized tokens** use `key:value` with optional quotes for multi-word values
2. **Unrecognized tokens** are treated as free-text and combined into a single semantic query string
3. **Multiple semantic terms** are combined: `ephemeral interfaces` → `semantic:ephemeral interfaces`
4. **Quoted filters** are supported: `title:"ephemeral interfaces" author:"john doe"`
5. **Order doesn't matter**: `type:claim ephemeral` = `ephemeral type:claim`

## Error Handling

The API provides graceful fallbacks:

- **Semantic search failure**: Automatically falls back to text-based search
- **Invalid tokens**: Ignored with warning logged
- **Database errors**: Return appropriate error responses
- **Empty results**: Return structured response with `total_found: 0`

## Performance Considerations

- Semantic search may be slower due to vector similarity calculations
- Combined searches expand candidate sets before filtering
- Use `limit` parameter to control response size
- Deeper traversal (`depth > 1`) increases response complexity

## Field Set Behavior

### metadata Field Set Special Behavior
When `field_set=metadata` is used:
- **Always includes** `tags[]`, `hypernyms[]`, `hyponyms[]` arrays
- **Includes** basic metadata fields (created_at, updated_at, source)
- **Excludes** content fields (text, description) unless specifically requested

## Ranking and Boosting

All results are re-ranked using a single comprehensive strategy and then sorted by `weighted_score`:

- Base score: vector `similarity`
- Confidence boost: from frame slot confidence (when applicable)
- Intent/fuzzy boosts: intent vs. frame type, and fuzzy similarity for frame types
- Affinity boost (metadata/title/summary):
  - Full-string Levenshtein similarity over `title`, `summary`, and metadata values (`tags`, `hypernyms`, `hyponyms`)
  - Token-level matching on metadata values (e.g., query `AI` boosts tag `AI Interfaces`)
- Match-type bonus: small preference for certain semantic match routes

The final `weighted_score` reflects these boosts and is used for ordering.

### Minimum Similarity Threshold

Use `min_score` to filter out low-quality semantic matches (0.0–1.0). The service applies a conservative floor internally and respects a higher client-provided value.

### Tree Expansion
When `depth > 0`:
- Child nodes are fetched separately
- Child nodes inherit the same `field_set` behavior
- Child nodes include their own direct metadata if present (e.g., tags attached to the child). For performance, traversal-based metadata aggregation for children is not performed.

## Response Structure

All responses follow this structure:

```json
{
  "query": "original query string",
  "nodes": [
    {
      // Node data based on field_set
      "id": "node_id",
      "title": "Node Title",
      "type": "Frame:thesis",
      // ... other fields based on field_set
    }
  ],
  "total_found": 5,
  "search_time_ms": 123.4,
  "filters_applied": ["type", "semantic"],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total_count": 5,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

## Best Practices

1. **Use direct ID parameters** for specific node retrieval - faster than search queries
2. **Use specific field sets** to reduce response size
3. **Combine semantic + filters** for refined results
4. **Use depth judiciously** - deeper traversal increases complexity
5. **Leverage wildcards** for flexible matching
6. **Check `filters_applied`** to verify query processing
7. **Remember parameter priority** - ID parameters override search queries
8. **Start with smaller page limits** for faster initial responses (default 20 is recommended)
9. **Use pagination metadata** (`has_next`, `has_previous`) to build navigation UI
10. **Monitor `total_count`** to show result counts and build progress indicators

## Troubleshooting

### Common Issues

**ID lookup not working as expected:**
- Remember that `id`/`ids` parameters take precedence over `query` parameter
- If both are provided, only the ID lookup will be performed
- Check that the node ID exists in the database

**Empty results for valid queries:**
- Check if semantic search is falling back to text search
- Verify field_set compatibility
- Check database connectivity
- If using `id`/`ids` parameters, verify the nodes exist

**Slow responses:**
- Reduce depth parameter
- Use more specific filters
- Consider using `limit` parameter
- For multiple IDs, consider batching requests if performance is an issue

**Missing metadata arrays:**
- Ensure `field_set=metadata` is used
- Check if nodes have associated metadata relationships
- Verify tree expansion is working correctly

**Pagination not working as expected:**
- Check that `page` parameter is 1-based (starts at 1, not 0)
- Verify `limit` is within valid range (1-1000)
- Ensure you're using the `pagination` object from the response, not calculating manually
- Check `total_pages` to see if there are actually multiple pages

**Query being ignored:**
- If `id` or `ids` parameters are provided, the `query` parameter is ignored
- This is by design - ID lookup takes precedence over search queries

**Unexpected page results:**
- Remember that results are sorted by relevance/score, not by creation date
- Different queries may return different results even with same pagination parameters
- Use consistent sorting criteria if deterministic pagination is needed