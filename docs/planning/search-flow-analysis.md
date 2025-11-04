# Search Flow Analysis & Proposal

## Current Problems

### 1. **Competing Rendering Systems**
- **CommandItem** (`KnowledgeBaseResults`): Flat list using `CommandItem` - fast, simple
- **AccordionMenu** (`ContentTree`): Nested hierarchy using `AccordionMenu` - complex, hierarchical
- Both systems exist but serve different purposes but are being used inconsistently

### 2. **Data Flow Issues**
- **Static Pages**: Instant results via `filterStaticPages()` - shows immediately
- **API Results**: Hierarchical structure returned → Provider flattens it → ContentTree tries to regroup it
- Result: Static results flash, then get overwritten by API results
- Hierarchy is lost in flattening → reconstruction is unreliable

### 3. **Accordion Not Working**
- ContentTree tries to reconstruct hierarchy from flat data
- Virtual headings created from `closestHeading` but matching logic is fragile
- Results show pages but no nested headings/content

### 4. **Performance Issues**
- Static results show fast, then disappear when API loads
- No progressive enhancement - all or nothing

## Current Flow

```
User types query
  ↓
Provider.search()
  ├─ filterStaticPages() → instant results (pages only)
  └─ fetch('/api/docs-search') → hierarchical structure
      ├─ Returns: [{ type: 'page', headings: [{ type: 'heading', content: [...] }] }]
      └─ Provider flattens to: [page, heading, content, ...]
          └─ ContentTree receives flat array
              └─ Tries to regroup by page → heading → content
                  └─ Virtual headings created from closestHeading
                      └─ Matching logic fails → no nested items
```

## Root Cause

**The API returns hierarchical data, but the provider flattens it, then ContentTree tries to reconstruct it.** This is inefficient and error-prone.

## Proposed Solution

### Option A: Keep Hierarchical Structure End-to-End (Recommended)

**Data Flow:**
```
API → Returns hierarchical structure
  ↓
Provider → Preserves hierarchy (don't flatten!)
  ↓
ContentTree → Receives hierarchical structure directly
  ↓
Renders AccordionMenu with proper nesting
```

**Changes Needed:**
1. **API**: Already returns hierarchical structure ✅
2. **Provider**: Change to preserve hierarchy instead of flattening
3. **ContentTree**: Accept hierarchical structure directly
4. **Static Pages**: Merge at the hierarchical level (add as top-level pages)

**Benefits:**
- No reconstruction needed - hierarchy preserved
- Faster rendering (no grouping logic)
- More reliable (no matching logic)
- Progressive enhancement possible

### Option B: Flatten at API Level

**Data Flow:**
```
API → Returns flat array with proper metadata
  ↓
Provider → Passes through flat array
  ↓
ContentTree → Groups by page → heading → content
  ↓
Renders AccordionMenu
```

**Changes Needed:**
1. **API**: Return flat array with `closestHeading` metadata
2. **Provider**: Pass through flat array
3. **ContentTree**: Improve grouping logic (current logic is fragile)

**Benefits:**
- Simpler API response
- But: More complex client-side grouping

## Recommended Approach: Option A

### Implementation Plan

#### Phase 1: Update Provider to Preserve Hierarchy
- Remove flattening logic
- Pass hierarchical structure directly to ContentTree
- Merge static pages as top-level pages in hierarchy

#### Phase 2: Update ContentTree to Accept Hierarchical Structure
- Change props to accept `{ pages: Array<{ page, headings: Array<{ heading, content: Array }> }> }> }`
- Remove grouping logic (no longer needed)
- Render directly from hierarchical structure

#### Phase 3: Fix Static Pages Integration
- Add static pages as `{ type: 'page', title, url }` entries
- These can appear instantly while API loads
- Progressive enhancement: show static → add API results

#### Phase 4: Fix Accordion Functionality
- Since hierarchy is preserved, accordion should work automatically
- Ensure Radix Accordion state is managed correctly
- Test keyboard navigation

### Code Structure

```typescript
// Provider returns hierarchical structure
type HierarchicalSearchResult = {
  type: 'page';
  id: string;
  title: string;
  url: string;
  score?: number;
  headings: Array<{
    type: 'heading';
    id: string;
    title: string;
    url: string;
    content: Array<{
      type: 'text';
      id: string;
      title: string;
      url: string;
      content: string;
    }>;
  }>;
};

// ContentTree accepts hierarchical structure
type ContentTreeProps = {
  pages: HierarchicalSearchResult[];
  searchTerm: string;
  onSelect: (href: string) => void;
  // ...
};
```

### Benefits

1. **Fast**: Static pages show instantly, API results add progressively
2. **Accurate**: Hierarchy preserved, no reconstruction errors
3. **Simple**: No complex grouping/matching logic
4. **Reliable**: Single source of truth (API) for structure
5. **Maintainable**: Clear data flow, easier to debug

## Migration Steps

1. ✅ API already returns hierarchical structure
2. 🔄 Update Provider to preserve hierarchy
3. 🔄 Update ContentTree to accept hierarchical structure
4. 🔄 Update SearchItem type to support hierarchical structure
5. 🔄 Fix static pages integration
6. 🔄 Test accordion functionality
7. 🔄 Remove old grouping logic

## Questions

1. Should static pages be merged into hierarchy or shown separately?
2. How should we handle loading states (show static → add API results)?
3. Should we keep both rendering systems (CommandItem for knowledge base, AccordionMenu for docs)?

