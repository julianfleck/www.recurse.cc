# RAGE Infrastructure

This document describes the containerized infrastructure for the RAGE, including async document processing, task management, and data storage.

## Architecture Overview

The RAGE now supports a microservices architecture with the following components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI App   │    │  Celery Worker  │    │     Redis       │
│  (API Server)   │◄──►│ (Processing)    │◄──►│ (Task Queue)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        
         ▼                        ▼                        
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Neo4j       │    │     Flower      │    │  File Storage   │
│ (Graph DB)      │    │ (Task Monitor)  │    │   (Volumes)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Services

### 1. FastAPI API Server
- **Purpose**: REST API for document management and processing
- **Port**: 8000
- **Endpoints**: 
  - Document CRUD operations
  - Async parsing endpoints (`/document/parse`, `/document/parse/{task_id}/status`)
  - Health checks and monitoring
- **Features**:
  - Hot reloading in development mode
  - Comprehensive API documentation (Swagger/OpenAPI)
  - Error handling and validation

### 2. Celery Worker
- **Purpose**: Background document processing
- **Features**:
  - Async document parsing with progress tracking
  - Configurable concurrency (default: 2 workers)
  - Task cancellation support
  - Automatic retry and error handling
- **Tasks**:
  - `parse_document_async`: Main document processing task
  - `cancel_document_processing`: Task cancellation
  - `cleanup_old_tasks`: Periodic cleanup

### 3. Redis
- **Purpose**: Task queue and result backend
- **Port**: 6379
- **Features**:
  - Task queuing and distribution
  - Progress tracking storage
  - Result caching
  - Persistence (configurable)

### 4. Neo4j Community Edition
- **Purpose**: Graph database with vector search
- **Ports**: 7474 (HTTP), 7687 (Bolt)
- **Features**:
  - Vector indexing (HNSW)
  - APOC procedures
  - Neo4j Browser interface
  - Community edition (free)

### 5. Flower
- **Purpose**: Task monitoring and management UI
- **Port**: 5555
- **Features**:
  - Real-time task monitoring
  - Worker status and statistics
  - Task history and results
  - Web-based dashboard

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Python 3.11+ (for local development)

### Development Mode (Recommended)

1. **Clone and setup**:
```bash
git checkout features/infrastructure
cd trails-rage-pipeline
```

2. **Start infrastructure**:
```bash
python scripts/dev.py start
```

This starts all services with:
- Hot reloading enabled
- Development logging
- Source code mounted as volumes
- Fast Redis configuration

3. **Check status**:
```bash
python scripts/dev.py status
```

4. **View logs**:
```bash
python scripts/dev.py logs api
python scripts/dev.py logs worker --follow
```

5. **Stop infrastructure**:
```bash
python scripts/dev.py stop
```

### Production Mode

```bash
python scripts/dev.py start --prod
```

## API Endpoints

### Async Document Processing

### Complete Workflow

#### 1. Add Document (Get doc_id)
```http
POST /document/add
Content-Type: application/json

{
  "text": "Your document content here",
  "title": "My Research Paper",
  "metadata": {"author": "John Doe", "type": "research"}
}
```

Response:
```json
{
  "id": "a1b2c3d4e5f6g7h8",
  "title": "My Research Paper", 
  "created_at": "2024-01-15T10:30:00Z",
  "has_analysis": false,
  "metadata": {"author": "John Doe", "type": "research"}
}
```

#### 2. Start Async Processing (Use doc_id from step 1)
```http
POST /document/parse
Content-Type: application/json

{
  "doc_id": "a1b2c3d4e5f6g7h8",
  "semantic": true,
  "frames": true,
  "entities": false,
  "embeddings": true,
  "priority": "normal"
}
```

Response:
```json
{
  "task_id": "celery-task-uuid-123",
  "doc_id": "a1b2c3d4e5f6g7h8", 
  "status": "started",
  "message": "Document parsing started for a1b2c3d4e5f6g7h8"
}
```

#### 3. Check Progress (Use task_id from step 2)
```http
GET /document/parse/celery-task-uuid-123/status
```

Response:
```json
{
  "task_id": "celery-task-uuid-123",
  "doc_id": "a1b2c3d4e5f6g7h8",
  "status": "progress",
  "stage": "parsing",
  "current": 5,
  "total": 10,
  "percentage": 50,
  "message": "Parsing section 5/10",
  "estimated_remaining_seconds": 30
}
```

