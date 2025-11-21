# Navigation Anchor-Based Navigation Proposal

## Overview
Update the header navigation to link to anchors on the landing page instead of individual pages. Pages will remain but navigation will scroll to sections on the homepage.

## Landing Page Sections & Proposed Anchor IDs

### Current Landing Page Structure:
1. **Hero** - `#hero` (main headline + CTA)
2. **About** - `#about` ("Yet Another AI Memory System?" section)
3. **Features** - `#features` ("What Recurse does" - 4 capability cards)
4. **Chat or Code** - `#explore` ("Built for Exploration" - non-developer focus)
5. **Build with Recurse** - `#build` ("Build with Recurse" - developer focus with code examples)
6. **Comparison** - `#comparison` ("How Recurse Compares" - comparison table)
7. **Signup** - `#signup` (beta signup form - already has `#signup` anchor)
8. **CTA** - `#cta` (final call-to-action section)

## Navigation Mapping Proposal

### Main Navigation Items

#### 1. **About** (currently `/about`)
- **New Link**: `#about`
- **Section**: "Yet Another AI Memory System?" 
- **Content**: Explains how Recurse differs from traditional RAG systems
- **Rationale**: This section already explains the "about" concept - what makes Recurse different

#### 2. **Features** (dropdown)
- **New Link**: `#features` (main link)
- **Section**: "What Recurse does" - 4 core capabilities
- **Rationale**: The features dropdown cards should map to the 4 capability cards in this section

#### 3. **Technology** (dropdown)
- **New Link**: `#build` (main link - developer-focused section)
- **Section**: "Build with Recurse" 
- **Rationale**: Technology dropdown should focus on how to use/build with Recurse
- **Alternative**: Could also link to `#comparison` to show how Recurse compares technically

#### 4. **Docs** (keep as-is)
- **Link**: `/docs` (external page)
- **Rationale**: Documentation is separate content, not on landing page

## Dropdown Cards Proposal

### Features Dropdown → Map to Core Capabilities

Current dropdown items:
1. "Semantic Frame Parsing" → Map to **"Let's You Navigate Semantic Structure"** (`#features` + scroll to first card)
2. "Recursive Memory" → Map to **"Evolves Knowledge Graphs Over Time"** (`#features` + scroll to third card)
3. "Context-Aware Operations" → Map to **"Discovers Schemas Automatically"** (`#features` + scroll to second card)
4. "Multi-Source Ingestion" → Keep as general `#features` (or could map to "Built for Exploration" section)

**Proposed Updates:**
```json
{
  "title": "Navigate Semantic Structure",
  "href": "#features",
  "description": "Follow typed relationships, trace reasoning chains, and navigate meaning through actual reasoning chains, not keyword similarity."
},
{
  "title": "Discover Schemas Automatically", 
  "href": "#features",
  "description": "Recurse learns patterns from any content you add, creating relationships without predefined ontologies. Zero configuration needed."
},
{
  "title": "Evolve Knowledge Graphs",
  "href": "#features", 
  "description": "Updates knowledge while preserving complete history with timestamps, diffs, and explanations. Living memory that maintains current understanding and historical context."
},
{
  "title": "Multi-Source Ingestion",
  "href": "#explore",
  "description": "Upload PDFs, text files, markdown, or paste URLs directly. Recurse extracts semantic structure and makes content queryable within minutes."
}
```

### Technology Dropdown → Map to Technical Sections

Current dropdown items:
1. "Frame Semantics" → Map to `#features` (first capability card)
2. "Recursive Graph Construction" → Map to `#features` (third capability card) 
3. "Operations as Knowledge" → Map to `#build` (developer section)
4. "RAGE vs. RAG" → Map to `#comparison` (comparison table)

**Proposed Updates:**
```json
{
  "title": "Frame Semantics",
  "href": "#features",
  "description": "Structured knowledge representation using semantic frames with defined roles and relationships. Navigate meaning through reasoning chains."
},
{
  "title": "Recursive Graph Construction",
  "href": "#features", 
  "description": "Dynamic graph building that learns from every interaction, creating self-improving knowledge structures with complete history."
},
{
  "title": "One-Line Integration",
  "href": "#build",
  "description": "Point your OpenAI SDK to the Recurse proxy. Context injection and knowledge extraction happen transparently—no manual engineering needed."
},
{
  "title": "RAGE vs. RAG",
  "href": "#comparison",
  "description": "Compare Recursive Agentic Graph Embeddings with traditional RAG approaches. See how Recurse goes beyond similarity matching."
}
```

## Implementation Plan

### Step 1: Add Anchor IDs to Landing Page Sections
- Add `id="hero"` to Hero section wrapper
- Add `id="about"` to About section wrapper  
- Add `id="features"` to Features section wrapper
- Add `id="explore"` to ChatOrCodeSection wrapper
- Add `id="build"` to BuildWithRecurseSection wrapper
- Add `id="comparison"` to ComparisonSection wrapper
- Verify `id="signup"` exists on SignupSection (already referenced in hero button)
- Add `id="cta"` to CTASection wrapper

### Step 2: Update Navigation Component
- Update "About" link to use `#about` anchor
- Update "Features" dropdown trigger to link to `#features`
- Update "Technology" dropdown trigger to link to `#build` or `#comparison`
- Implement smooth scrolling logic (already exists via ScrollContext)

### Step 3: Update Navigation JSON
- Update `featureDropdown` items with new titles, hrefs, and descriptions
- Update Technology dropdown cards (hardcoded in component) with new content

### Step 4: Handle Cross-Page Navigation
- If user is on `/about` page and clicks `#about`, navigate to `/#about`
- Use ScrollContext's `scrollToElement` when on homepage
- Use `window.location.href = "/#anchor"` when on other pages

## Benefits
1. **Single-page flow**: Users can explore all content without page reloads
2. **Better UX**: Smooth scrolling between related sections
3. **SEO**: All content accessible on main landing page
4. **Faster navigation**: No page transitions for main content
5. **Progressive disclosure**: Users can dive deeper via dropdowns

## Considerations
- Pages (`/about`, `/features/*`) remain accessible via direct URLs
- Documentation (`/docs`) stays separate (not on landing page)
- Need to handle browser back/forward buttons correctly
- Ensure anchor links work when JavaScript is disabled (fallback to `/#anchor`)

