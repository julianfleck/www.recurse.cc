# RAGE: Recursive, Agentic Graph Embeddings

## What is RAGE?

RAGE (Recursive, Agentic Graph Embeddings) is a next-generation knowledge representation and processing system that transforms unstructured content into structured, agent-ready knowledge graphs. While most AI memory systems today are built on the Retrieval-Augmented Generation (RAG) paradigm—or, at best, use static knowledge graphs with standardized relationship types (GraphRAG)—RAGE introduces a fundamentally new approach: **dynamic, recursive frame generation**.

Unlike traditional systems that treat knowledge as static chunks or fixed triples, RAGE builds a living, evolving graph of meaning. It dynamically generates frame schemas and recursively nests them, enabling agents to traverse and reason about knowledge in a way that mirrors human cognition. This allows for contextual, agentic operations—where the system not only stores and retrieves information, but actively understands, refines, and suggests new connections and actions.

Think of RAGE as building a "personal memory" for AI systems - not just storing information, but creating a living knowledge substrate that grows and evolves as you use it. It's like having an AI assistant that doesn't just remember what you told it, but understands the relationships between ideas, can reason across different pieces of knowledge, and actively suggests new connections and insights.

## Immediate Value: Context Portability Between AI Systems

While RAGE's full capabilities address complex knowledge representation challenges, the most immediately practical value it provides is seamless context transfer between different AI systems. Instead of manually copying context back and forth between Claude, ChatGPT, Gemini, and other AI providers, RAGE allows users to extract and transfer structured context effortlessly.

**The Problem:** You're working on a complex project with Claude, then switch to ChatGPT for a different perspective, then move to Gemini for code review. Each time, you lose the accumulated context and have to manually reconstruct the conversation history, losing the nuanced relationships between ideas that developed over time.

**RAGE's Solution:** Simply ask the system to "gather context on project X" and RAGE returns a structured JSON or YAML output that preserves not just the facts, but the complete semantic structure—claims and their supporting evidence, methods and their limitations, questions and their contexts. When you copy this structured context into any other AI system, it immediately understands the full landscape of your work rather than starting from scratch.

This context portability transforms how you can work across different AI systems, treating them as specialized tools for different aspects of the same continuous thinking process rather than isolated conversational sessions.

## The Problem with Current AI Memory Systems

Most AI memory systems today—even those powering advanced assistants—are built on retrieval-based paradigms that treat knowledge as static collections of facts, text segments, or fixed relationships. Whether they use simple chunk retrieval, as in classic RAG, or more sophisticated approaches involving graphs or layered memory components, the underlying assumption remains the same: information exists as discrete, unchanging units that can be stored and retrieved. These systems may organize information into graphs or maintain multiple memory layers, but the structure is typically shallow and rigid, with standardized relationship types and little capacity to adapt or evolve as new information arrives.

This static approach creates three fundamental limitations that prevent current systems from supporting the kind of fluid, contextual reasoning that characterizes human cognition:

**Flat Knowledge Structure:** Information is stored as disconnected chunks rather than structured, interconnected ideas. When you upload a research paper, the system sees isolated sentences instead of understanding it as a coherent argument with claims supported by evidence, methods justified by theoretical frameworks, and conclusions that connect to broader research domains. The hierarchical nature of knowledge—where concepts exist at multiple levels of abstraction simultaneously—is completely lost.

**Context Spillover:** Current systems assume user identity is stable and consistent, storing everything in a monolithic context. One minute you're debugging code with specific technical requirements, the next you're writing personal notes with entirely different semantic patterns, but the AI treats this as a single confused conversation thread. This leads to inappropriate suggestions, irrelevant connections, and a fundamental inability to switch between different modes of thinking that humans naturally navigate throughout their day.

**Passive Storage:** These systems can fetch and organize information, but they don't actively understand, contextualize, or suggest meaningful connections. They retrieve but rarely reason. When you ask about a complex topic, they can find relevant chunks of text, but they can't identify contradictions between different sources, suggest follow-up research questions based on knowledge gaps, or trace the logical dependencies that make an argument coherent.

Human cognition is naturally contextual and fluid. We switch between different modes of thinking, different domains of knowledge, and different types of reasoning throughout our day. We build mental models that connect granular details to abstract principles, and we continuously refine these models as new information arrives. A system that can't handle this diversity will always feel rigid and limited.

Imagine trying to understand a complex research paper by only looking at individual sentences without seeing how they connect to form arguments, how evidence supports claims, or how different concepts relate to each other. That's what current AI systems do—they see the trees but miss the forest.

## RAGE's Solution: A Cognitive Substrate for AI Systems

RAGE was designed to address these limitations by creating not just another AI agent, but a **cognitive substrate**—the foundational infrastructure that enables sophisticated AI agents to engage in sustained, cumulative intellectual work. Rather than being an agent itself, RAGE provides the semantic foundation upon which truly intelligent systems can be built.

### Frame Semantics: Structured Meaning, Not Text Chunks

