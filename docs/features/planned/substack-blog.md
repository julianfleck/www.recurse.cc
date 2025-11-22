---
title: "Substack Blog Mirroring"
status: "in-progress"
owners:
  - "Julian"
  - "Agents"
---

## Goal

Mirror tagged Substack posts to `blog.recurse.cc` (and `/blog` inside the marketing app) using the existing www layout and the Fumadocs MDX pipeline so that every essay lives alongside the rest of the product surface.

## Constraints

- **Layout parity:** Pages must render inside the marketing shell (header, footer, hero typography) while the article body uses Fumadocs MDX components for consistency.
- **Single content source:** Blog entries live under `content/blog/**`, matching how the docs/dashboard content is organized.
- **Automation first:** New posts should arrive by running a deterministic script (and later, via CI/cron) that consumes the Substack RSS feed. No manual copy/paste.
- **Safety:** Avoid ingesting posts that are not ours—filter by tag list if needed and keep a local cache of processed GUIDs.

## Architecture

| Layer | Responsibility |
| --- | --- |
| `scripts/sync-substack-posts.ts` | Fetch RSS feed (`SUBSTACK_FEED_URL`), convert HTML → MDX, write `content/blog/<year>/<slug>.mdx`, update `meta.json`, persist cache |
| `packages/blog` | Wrap Fumadocs loader, expose `getAllBlogPosts`, `blogSource`, MDX components, and `BlogArticleLayout` |
| `apps/www/app/blog/**` | Listing page for featured posts + MDX-rendered article route (`[...slug]`) |
| `navigationContent.blog` | Pull most recent posts from a shared `@/lib/blog` helper (powered by `@recurse/blog`) for the header dropdown |

## Rollout Plan

1. ✅ Create `content/blog` tree with Meta definitions and stub article.
2. ✅ Add `packages/blog` (loader/layout/mdx components).
3. ✅ Wire `/blog` listing + `/blog/[...slug]` detail pages in `apps/www`.
4. ✅ Update navigation menu to read live article list (fallback to placeholder if empty).
5. ✅ Implement RSS sync script + workspace dependencies (`fast-xml-parser`, `turndown`, `gray-matter`).
6. 🔄 Add CI/Vercel cron target that runs `pnpm sync:blog`.
7. 🔄 Expand docs + troubleshooting once automation is live.

## Open Questions

- Should we download hero assets to `/public/blog/...` for resilience, or keep Substack CDN URLs until we add media ingestion?
- How many posts do we surface in the nav vs. `/blog` listing? (Currently 6 in the dropdown, unlimited on the page.)
- Do we need author multi-tenancy now, or wait until additional contributors join the Substack publication?

## Testing / Verification

- `pnpm sync:blog` creates new MDX files and updates meta indexes without stomping manual edits.
- `pnpm dev:www` renders `/blog` and `/blog/2025/...` without additional configuration.
- Lint + type checks (`pnpm lint`) remain clean after syncing.