#### 4. Get Results (When completed)
```http
GET /document/a1b2c3d4e5f6g7h8
```

Response:
```json
{
  "id": "a1b2c3d4e5f6g7h8",
  "title": "My Research Paper",
  "has_analysis": true,
  "analysis": {
    "document_frame": {...},
    "semantic_structure": [...],
    "processing_time": 45.2,
    "stats": {...}
  }
}
```

### Additional Endpoints

#### Cancel Processing
```http
DELETE /document/parse/{task_id}/cancel
```

#### Get Active Tasks
```http
GET /document/parse/active
```

## Configuration

### Environment Variables

Create a `.env` file with:

```bash
# Development Settings
DEVELOPMENT_MODE=true

# Celery Configuration  
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Neo4j Configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Worker Configuration
WORKER_CONCURRENCY=2
WORKER_LOGLEVEL=info
```

### Docker Compose Files

- `docker-compose.yml`: Base configuration
- `docker-compose.dev.yml`: Development overrides
- Use together: `docker-compose -f docker-compose.yml -f docker-compose.dev.yml up`

## Processing Stages

The async processing pipeline includes these stages:

1. **Initializing**: Validating document and setup
2. **Parsing**: Document structure analysis  
3. **Chunking**: Breaking into manageable pieces
4. **Semantic Analysis**: Understanding content structure
5. **Frame Extraction**: Extracting structured information
6. **Generating Embeddings**: Creating vector representations
7. **Storing Results**: Persisting analysis results
8. **Completed/Failed/Cancelled**: Final states

## Monitoring and Debugging

### Service URLs

- **API Documentation**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/health
- **Neo4j Browser**: http://localhost:7474
- **Flower Dashboard**: http://localhost:5555
- **Redis CLI**: `redis-cli -h localhost -p 6379`

### Common Commands

```bash
# View all service URLs
python scripts/dev.py urls

# Check service health
python scripts/dev.py status

# View logs
python scripts/dev.py logs api
python scripts/dev.py logs worker
python scripts/dev.py logs redis

# Follow logs in real-time
python scripts/dev.py logs --follow

# Restart services
python scripts/dev.py restart

# Clean up (removes volumes and images)
python scripts/dev.py clean
```

### Debugging Tips

1. **API Issues**: Check `python scripts/dev.py logs api`
2. **Worker Issues**: Check `python scripts/dev.py logs worker`
3. **Task Failures**: Use Flower dashboard at http://localhost:5555
4. **Database Issues**: Use Neo4j Browser at http://localhost:7474
5. **Queue Issues**: Use Redis CLI: `redis-cli -h localhost -p 6379`

## Scaling

### Adding Workers

1. **In Docker Compose**:
```yaml
worker2:
  <<: *worker
  container_name: rage-worker-2
```

2. **Manual scaling**:
```bash
docker-compose up --scale worker=3
```

### Performance Tuning

1. **Worker Concurrency**: Adjust `WORKER_CONCURRENCY` environment variable
2. **Redis Memory**: Configure Redis `maxmemory` settings
3. **Neo4j Memory**: Adjust heap size in docker-compose.yml
4. **API Workers**: Use multiple API instances behind a load balancer

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Check if ports 8000, 6379, 7474, 7687, 5555 are available
2. **Memory Issues**: Ensure Docker has sufficient memory allocated (4GB+ recommended)
3. **Permission Issues**: Ensure proper file permissions for volumes
4. **Network Issues**: Check Docker network configuration

### Recovery

1. **Restart Services**: `python scripts/dev.py restart`
2. **Clean Start**: `python scripts/dev.py clean && python scripts/dev.py start`
3. **Check Logs**: `python scripts/dev.py logs --follow`
4. **Reset Neo4j**: Remove neo4j_data volume and restart

## Migration from File-based Storage

The infrastructure supports both file-based storage (current) and Neo4j storage (future). The migration path:

1. **Phase 1**: Async processing with file storage (current)
2. **Phase 2**: Hybrid storage (files + Neo4j metadata)
3. **Phase 3**: Full Neo4j storage with vector search
4. **Phase 4**: Graph-based document relationships

## Next Steps

1. **Neo4j Integration**: Implement graph storage for documents and relationships
2. **Vector Search**: Add embedding-based document search
3. **Monitoring**: Add Prometheus/Grafana monitoring
4. **Security**: Add authentication and authorization
5. **Performance**: Implement caching and optimization strategies 