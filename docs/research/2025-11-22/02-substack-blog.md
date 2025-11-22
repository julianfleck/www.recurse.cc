## 2025-11-22T04:06:28Z

### Context
Investigate how to ingest Substack posts for `blog.recurse.cc` using RSS while preserving www layout and Fumadocs MDX tooling.

### Queries (External Research - Extract/Expand)
- "Is there an RSS feed for my Substack publication"
- "Substack RSS feed format"
- "j0lian substack feed"

### Sources (External)
1. Substack Support – Does Substack have an RSS feed? (<https://support.substack.com/hc/en-us/articles/360038239391-Is-there-an-RSS-feed-for-my-publication>) (accessed: 2025-11-22T04:06:28Z)
   - Key findings: Every Substack publication automatically exposes an RSS feed at `https://<publication>.substack.com/feed`, containing recent posts with metadata.
2. Julian Fleck RSS Feed (<https://j0lian.substack.com/feed>) (accessed: 2025-11-22T04:06:28Z)
   - Key findings: Feed entries include title, description, author, publication date, primary image (`enclosure`), and full HTML content within `<content:encoded>`, enabling full-text mirroring.

### Internal Mapping
- No existing `content/blog/` structure in repo; we only have marketing (`apps/www`) and docs/dash via Fumadocs.
- `packages/fumadocs` already wraps loaders/layouts for docs; we can pattern-match when building a dedicated blog package.
- `scripts/` directory houses doc generation utilities (OpenAPI) that we can emulate for Substack ingestion.

### Evaluation
- Sufficient context? yes
- Confidence level: 0.78
- Open questions:
  - Best way to extract images/assets referenced in `<content:encoded>` while preserving CDN attribution.
  - Whether RSS feed exposes tag metadata we can filter on, or if we need manual whitelist mapping per post.

### Synthesis
RSS is the canonical, officially documented interface for Substack publications and already provides the data we need (full HTML bodies, media links, published dates). The Julian Fleck feed confirms we can fetch complete article blobs and metadata directly. We can therefore rely on a pure RSS workflow (no unofficial API) and build an ingestion script that parses feed items, filters by tags/category if present, converts HTML→MDX, and writes `meta.json` for Fumadocs-based navigation.

### Proposed Actions
- Build a dedicated `scripts/sync-substack-posts.ts` that pulls from `https://j0lian.substack.com/feed`, with optional tag filtering logic.
- Normalize extracted content into `content/blog/<year>/<slug>.mdx` plus `meta.json` definitions for sidebar ordering.
- Re-use Fumadocs loaders/layouts to render MDX while keeping apps/www layout wrappers.

### Proposed Changes
- Add instructions to developer docs explaining the RSS-based sync workflow.
- Consider augmenting `.cursor/rules/overview.mdc` once new blog directories/packages exist.