At the heart of RAGE lies **Frame Semantics**, a theory pioneered by Charles Fillmore that treats meaning as structured in frames—defined roles filled by specific elements. Unlike traditional keyword matching or entity extraction, frame semantics captures the relational context that gives words and concepts their meaning. In this view, 
understanding a sentence or a piece of knowledge is not just 
about identifying the individual entities or actions 
involved, but about recognizing the underlying structure—the 
"frame"—that organizes these elements and defines their 
relationships.


To illustrate, consider a sentence like: "John sold the car to Mary for $5000." Most systems would extract disconnected entities: "John," "car," "Mary," "$5000." RAGE, however, recognizes this as a coherent transaction frame with structured relationships:

```
Commercial_transaction
├─ Seller: John
├─ Buyer: Mary  
├─ Goods: car
│ └─ ItemDetails
│   ├─ Type: vehicle
│   └─ Condition: used
└─ Money: $5000
```

The concept of a "commercial transaction" isn't simply a collection of words like "sell," "buyer," or "price." Instead, it's a frame with specific roles that define how these elements relate to each other. Frame semantics allows RAGE to move beyond surface-level matching and instead model the deeper, structured relationships that underpin real understanding.

RAGE supports diverse frame types, each capturing different knowledge structures—from research claims and supporting evidence to methodological procedures and conceptual definitions. The system dynamically generates frame schemas, adapting to actual patterns found in the data rather than forcing everything into rigid, pre-existing structures. When the extraction process identifies patterns that don't fit existing frames, it can propose new frame schemas, allowing the system's repository of available frames to grow and evolve with use.

### Recursive Graph Construction: Hierarchies of Meaning

Traditional knowledge graphs treat all information as existing at the same level of granularity—a research paper, a claim within that paper, and a specific data point supporting that claim are all stored as separate nodes with simple relationships between them. This flattened approach loses something fundamental about how knowledge actually works: the way concepts exist at multiple levels of abstraction simultaneously.

RAGE constructs recursive structures where frames can contain other frames, creating layers of meaning that mirror how concepts actually relate. Consider how a researcher understands a complex document—they don't see individual facts scattered throughout the text, but perceive a hierarchy: broad themes containing specific arguments, which are supported by particular pieces of evidence, which themselves reference detailed methodological procedures.

```
ResearchDomain "Artificial Intelligence in Healthcare"
└─ ResearchPaper "AI Diagnostic Accuracy Study"
   ├─ MainThesis "AI systems achieve 94% diagnostic accuracy"
   │   ├─ SupportingEvidence "Clinical trial with 10,000 patients"
   │   │   ├─ MethodologicalDetail "Randomized controlled trial design"
   │   │   ├─ StatisticalResult "p < 0.001, CI: 92-96%"
   │   │   └─ SourceAttribution
   │   │       ├─ Institution "Johns Hopkins Medical School"
   │   │       └─ PublicationDate "March 2024"
   │   └─ ContextualLimitation "Limited to radiology imaging"
   └─ FutureImplication "Potential for widespread clinical deployment"
```

This recursive structure enables **reasoning across levels of granularity**. When RAGE needs to understand the significance of a statistical result, it can traverse upward to understand what broader claim those numbers support, what research domain that claim belongs to, and what real-world implications follow. Conversely, when evaluating a high-level thesis, it can traverse downward to examine the specific evidence and methodology that ground that thesis in reality.

This vertical movement through layers of meaning solves a fundamental problem in AI systems: the inability to maintain coherent reasoning across different scales of abstraction. RAGE can dynamically adjust its level of focus while maintaining the connections between levels, enabling both detailed analysis and broad pattern recognition.

### Executable Operations: Knowledge About How to Work with Knowledge

The cognitive pattern that drives human expertise—reading granular text, building abstractions, relating to existing knowledge—naturally generates questions and potential actions. When a researcher encounters a new finding, their mind immediately begins generating domain-specific, context-aware operations: "How does this compare to previous studies?" "What are the limitations of this methodology?" "What follow-up experiments would strengthen this claim?"

RAGE extends this natural process by treating these cognitive operations as structured information that can be discovered, suggested, and executed systematically. The system doesn't just store knowledge—it stores knowledge about how to work with knowledge.

**Operations as Graph Entities:** RAGE maintains an operations registry that catalogs operations appropriate for different frame types. When the system extracts a claim frame, it automatically associates it with relevant operations like `validate_supporting_evidence`, `find_contradictory_claims`, `assess_methodology_strength`, and `suggest_replication_studies`. These operations live on the graph as nodes, which means they can be executed at query time through LLM tool calls.

**Context-Aware Operation Selection:** Rather than providing users with a fixed menu of actions regardless of context, RAGE suggests operations that are specifically relevant to the frame types and content being examined. When you're looking at a hypothesis frame, the system might suggest "generate test cases" or "identify underlying assumptions." When examining evidence, it might propose "find contradictory studies" or "assess methodology strength."

**Recursive and Compound Operations:** Because of the recursive nature of the graph structure, operations can be compounded and nested. When processing a complex research question, the system might first execute `find_supporting_evidence` to gather relevant claims, then for each claim found, execute `trace_source_attribution` to assess credibility, then execute `find_contradictory_claims` to identify opposing viewpoints, and finally execute `summarize_frame_cluster` to synthesize findings.

