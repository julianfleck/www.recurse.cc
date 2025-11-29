/**
 * Centralized FAQ content for www.recurse.cc
 * 
 * This file contains all FAQ content used across the marketing website.
 * The structure matches the FAQ page component's expected format.
 */

export interface FAQ {
	question: string;
	answer: string;
	tags: string[];
	docLink?: {
		label: string;
		href: string;
	};
}

export interface FAQSection {
	section: string;
	faqs: FAQ[];
}

export const faqSections: FAQSection[] = [
	{
		section: "Core Concepts",
		faqs: [
			{
				question: "I keep reading RAGE. What is RAGE?",
				answer:
					"RAGE stands for Recursive, Agentic Graph Embeddings. It's the core technology that powers Recurse. Unlike traditional RAG (Retrieval Augmented Generation), RAGE builds a semantic graph with typed relationships, temporal versioning, and agent-friendly traversal patterns. It's designed for exploration and understanding, not just retrieval.",
				tags: ["Core Concepts", "Technical"],
				docLink: {
					label: "Learn more about RAGE",
					href: "/concepts/rage",
				},
			},
			{
				question: "What are Frames? Sounds oldschool.",
				answer:
					"Frames are the fundamental building blocks of Recurse's knowledge graph. They're typed semantic units with named slots that capture meaning and relationships. Unlike old symbolic AI frames (which were hand-coded and static), Recurse frames are extracted by LLMs from your content—they emerge from what you upload rather than being predefined. Each frame contains text, metadata, embeddings, and links to other frames, creating a rich, interconnected knowledge structure. Think of them as learned, structured containers that reference each other and nest recursively.",
				tags: ["Core Concepts", "Technical"],
				docLink: {
					label: "Learn about Frames",
					href: "/concepts/frames",
				},
			},
			{
				question: 'What do you mean by "recursive"?',
				answer:
					"Recurse structures knowledge in nested layers. A paragraph might contain claims → which contain concepts → which reference other documents — all linked. Ideas nest inside ideas, just like in real thinking. Outputs can be re-ingested to generate new context, which feeds back into the system. It's not just a static store — it grows as you use it.",
				tags: ["Core Concepts", "Technical"],
			},
			{
				question: "Why focus on structure instead of just similarity?",
				answer:
					"Most AI retrieval systems find content that *looks similar* to your query—matching keywords and text patterns. Recurse extracts *semantic structure*—understanding how sources are organized, what arguments they make, what evidence supports those arguments, and how different pieces relate. This lets you navigate by meaning: trace connections, follow relationships, and explore how ideas relate—not just find similar-looking text. Structure gives you exploration and discovery, not just search results.",
				tags: ["Core Concepts", "Technical"],
			},
			{
				question: 'What do you mean by "latent rehydration"?',
				answer:
					"Latent Rehydration means taking a previously generated frames, answers, or insights and parsing them *back into your structured knowledge graph* — ready to be used in a new query or reasoning task. Instead of treating AI outputs as final, Recurse can re-ingest them as frames, building on previous work recursively. This closes the loop between input and output, allowing the system to learn from its own reasoning.",
				tags: ["Core Concepts", "Technical"],
				docLink: {
					label: "Enable persistence to automatically rehydrate outputs",
					href: "/getting-started/using-the-proxy#enable-persistence",
				},
			},
		],
	},
	{
		section: "Features",
		faqs: [
			{
				question: "What are Adaptive Schemas?",
				answer:
					"Adaptive Schemas let structure emerge from your content automatically—no predefined ontologies needed. The system discovers frame patterns (research papers develop Claim and Evidence frames, meeting notes develop Decision frames, bug reports develop Problem and Solution frames) by learning from what you upload. As you add more sources across different domains, the schema registry evolves to recognize patterns specific to your content.",
				tags: ["Features", "Technical"],
				docLink: {
					label: "Learn about Adaptive Schemas",
					href: "/concepts/adaptive-schemas",
				},
			},
			{
				question: "What is Temporal Versioning?",
				answer:
					"Temporal Versioning creates living memory that evolves without losing history. When you update a document or add new information, Recurse doesn't just overwrite — it creates a new version while maintaining links to previous states with timestamps, diffs showing exactly what changed, and explanations of why. You can query current knowledge or trace how understanding evolved over time. It's how Recurse becomes a substrate that learns and adapts.",
				tags: ["Features", "Technical"],
				docLink: {
					label: "Learn about Temporal Versioning",
					href: "/concepts/temporal-versioning",
				},
			},
			{
				question: "What are Source Subscriptions?",
				answer:
					"Source Subscriptions automatically monitor external sources (URLs, RSS feeds, newsletters, documentation sites) and ingest updates into your knowledge graph. Set it once and your context stays current without manual uploads. When content changes, Recurse recognizes updates and revises existing frames (using Temporal Versioning) rather than just adding duplicates—your knowledge evolves automatically.",
				tags: ["Features", "Integration"],
				docLink: {
					label: "Learn about Source Subscriptions",
					href: "/concepts/subscriptions",
				},
			},
			{
				question: "What are Context Streams?",
				answer:
					"Context Streams let you subscribe to curated knowledge maintained by experts you trust. Instead of building everything from scratch, subscribe to domain-specific context (legal frameworks, medical research, coding patterns) maintained by specialists. Experts share subgraphs of their knowledge bases—sources, documents, and semantic connections—that update as they learn. Think RSS for semantic knowledge based on trust and authority.",
				tags: ["Features", "Streams"],
				docLink: {
					label: "Learn about Context Streams",
					href: "/concepts/streams",
				},
			},
			{
				question: "Can I create my own Context Stream?",
				answer:
					"Yes! You can publish your own streams — sharing structured knowledge with your team, customers, or the community. You're not creating new content—you're just making what you've already built accessible. Set access controls, choose which subgraph to expose, and others can subscribe to receive automatic updates as your knowledge base evolves.",
				tags: ["Features", "Streams"],
			},
			{
				question: "What search capabilities are available?",
				answer:
					"Recurse offers multiple search modes: semantic search (meaning-based vector similarity), text search (keyword/fuzzy matching), frame search (by type/structure), tag search, document search, and candidate search (similar to existing nodes). You can combine filters for precision and navigate both hierarchical and associative relationships.",
				tags: ["Features", "API"],
			},
			{
				question: "Can I organize my knowledge manually?",
				answer:
					"Yes. You can use Scopes to organize content like folders or tags. Assign scopes when uploading to group related material: 'research-papers', 'team:engineering', 'project:website-redesign'. Then filter queries by scope to make retrieval more focused and relevant. You can query single or multiple scopes at once—keeping your personal research separate from work projects, for example.",
				tags: ["Features", "Organization"],
			},
			{
				question: "Can I use automatic context persistence?",
				answer:
					"Yes. Add 'X-Recurse-Persist: true' to your proxy headers to automatically save useful outputs back into your knowledge graph. The assistant's responses become queryable content for future requests. Use this for summaries, knowledge base entries, and reference material — but not for temporary content.",
				tags: ["Features", "Proxy"],
			},
		],
	},
	{
		section: "Comparison",
		faqs: [
			{
				question: "Is this like ChatGPT memory?",
				answer:
					"Not really. ChatGPT's memory stores flat notes per user. Recurse builds a semantic graph of everything you've seen, ingested, and asked — with structure, relations, and traceability. Think personal memory vs. organizational cognition.",
				tags: ["Comparison"],
			},
			{
				question: "How is this different from a vector store?",
				answer:
					"Vector stores retrieve text that *looks similar*. Recurse retrieves nodes that *mean something similar* — with the added benefit of slot-level detail, type awareness, and multi-hop traversal. You can navigate relationships, not just find similar chunks. It's about exploration and discovery, not just retrieval.",
				tags: ["Comparison", "Technical"],
			},
			{
				question: "How does RAGE compare to RAG?",
				answer:
					"RAG (Retrieval Augmented Generation) retrieves similar chunks and feeds them to an LLM. RAGE builds a semantic graph with typed relationships, enabling exploration, multi-hop reasoning, and context that evolves over time. It's infrastructure for understanding, not just similarity search. You can discover connections that weren't even explicit in the original sources.",
				tags: ["Comparison", "Technical"],
			},
			{
				question: "What about GraphRAG?",
				answer:
					"GraphRAG extracts entities and relationships but treats them as static nodes. RAGE uses typed frames with semantic slots that can nest recursively, track temporal changes, and carry agentic instructions for traversal. It's designed for both navigation and evolution — creating living knowledge structures rather than static graphs.",
				tags: ["Comparison", "Technical"],
			},
			{
				question: "So you are just bringing back symbolic AI / GOFAI?",
				answer:
					"No—RAGE is neuro-symbolic AI, combining the strengths of both approaches. Old symbolic AI (GOFAI) used hand-coded rules and static frames—brittle but structured. Connectionist AI (neural networks, LLMs) learns patterns but lacks stable structure—flexible but chaotic. RAGE synthesizes both: LLMs handle generation and extraction (what they're good at), while symbolic frames provide grounding and persistent state (what LLMs lack). The frames themselves aren't hand-coded—they emerge from usage patterns, adapt through interaction, and dissolve when no longer needed. Think of it as learned structure rather than imposed rules.",
				tags: ["Comparison", "Technical"],
			},
		],
	},
	{
		section: "Getting Started",
		faqs: [
			{
				question: "How do I join the beta?",
				answer:
					"Recurse is currently in closed beta with a waitlist. Apply through recurse.cc and choose between UI-only access (dashboard and chat) or full developer access (API + UI). We process applications in batches as we validate capacity. UI-only requests are typically faster since they put less load on infrastructure. Once approved, you'll need an AI provider key (OpenAI, Anthropic, DeepSeek, or OpenRouter) to start processing documents.",
				tags: ["Getting Started"],
				docLink: {
					label: "Learn more about beta access",
					href: "/docs/getting-started/beta",
				},
			},
			{
				question: "How do I get started?",
				answer:
					"Three steps: 1) Get an AI provider key (OpenAI, Anthropic, DeepSeek, or OpenRouter). 2) Sign up for Recurse at dashboard.recurse.cc. 3) Configure your AI provider key in settings. Then choose your path: use the chat interface (no code), the proxy (one line change), or the API (full control).",
				tags: ["Getting Started"],
				docLink: {
					label: "View Quickstart Guide",
					href: "/getting-started/quickstart",
				},
			},
			{
				question: "Do I have to install anything?",
				answer:
					"No. Hosted API access is available. For enterprise users, we offer on-prem deployment and full control of the stack.",
				tags: ["Getting Started"],
			},
			{
				question: "Why Bring Your Own Key (BYOK)?",
				answer:
					"While in beta, Recurse operates on a bring-your-own-key basis, simply because we can't afford otherwise and want to grow slow and maintain quality. You use your own AI provider keys (OpenAI, Anthropic, etc.), and we handle the context injection and knowledge management. This gives you control over costs and data routing. Post-beta, we'll offer managed options too.",
				tags: ["Getting Started", "Integration"],
				docLink: {
					label: "Learn more about our reasoning",
					href: "/getting-started/beta",
				},
			},
			{
				question: "What file formats are supported?",
				answer:
					"We support: plain text, Markdown, PDF, Word documents (.doc, .docx), code files, and URLs (we fetch and parse the content). Upload via raw text, files, or URLs. Images and video transcripts will be supported soon, for now we can process any text-based content including documents, notes, chat threads, and more.",
				tags: ["Getting Started", "Features"],
			},
			{
				question: "How long does source processing take?",
				answer:
					"Typically 10-60 seconds depending on content size and complexity. Processing happens asynchronously — you get a job ID when uploading and can check status via API or the dashboard. You'll be able to query the content once processing completes.",
				tags: ["Getting Started", "Technical"],
			},
		],
	},
	{
		section: "Integration",
		faqs: [
			{
				question: "What's the difference between the API and Proxy?",
				answer:
					"The Proxy is the fastest way to add context — swap your AI provider endpoint and Recurse automatically injects relevant context from your knowledge graph. The API gives you direct control: upload documents, query the graph, build custom retrieval logic, navigate relationships. Most users start with the Proxy and add API calls as needed.",
				tags: ["Integration", "API", "Proxy"],
				docLink: {
					label: "Compare API vs Proxy",
					href: "/getting-started/api-vs-proxy",
				},
			},
			{
				question: "How does the Proxy work?",
				answer:
					"Point your AI SDK to Recurse's proxy endpoint instead of directly to OpenAI/Anthropic. The proxy intercepts requests, retrieves relevant context from your knowledge graph, injects it into the prompt, and forwards to your chosen LLM provider. Responses flow back through unchanged. It's transparent context injection with zero code changes beyond the endpoint.",
				tags: ["Integration", "Proxy"],
				docLink: {
					label: "Using the Proxy Guide",
					href: "/getting-started/using-the-proxy",
				},
			},
			{
				question: "Can I use multiple approaches together?",
				answer:
					"Absolutely. Many users combine the chat interface for exploration, the proxy for their main application, and direct API calls for specific operations. Your knowledge graph is accessible through all methods simultaneously.",
				tags: ["Integration"],
			},
			{
				question: "Can I use this with Claude, Gemini, or other providers?",
				answer:
					"Yes. Any OpenAI-compatible API works with the proxy. For Anthropic's Claude, use the Anthropic base URL. For other providers, adjust the base URL accordingly. Recurse works with all major AI providers.",
				tags: ["Integration"],
			},
			{
				question: "Can I use my own LLMs?",
				answer:
					"Yes. Recurse supports both OpenAI-compatible APIs and direct access to OpenRouter models. This means you can use any provider with an OpenAI-compatible endpoint (OpenAI, Anthropic, DeepSeek, Groq, together.ai, etc.) or browse OpenRouter's catalog of 200+ models directly. You control which models handle extraction, summarization, and generation—choosing based on cost, speed, or capability for each task.",
				tags: ["Integration", "API"],
			},
			{
				question: "Can this power multi-agent systems?",
				answer:
					"Yes — and that's exactly what it's designed for. Agents need memory, context, and ways to reason across knowledge. Recurse provides that substrate with graph traversal, typed relationships, and temporal versioning. The frames carry agentic instructions for navigation and validation.",
				tags: ["Integration", "Features"],
			},
			{
				question: "Can I use this just for retrieval?",
				answer:
					"Absolutely. If you want a better way to index and search your documents semantically, without using LLMs for generation — that works too. Use the API directly for search and retrieval operations.",
				tags: ["Integration", "API"],
			},
		],
	},
	{
		section: "Technical Details",
		faqs: [
			{
				question: "Do I need to understand graphs to use this?",
				answer:
					"No. You can treat it like an API that gives you smarter retrieval and structured summaries. But if you *do* want to query the graph directly — you can. Navigate parent/child relationships, lateral connections, and semantic links with full control.",
				tags: ["Technical"],
			},
			{
				question: "How does the graph structure work?",
				answer:
					"The knowledge graph uses typed nodes (frames) with directed relationships. Each node can have parent/child relationships, neighbors (lateral connections), and semantic links. You can traverse the tree structure, query by depth, or navigate relationships — enabling both hierarchical and associative retrieval.",
				tags: ["Technical", "Core Concepts"],
			},
			{
				question: "What metadata is stored with each node?",
				answer:
					"Each node stores: content (text, embeddings), metadata (source, timestamps, tags, scope), relationships (parents, children, neighbors), schema type, summary, and versioning info. You can query any of these dimensions independently or combined using filters.",
				tags: ["Technical", "API"],
			},
			{
				question: "Can I batch process documents?",
				answer:
					"Yes. The API supports batch operations for uploading multiple documents, updating nodes, and triggering graph maintenance. Processing happens asynchronously with job tracking and status endpoints. You can monitor progress and get notifications when processing completes.",
				tags: ["Technical", "API"],
			},
			{
				question: "How do I filter search results?",
				answer:
					"Use query parameters: scope filters (&scope=project-name), frame type filters (&frame_types=Claim,Evidence), result limits (&limit=10), and combine multiple filters. The API supports semantic, text, frame, tag, and document search modes — each with its own filtering capabilities.",
				tags: ["Technical", "API"],
			},
		],
	},
	{
		section: "Misc",
		faqs: [
			{
				question: 'Why ".cc"?',
				answer:
					'Think "carbon copy" — you just copy everything into the system and it becomes your extended memory. Like how you\'d CC someone on an email to keep them in the loop, recurse.cc keeps your AI systems in the loop with all your knowledge and context.',
				tags: ["Misc"],
			},
			{
				question: "Is this available during beta?",
				answer:
					"Yes! We're in public beta. Sign up to get access. Beta users get early access to features, priority support, and grandfathered pricing when we launch publicly.",
				tags: ["Misc"],
			},
			{
				question: "What's the pricing model?",
				answer:
					"During beta, access is free. Post-beta pricing will be based on storage (nodes/documents), compute (processing/embeddings), and API calls. BYOK users pay less since they bring their own model costs. Enterprise plans include on-prem deployment and SLAs.",
				tags: ["Misc"],
			},
		],
	},
];

