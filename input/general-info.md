Here’s a compact “context dump” you can hand to another model before it writes API docs and how-to guides about **RAGE / Recurse**.

# What RAGE/Recurse is (in one breath)

Recurse is a **Universal Data Layer** for AI-native systems. It ingests messy inputs (docs, chats, email, code, etc.), extracts **semantic frames** (typed, slot-filled structures), and assembles a recursive knowledge graph that agents and LLMs can query, reuse, and extend—**with traceability** from every output back to source frames. We call the approach **RAGE — Recursive, Agentic Graph Embeddings**.&#x20;

# Core mental model

* **Frames & Slots.** Meaning is modeled as **Frame instances** (e.g., `claim`, `supporting_evidence`, `definition`) with typed **slots** that can be filled by literals or other frames; frames nest arbitrarily deep. Think “schema-driven knowledge, all the way down.”&#x20;
* **Everything is a typed frame.** Even higher structures (argumentation, problem→solution) are frames; uniform schemas enable validation, nesting, and reuse.&#x20;
* **Executables (agentic verbs).** Operations like *summarize, compare, find-related* are themselves structured/typed “executable” schemas—so behaviors are composable like data.&#x20;
* **Recursive growth & rehydration.** Outputs (answers/summaries) can be **rehydrated** into structured inputs and fed back to the graph, so the system’s context improves over time.&#x20;
* **Conceptual lineage.** Informed by RDF triples, Frame Semantics, Construction Grammar, Category Theory, and homoiconicity (code↔data). This hybridizes symbolic structure with associative traversal.&#x20;

# Architecture (10-step flyover)

1. Ingest text via API → 2) detect doc structure/sections → 3) **frame extraction** with LLM-guided classification → 4) **slot validation** (typed) → 5) **confidence scoring/retries** → 6) persist frames/sections/docs + embeddings in Neo4j → 7) multi-index vector search (raw & summary) with frame-type prefixes → 8) local graph expansion (parents/children/siblings) → 9) re-ranking (confidence/type boosts) + **source attribution** → 10) generation or context-only return. Parallel chunking + status tracking included. &#x20;

# API surface (groups & typical flows)

* **Documents.** `POST /documents` (add+ingest), `GET /document/{id}`, `GET /document/{id}/history`, `DELETE /document/{id}`. Use for end-to-end ingestion, retrieval, and version diffs.&#x20;
* **Vault.** `/vault/*` for raw file storage only (no processing). Handy for staging.&#x20;
* **Graph (admin/debug).** `/graph/add/*`, `/graph/update/*`, `/graph/query`, `/graph/subgraph`, `/graph/stats`—atomic node/edge operations, diagnostics, maintenance.&#x20;
* **Retrieval (product use).** `/get/candidates` (vector search), `/get/context` (context-only), `/get/answer` (LLM answer + citations), plus rich per-node endpoints: `/get/{node_id}`, `/get/context/{node_id}`, `/get/children/{node_id}`, `/get/neighbors/{node_id}`. &#x20;
* **Extract (low-level).** `/extract/sections`, `/extract/metadata`, `/extract/frames`, `/extract/embeddings` (sync/async variants) for modular pipelines.&#x20;
* **Writing assistance.** `/writing/complete` and `/writing/rephrase`—graph-aware completions/rephrasings with source grounding.&#x20;
* **System/Jobs.** `/health`, `/stats`, `/jobs/{job_id}`.&#x20;

**Typical dev loop:**
`POST /documents` → poll `/jobs/{job_id}` → `GET /document/{id}` → app queries `/get/context` or `/get/answer` → (optionally) write back summaries as frames to keep the graph fresh.&#x20;

# Data model & validation (what exists in the graph)

* **Node types:** Document, Section, Frame (+ Tag/Hypernym/Hyponym). **Relationships:** hierarchical (parent/child, next), semantic (SUPPORTS, ILLUSTRATES, CITES), metadata links.&#x20;
* **Frame taxonomy (examples).** Content: `claim`, `supporting_evidence`, `definition`, `example`, `implication`, `question`, `method`, `insight`. Meta-structures: `claim_support_structure`, `argumentation_structure`, `problem_solution_structure`. Attribution: `source_attribution`, `quote`, `reference`.&#x20;
* **Slots & typing.** Literal vs. frame-reference roles; strict validators + retry feedback.&#x20;
* **Performance envelope.** 1–2s per chunk for extraction; validation <100ms typical; linear memory w/ depth; retry up to 3× on validation failures. Parallel chunking 3–5× overall speed-up. &#x20;

# Retrieval behavior (how answers/context are assembled)

* **Multi-index search.** Query both **text** and **summary** embeddings and reconcile. Embeddings carry frame-type prefixes (e.g., “Supporting Evidence: …”) to improve intent alignment.&#x20;
* **Local graph expansion.** Add parent/child/sibling context; cap siblings for focus.&#x20;
* **Re-ranking & attribution.** Confidence weighting + type boosts; return numbered sources.&#x20;

# Positioning (for intros/how-tos)

* **Not** “just a vector store,” **not** ChatGPT memory; it’s a **structured, recursive knowledge substrate** with **full traceability** and reusability at **frame level**. Emphasize **agent memory**, **schema awareness**, and **multi-hop reasoning**.&#x20;

# Style & tone guide for the docs

* **Voice:** clear, technical, non-hyped; default to developer-friendly specificity.
* **Recurring phrases/terms:** *semantic frames*, *slot-aware retrieval*, *frame-level reuse*, *rehydration*, *universal data layer*, *agent memory*, *traceable outputs*.
* **Terminology preferences:** use “**interconnection**” (or “interplay”) over “intersection”. Avoid the “*This isn’t just… it’s…*” trope.
* **Explain by pattern → example → code.** Lead with the pattern (frame types/relationships), then a small JSON snippet, then a cURL/API example. Reuse the same running example across pages.
* **Diagrams welcome.** Show claim↔evidence nesting and how retrieval expands context.
* **Cite sources in answers.** Always demonstrate how `/get/answer` returns frames + citations.

# How-to article templates (seed shapes)

1. **Ingest & explore a document**

   * Goal: get from raw text → nested frames → retrieve context around a claim.
   * Steps: `POST /documents` → `GET /document/{id}` → `/get/context/{node_id}` → graph view.&#x20;
2. **Build a question-answering endpoint**

   * Goal: serve answers with citations.
   * Steps: `/get/candidates` (tune `k`, `reranking_strategy`) → `/get/answer` → show source frames in UI.&#x20;
3. **Graph maintenance & debugging**

   * Goal: fix indexes or update nodes after schema changes.
   * Steps: `/graph/stats`, `/graph/relationships`, rebuild vector indexes as needed (troubleshooting playbook). &#x20;

# Glossary (tight definitions)

* **Frame / FrameSchema:** Typed structure with slots (roles) describing meaning; validated and nestable.&#x20;
* **Executable:** A structured operation definition (e.g., summarize) represented like data; enables agentic behavior.&#x20;
* **Rehydration:** Turning an output (answer/summary) back into structured frames to extend context.&#x20;
* **Universal Data Layer:** System-wide, structured knowledge substrate reusable across apps/agents.&#x20;

# Competitive framing (one quick table line, if needed)

Traditional RAG → flat chunks & cosine; GraphRAG → node-level chunks & basic traversal; **RAGE** → **frame-level** semantics, **slot-aware** traversal, **multi-hop** reasoning, and **full traceability**.&#x20;

---

If you want, I can also turn this into an **internal MDX “Overview” page** with anchors the model can cross-link from individual endpoint/how-to docs.