This compositional approach enables sophisticated analytical workflows that adapt to the specific content and query context, moving beyond simple retrieval to active reasoning support.

### Learning from Interactions: Building Persistent Conceptual Workspaces

Most AI systems treat each conversation as an isolated event. RAGE addresses this by applying the same frame-based methodology to user interactions that it uses for documents. Questions become structured representations that capture intent, context, and relationships, creating a searchable, analyzable history of how knowledge is being explored and used.

When you have a complex, multi-session exploration of a problem, RAGE extracts the conceptual journey: the key insights that emerged, the questions that drove inquiry forward, the connections between concepts that were discovered, and the reasoning paths that led from confusion to understanding. Crucially, RAGE also preserves the questions that remain unanswered—these unresolved inquiries become active elements in the knowledge graph that influence background maintenance operations and stand ready to be picked up again.

**Usage-Driven Knowledge Evolution:** The substrate learns from interaction patterns to evolve the knowledge graph itself. When users frequently ask about relationships between concepts that aren't well-connected in the current structure, the system can identify these patterns and suggest maintenance operations to strengthen those connections. This creates a feedback loop where the substrate becomes more useful precisely because it's being used.

**Persistent Environments of Thought:** Instead of ephemeral chat sessions, conversations become structured knowledge that can be retrieved, analyzed, and built upon. This enables agents built on RAGE to materialize persistent environments of thought—not just remembering what was said, but understanding the deeper patterns of how ideas developed and connected over time.

## Use Cases: Where RAGE Makes a Difference

### Research Paper Understanding

**The Problem:** Researchers spend countless hours reading papers, taking notes, and trying to understand how different studies relate to each other. Traditional tools like reference managers help organize papers, but they don't help you understand the actual content or relationships between ideas.

**How RAGE Solves This:** When you feed a research paper into RAGE, it doesn't just store the text—it extracts the actual structure of the research. It identifies the main claims, the evidence that supports them, the methods used, and the relationships between different parts of the paper. It can then connect these elements to similar structures in other papers you've processed.

**Example:** You upload 50 papers about machine learning in healthcare. RAGE extracts the key claims, methods, and findings from each. When you ask "What are the main approaches to handling imbalanced datasets in medical diagnosis?" it doesn't just find papers that mention this topic—it identifies the specific claims about different approaches, the evidence supporting each approach, and can compare their effectiveness based on the extracted structured data across all papers.

### Codebase Analysis and Optimization

**The Problem:** Large codebases become difficult to understand and maintain. Developers struggle to find where functions are called, identify dead code, understand architectural patterns, and plan refactoring efforts. Traditional tools like static analyzers help, but they don't provide the semantic understanding needed for truly intelligent code management.

**How RAGE Solves This:** RAGE parses entire codebases and extracts the semantic structure—methods, classes, functions, and their relationships—as frames in the knowledge graph. This enables sophisticated analysis that goes beyond simple syntax checking.

**Example:** You upload a large Python codebase. RAGE extracts each function as a frame with slots for parameters, return values, dependencies, and usage patterns. When you ask "Which functions are never called?" it can traverse the call graph and identify truly unused code. When you ask "How does the authentication system work?" it can trace through the relevant functions and provide a coherent explanation of the authentication flow.

### Personal Knowledge Management

**The Problem:** People accumulate vast amounts of information from various sources—notes, articles, conversations, experiences—but struggle to organize and retrieve this knowledge effectively. Traditional note-taking tools are either too simple (just text) or too rigid (fixed categories).

**How RAGE Solves This:** RAGE can process personal notes, articles, emails, and other content, extracting the meaningful structures and relationships. It understands not just what you wrote, but why you wrote it, how it relates to other things you know, and what actions it might suggest.

**Example:** You take notes during a meeting, read an article about a related technology, and have a conversation with a colleague about implementation challenges. RAGE extracts the key insights, decisions, and action items from each, connects them to related information you've processed before, and can later help you recall not just what was discussed, but the context, implications, and logical dependencies between different pieces of information.

## Why This Matters: Beyond Information Storage to Cognitive Infrastructure

These use cases demonstrate how RAGE moves beyond simple information retrieval to become a true cognitive substrate that can actively participate in understanding, reasoning, and knowledge creation. The system doesn't just store information—it understands it, can reason about it, and can suggest actions based on that understanding.

Most importantly, RAGE provides a flexible, contextual knowledge representation that can handle the natural diversity of human thinking across different domains and content types. It solves the context spillover problem by recognizing that your thinking naturally flows between different contexts and domains, building contextual knowledge structures that can be navigated and reasoned about independently or in combination as needed.

RAGE represents a shift from static information storage to dynamic knowledge understanding, enabling AI systems to work with information the way humans do—through structured, contextual, recursive reasoning that builds understanding incrementally and maintains the relationships that make knowledge meaningful. Rather than replacing human intelligence, RAGE creates the infrastructure that allows AI systems to become genuine cognitive partners in sustained intellectual work. 