/* ============================================================================
 * OLDER FAQ CONTENT (for reference - may be repurposed)
 * ============================================================================
 * 
 * The following FAQ content was found in older files (lib/faq-data.ts,
 * apps/dashboard/lib/faq-data.ts, apps/docs/lib/faq-data.ts) and uses
 * a different structure. This content may be repurposed or merged into
 * the main FAQ sections above.
 * 
 * Structure: FAQItem with { id, title, content, category }
 * 
 * ============================================================================
 */

/*
// Registration FAQs
{
	id: "how-to-signup",
	title: "How do I sign up for Recurse.cc?",
	content: `You can sign up for Recurse.cc through our invitation system. Visit the registration page and enter your invitation code. If you don't have an invitation code, you can request one by joining our waitlist or contacting our support team.`,
	category: "registration",
},
{
	id: "where-to-get-invites",
	title: "Where can I get an invitation code?",
	content:
		"Invitation codes are distributed through our community channels, partnerships, and waitlist. You can join our waitlist at [our website](https://recurse.cc) or reach out to our support team for assistance with invitations.",
	category: "registration",
},
{
	id: "account-verification",
	title: "How does account verification work?",
	content: `After signing up with an invitation code, you'll receive a verification email. Click the link in the email to verify your account and complete the setup process. This helps us ensure account security.`,
	category: "registration",
},

// Upload/Content FAQs
{
	id: "upload-not-working",
	title: "Why isn't my upload working?",
	content: `There are several reasons your upload might fail:

- **File size limits**: Make sure your file is under the maximum size limit (typically 50MB)
- **File type**: Check that the file format is supported (PDF, DOCX, TXT, HTML, etc.)
- **Network issues**: Ensure you have a stable internet connection
- **API key**: Verify your API key is valid and hasn't expired

Try uploading a smaller test file first to isolate the issue.`,
	category: "upload",
},
{
	id: "content-not-appearing",
	title: "My uploaded content isn't appearing in search results",
	content: `If your content isn't showing up in search results:

1. **Processing time**: Content needs time to be processed and indexed (usually 5-15 minutes)
2. **Check processing status**: Use the document status API to see if processing is complete
3. **Search parameters**: Try adjusting your search query or field selection
4. **Document visibility**: Ensure the document was uploaded successfully and is accessible

You can check the processing status using: \`GET /documents/{doc_id}/processing-status\``,
	category: "upload",
},
{
	id: "supported-file-types",
	title: "What file types are supported for upload?",
	content: `Recurse.cc supports a wide variety of content types:

- **Documents**: PDF, DOCX, DOC, TXT, RTF
- **Web content**: HTML, Markdown, URLs
- **Code**: Source code files in any programming language
- **Presentations**: PPTX, PPT
- **Spreadsheets**: XLSX, XLS, CSV
- **Images**: PNG, JPG, JPEG (with OCR support)
- **Archives**: ZIP files containing supported content

For best results, use clear, well-structured content.`,
	category: "upload",
},
{
	id: "large-files",
	title: "How do I upload large files or multiple files?",
	content: `For large files and bulk uploads:

- **Single large files**: Use the \`POST /documents/upload\` endpoint for files up to 50MB
- **Bulk uploads**: Upload multiple files individually or use batch operations
- **URL uploads**: For web content, use the URL parameter instead of file upload
- **Processing time**: Large files may take longer to process

Consider breaking very large documents into smaller sections for faster processing.`,
	category: "upload",
},

// Search/Retrieval FAQs
{
	id: "search-not-finding-content",
	title: "Why can't I find my content in search?",
	content: `If search isn't finding your content:

1. **Indexing delay**: New content needs time to be fully indexed (5-30 minutes)
2. **Search terms**: Try different keywords or phrases from your content
3. **Field selection**: Use different field sets (basic, content, summary, etc.)
4. **Filters**: Check if any filters are excluding your content
5. **Content quality**: Ensure your content has clear text and structure

Example search: \`GET /search?query=your-keywords&field_set=content&depth=2\``,
	category: "search",
},
{
	id: "search-depth-parameter",
	title: "What does the depth parameter do in search?",
	content: `The \`depth\` parameter controls how much of the knowledge graph to explore:

- **depth=1**: Returns only direct matches (fastest)
- **depth=2**: Includes one level of related content (balanced)
- **depth=3+**: Explores deeper connections (slower but more comprehensive)

Use higher depth for research tasks, lower depth for quick lookups. The default is usually 2.`,
	category: "search",
},
{
	id: "api-rate-limits",
	title: "What are the API rate limits?",
	content: `Current rate limits for Recurse.cc API:

- **Search requests**: 60 per minute
- **Document uploads**: 10 per minute
- **Document retrieval**: 120 per minute
- **Other endpoints**: 30 per minute

Rate limits reset every minute. If you exceed limits, you'll receive a 429 status code. Contact support for higher limits if needed.`,
	category: "api",
},

// Technical/Integration FAQs
{
	id: "api-authentication",
	title: "How do I authenticate API requests?",
	content: `Use your API key in the X-API-KEY header:

\`\`\`bash
curl -H "X-API-KEY: your-api-key-here" \\
     -H "Accept: application/json" \\
     https://api.recurse.cc/search?query=test
\`\`\`

You can find your API key in your account dashboard under Settings > API Keys.`,
	category: "api",
},
{
	id: "integration-options",
	title: "What integration options are available?",
	content: `Recurse.cc offers multiple integration methods:

1. **REST API**: Full programmatic access to all features
2. **Web Dashboard**: Browser-based interface for manual operations
3. **Browser Extensions**: Direct web content capture
4. **MCP Protocol**: Integration with AI assistants and tools
5. **Webhooks**: Real-time notifications for processing events

Choose the integration method that best fits your workflow.`,
	category: "integration",
},
{
	id: "webhook-setup",
	title: "How do I set up webhooks for processing notifications?",
	content: `To set up webhooks for document processing notifications:

1. Configure your webhook URL in the dashboard
2. Specify which events you want to receive (processing_complete, processing_failed, etc.)
3. Implement your webhook endpoint to handle the payload
4. Test with a sample document upload

Webhook payloads include document ID, status, and processing metadata.`,
	category: "integration",
},

// Billing/Account FAQs
{
	id: "billing-plans",
	title: "What are the different billing plans?",
	content: `Recurse.cc offers flexible pricing:

- **Free Tier**: 100 documents, 1GB storage, basic search
- **Pro**: $29/month - 10,000 documents, 100GB storage, advanced features
- **Enterprise**: Custom pricing for teams and organizations

All plans include core RAGE functionality with different usage limits.`,
	category: "billing",
},
{
	id: "usage-tracking",
	title: "How do I track my usage and limits?",
	content: `Monitor your usage through:

1. **Dashboard**: Real-time usage statistics and charts
2. **API Headers**: Rate limit headers in API responses
3. **Email notifications**: Alerts when approaching limits
4. **Billing page**: Detailed usage breakdown and history

You can upgrade your plan anytime from the billing section.`,
	category: "billing",
},
*/

