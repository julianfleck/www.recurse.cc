# Search API Restructure Recommendations

> **Status**: Proposal  
> **Created**: 2025-12-05  
> **Context**: The current `/search` API response structure is difficult to work with in the graph view component. This document proposes a cleaner, more intuitive structure.

## Problem Statement

The current API returns a nested `document` + `citations` structure where:
- The document metadata is separate from the node structure
- Children are nested inside a "self-reference" citation (first citation has same ID as document)
- `citations` naming doesn't make sense in a graph/tree context
- Type prefixes like `Document:article` and `Frame:section` require normalization

This structure requires complex transformation logic and is error-prone.

## Proposed Solution

Use a simple, recursive node structure where every node follows the same pattern:

```
Node {
  id, title, type, summary, metadata, children: Node[]
}
```

---

## Recommended Response Structures

### 1. List Documents: `GET /search/document`

Returns all documents with their tree structure up to the specified depth.

**Request:**
```
GET /search/document?depth=2&limit=10&page=1&field_set=metadata
```

**Response:**
```json
{
  "query": "type:document",
  "nodes": [
    {
      "id": "1450edd1ad2fa0970fa785301f88843854215b16b0b396e3707769d92afd095c",
      "title": "Low-Code Development Platforms: A Comprehensive Review",
      "type": "document",
      "summary": "Low-code development platforms facilitate application creation with minimal coding...",
      "created_at": "2025-12-05T06:05:06.605451",
      "updated_at": "2025-12-05T06:05:06.605451",
      "url": null,
      "metadata": {
        "tags": ["low-code", "development platforms", "Microsoft Power Apps"],
        "hypernyms": [],
        "hyponyms": []
      },
      "children": [
        {
          "id": "1e5d2d7ca7266a099b319f96581dbb6a39945d6c902a4d6b71fc548b01242882",
          "title": "What is Low-Code?",
          "type": "section",
          "summary": "Low-code development platforms are defined as tools that enable users to create applications...",
          "index": 0,
          "metadata": {
            "tags": [],
            "hypernyms": [],
            "hyponyms": []
          },
          "children": []
        },
        {
          "id": "c532718876315973902353cd8c5c8fed6a5dc96c26a6c673b21d2fe0e9ed4927",
          "title": "Mendix",
          "type": "section",
          "summary": "Mendix is presented as an effective platform for fostering collaboration...",
          "index": 1,
          "metadata": {
            "tags": ["mendix", "collaboration"],
            "hypernyms": [],
            "hyponyms": []
          },
          "children": [
            {
              "id": "nested-child-id",
              "title": "Governance Features",
              "type": "subsection",
              "summary": "...",
              "index": 0,
              "children": []
            }
          ]
        }
      ]
    }
  ],
  "total_found": 10,
  "search_time_ms": 45.2,
  "filters_applied": ["type"],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_count": 10,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

---

### 2. Get Specific Node: `GET /search?id=X`

Returns a specific node with its children up to the specified depth.

**Request:**
```
GET /search?id=1450edd1ad2fa...&depth=1&field_set=metadata
```

**Response:**
```json
{
  "query": "id:1450edd1ad2fa...",
  "nodes": [
    {
      "id": "1450edd1ad2fa0970fa785301f88843854215b16b0b396e3707769d92afd095c",
      "title": "Low-Code Development Platforms: A Comprehensive Review",
      "type": "document",
      "summary": "...",
      "created_at": "2025-12-05T06:05:06.605451",
      "metadata": {
        "tags": ["low-code", "development platforms"],
        "hypernyms": [],
        "hyponyms": []
      },
      "children": [
        {
          "id": "1e5d2d7ca726...",
          "title": "What is Low-Code?",
          "type": "section",
          "summary": "...",
          "index": 0,
          "children": []
        },
        {
          "id": "c532718876315...",
          "title": "Mendix",
          "type": "section",
          "summary": "...",
          "index": 1,
          "children": []
        }
      ]
    }
  ],
  "total_found": 1,
  "search_time_ms": 12.5
}
```

---

### 3. Search with Query: `GET /search?query=X`

Returns nodes matching the search query, with optional children based on depth.

**Request:**
```
GET /search?query=low-code&depth=1&limit=10
```

**Response:**
```json
{
  "query": "low-code",
  "nodes": [
    {
      "id": "section-mendix",
      "title": "Mendix",
      "type": "section",
      "summary": "Mendix is presented as an effective platform...",
      "score": 0.95,
      "index": 1,
      "parent_id": "doc-lowcode",
      "metadata": {
        "tags": ["mendix"],
        "hypernyms": [],
        "hyponyms": []
      },
      "children": [
        {
          "id": "subsec-governance",
          "title": "Governance Features",
          "type": "subsection",
          "summary": "...",
          "index": 0,
          "children": []
        }
      ]
    },
    {
      "id": "doc-lowcode",
      "title": "Low-Code Development Platforms",
      "type": "document",
      "summary": "Low-code development platforms facilitate...",
      "score": 0.87,
      "parent_id": null,
      "metadata": {
        "tags": ["low-code", "development platforms"],
        "hypernyms": [],
        "hyponyms": []
      },
      "children": [
        {
          "id": "section-intro",
          "title": "What is Low-Code?",
          "type": "section",
          "summary": "...",
          "index": 0,
          "children": []
        }
      ]
    }
  ],
  "total_found": 2,
  "search_time_ms": 45.2,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_count": 2,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

---

### 4. Optional: Include Ancestors

For richer context in search results, support an `include_ancestors=true` parameter:

**Request:**
```
GET /search?query=governance&include_ancestors=true
```

**Response:**
```json
{
  "query": "governance",
  "nodes": [
    {
      "id": "subsec-governance",
      "title": "Governance Features",
      "type": "subsection",
      "score": 0.98,
      "parent_id": "section-mendix",
      "children": [],
      "ancestors": [
        {
          "id": "section-mendix",
          "title": "Mendix",
          "type": "section",
          "parent_id": "doc-lowcode"
        },
        {
          "id": "doc-lowcode",
          "title": "Low-Code Development Platforms",
          "type": "document",
          "parent_id": null
        }
      ]
    }
  ]
}
```

---

## Node Schema

Every node follows this consistent structure:

```typescript
interface Node {
  // Required fields
  id: string;                    // Unique identifier (hash)
  title: string;                 // Display title
  type: string;                  // Node type (see Type Values below)
  
  // Optional fields
  summary?: string;              // Brief description/summary
  created_at?: string;           // ISO 8601 timestamp
  updated_at?: string;           // ISO 8601 timestamp
  url?: string;                  // Source URL if applicable
  index?: number;                // Position among siblings (for ordering)
  parent_id?: string;            // Parent node ID (null for root documents)
  score?: number;                // Search relevance score (0-1, only in search results)
  
  // Metadata
  metadata?: {
    tags?: string[];             // Associated tags
    hypernyms?: string[];        // Broader concepts
    hyponyms?: string[];         // Narrower concepts
  };
  
  // Recursive structure
  children?: Node[];             // Child nodes (based on depth parameter)
  ancestors?: Node[];            // Parent chain (only with include_ancestors=true)
}
```

---

## Type Values

Use simple, lowercase type values without prefixes:

| Current (Problematic) | Recommended |
|-----------------------|-------------|
| `Document:article` | `document` or `article` |
| `Document:technical_documentation` | `document` or `technical_documentation` |
| `Frame:section` | `section` |
| `Frame:subsection` | `subsection` |

**Recommended type values:**
- `document` - Root document node
- `article` - Article-type document
- `section` - Major section within a document
- `subsection` - Subsection within a section
- `paragraph` - Paragraph-level content
- `definition` - Definition frame
- `claim` - Claim/argument frame
- `evidence` - Evidence frame
- `example` - Example frame
- `insight` - Insight frame

---

## Depth Parameter Behavior

| Depth | Result |
|-------|--------|
| `depth=0` | Node only, `children: []` |
| `depth=1` | Node + direct children |
| `depth=2` | Node + children + grandchildren |
| `depth=N` | Node + descendants up to N levels deep |

---

## Migration Checklist

### Backend Changes

- [ ] Flatten `document` + `citations` into single node structure
- [ ] Rename `citations` to `children`
- [ ] Remove self-reference nodes (first citation with same ID as document)
- [ ] Normalize type values (remove `Document:`, `Frame:` prefixes)
- [ ] Rename `added_at` to `created_at` for consistency
- [ ] Rename `section_index` to `index` for consistency
- [ ] Ensure `children` is always an array (empty `[]` if no children)
- [ ] Add `parent_id` field to non-root nodes
- [ ] Add `score` field for search results
- [ ] Implement `include_ancestors` parameter (optional)

### Frontend Changes

Once the API returns the new structure, the frontend code simplifies significantly:

- [ ] Remove `DocumentCitationNode` type handling
- [ ] Remove self-reference filtering logic
- [ ] Remove type normalization (`Document:article` → `document`)
- [ ] Use single `walk()` function for all API responses
- [ ] The existing `loadFromJSON()` logic will work for API responses

---

## Benefits

1. **Simplicity**: One node structure for everything
2. **Consistency**: Same fields at every level
3. **No Self-References**: The document IS the node
4. **Direct Access**: `node.children` gives children immediately
5. **Recursive**: Structure mirrors actual document hierarchy
6. **Frontend Compatibility**: Matches existing example graph format
7. **Easier Debugging**: Clear, predictable structure

---

## Example: Current vs Proposed

### Current Structure (Problematic)

```json
{
  "nodes": [
    {
      "document": {
        "id": "doc-123",
        "title": "My Document",
        "type": "article"
      },
      "citations": [
        {
          "citation_index": 1,
          "id": "doc-123",
          "title": "My Document",
          "type": "Document:article",
          "children": [
            {
              "citation_index": 2,
              "id": "sec-1",
              "title": "Section 1",
              "type": "Frame:section"
            }
          ]
        }
      ]
    }
  ]
}
```

### Proposed Structure (Clean)

```json
{
  "nodes": [
    {
      "id": "doc-123",
      "title": "My Document",
      "type": "document",
      "children": [
        {
          "id": "sec-1",
          "title": "Section 1",
          "type": "section",
          "index": 0,
          "children": []
        }
      ]
    }
  ]
}
```

---

## Questions for Backend Team

1. Is there a reason for the current `document` + `citations` separation?
2. Are there other consumers of this API that depend on the current structure?
3. Can we version the API (`/v2/search`) to avoid breaking existing clients?
4. What's the timeline for implementing these changes?

