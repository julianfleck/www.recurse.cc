# FAQ Review - November 28, 2025

## Analysis of Current FAQ Content

### Issues Identified

#### 1. Headlines That Need Clarity for Uninitiated Users

**Current Issues:**
- "How does structure over similarity work?" - Too jargon-y, assumes user knows what "structure over similarity" means
- "What is rehydration?" - Technical term without context
- "What are Scopes?" - Could be clearer about purpose

**Proposed Fixes:**
- "How is Recurse different from similarity search?" or "Why structure matters more than similarity"
- "What does 'rehydration' mean?" or combine with recursivity explanation
- "How do I organize my knowledge?" (with Scopes as the answer)

#### 2. Category Ordering (General → Specific)

**Core Concepts** - Needs reordering:
- Current order: recursive, RAGE, Frames, structure/similarity, rehydration
- Better order: RAGE (what is it), Frames (building blocks), recursive (how it works), structure/similarity (why it's better), rehydration (advanced)

**Features** - Generally good, but could group better:
- Core features first (Adaptive Schemas, Temporal Versioning)
- Integration features (Subscriptions, Streams)
- Usage features (Search, Scopes, persistence)

**Getting Started** - Good order, keep as is

**Integration** - Could be more logical:
- Start with "What's the difference between API and Proxy?" (overview)
- Then specifics about each approach
- Then advanced topics (multi-agent, retrieval-only)

#### 3. Content Accuracy vs. Concepts Docs

**Adaptive Schemas:**
- FAQ says: "automatically recognize and structure different types of content"
- Docs say: "Structure emerges from your content automatically"
- ✅ Accurate but could emphasize the emergent nature more

**Temporal Versioning:**
- FAQ says: "tracks how your knowledge evolves over time"
- Docs say: "living memory substrate" with version links, diffs, explanations
- ✅ Accurate but could mention the "living memory" framing

**Context Streams:**
- FAQ says: "curated knowledge maintained by experts or organizations"
- Docs say: "Share subgraphs of your knowledge base—subscribe to domain expertise you trust"
- ✅ Accurate but could emphasize the trust/authority aspect more

**RAGE comparison:**
- FAQ has good comparison to RAG/GraphRAG but could incorporate the detailed table from docs

#### 4. Old FAQ Snippets to Consider

**Keep and integrate:**
- Registration/Beta access info (how-to-signup, where-to-get-invites) - IMPORTANT
- Supported file types - good detail
- Processing time expectations - useful
- API authentication basics - helpful

**Skip (covered elsewhere or outdated):**
- Upload troubleshooting (should be in docs/support)
- Rate limits (should be in API docs)
- Billing details (should be in pricing page)

---

## Recommended Changes

### Section 1: Core Concepts (Reorder + Improve Headlines)

1. **"What is RAGE?"** - Keep (good intro)
2. **"What are Frames?"** - Keep (building blocks)
3. **"What does 'recursive' mean in Recurse?"** - NEW headline for clarity
4. **"Why does Recurse focus on structure instead of just similarity?"** - Revised headline
5. **"What is 'rehydration'?"** - Keep but move to end (advanced)

### Section 2: Features (Group Better)

**Core Processing:**
1. Adaptive Schemas
2. Temporal Versioning

**Continuous Knowledge:**
3. Source Subscriptions
4. Context Streams (+ "Can I create my own?")

**Search & Organization:**
5. Search capabilities
6. Scopes (with better headline)
7. Automatic context persistence

### Section 3: Comparison (Keep as is, mostly good)

### Section 4: Getting Started (Add registration info)

1. **"How do I join the beta?"** - NEW from old snippets
2. "How do I get started?" - Keep
3. "Do I have to install anything?" - Keep
4. "What's BYOK?" - Keep
5. "How long does processing take?" - Keep
6. **"What file formats are supported?"** - NEW from old snippets (detailed version)

### Section 5: Integration (Reorder for logic)

1. "What's the difference between API and Proxy?" - Move to top
2. "How does the Proxy work?" - After overview
3. "Can I use multiple approaches together?" - After both explained
4. Specific provider questions
5. Advanced topics (multi-agent, retrieval-only)

### Section 6: Technical Details (Keep as is, mostly good)

### Section 7: Misc (Keep + expand)

---

## Specific Rewrites Needed

### "How does structure over similarity work?"

**Current:** Too jargon-y
**New headline:** "Why does Recurse focus on structure instead of just similarity?"
**New answer:** "Most AI retrieval systems find content that *looks similar* to your query—matching keywords and text patterns. Recurse extracts *semantic structure*—understanding how sources are organized, what arguments they make, what evidence supports those arguments, and how different pieces relate. This lets you navigate by meaning: trace connections, follow relationships, and explore how ideas relate—not just find similar-looking text. Structure gives you exploration and discovery, not just search results."

### "What is rehydration?"

**Keep headline** but improve answer for clarity:
**New answer:** "Rehydration means taking a previously generated frame, answer, or insight and converting it *back into structured input*—ready to be used in a new query or reasoning task. Instead of treating AI outputs as final, Recurse can re-ingest them as frames, building on previous work recursively. This closes the loop between input and output, allowing the system to learn from its own reasoning."

### "What are Scopes?"

**New headline:** "How do I organize my knowledge?"
**New answer:** "Use Scopes to organize content like folders or tags. Assign scopes when uploading to group related material: 'research-papers', 'team:engineering', 'project:website-redesign'. Then filter queries by scope to make retrieval more focused and relevant. You can query single or multiple scopes at once—keeping your personal research separate from work projects, for example."

---

## New FAQ Items to Add (from old snippets)

### "How do I join the beta?"

**Answer:** "Recurse is currently in public beta. Sign up at dashboard.recurse.cc to get access. Beta users get early access to features, priority support, and grandfathered pricing when we launch publicly. You'll need an API key from an AI provider (OpenAI, Anthropic, DeepSeek, or OpenRouter) to get started."

**Tags:** ["Getting Started", "Misc"]
**Section:** Getting Started

### "What file formats are supported?" (Detailed version)

**Current answer is good, keep it but move to Getting Started:**
"We support: plain text, Markdown, PDF, Word documents (.doc, .docx), code files, and URLs (we fetch and parse the content). Upload via raw text (-F 'text=...'), files (-F 'file=@document.pdf'), or URLs (-F 'url=https://...'). Images and videos aren't supported yet."

**Move from Technical to Getting Started**

