import { Brain, GitGraph, Layers } from 'lucide-react';
import AnimatedContent from '@/components/animations/AnimatedContent/AnimatedContent';
import ScrollAnimation from '@/components/animations/ScrollAnimation/ScrollAnimation';
import { CTASection } from '@/components/common/CTASection';
import { FeatureCard } from '@/components/layout/FeatureCard';
import {
  GridCell,
  GridLayout,
  SingleColumnSection,
  ThreeColumnSection,
} from '@/components/layout/GridLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AboutPage() {
  const comparisonData = [
    {
      feature: 'Data Chunking',
      traditional: 'Heuristic token windows',
      graphRAG: 'Graph-node-level chunks',
      rage: 'Semantic frames and slot hierarchies',
    },
    {
      feature: 'Retrieval',
      traditional: 'Vector similarity',
      graphRAG: 'Graph traversal (basic)',
      rage: 'Recursive graph traversal with slot-aware anchors',
    },
    {
      feature: 'Context Injection',
      traditional: 'Append to prompt',
      graphRAG: 'Pre-chain static context',
      rage: 'Flattened and layered semantic context',
    },
    {
      feature: 'Schema Awareness',
      traditional: 'None',
      graphRAG: 'Manual node types',
      rage: 'Automated frame-based schema generation',
    },
    {
      feature: 'Reasoning Support',
      traditional: 'One-hop',
      graphRAG: 'One/two-hop',
      rage: 'Native multi-hop + abstraction layering',
    },
    {
      feature: 'Composability',
      traditional: 'Prompt-level only',
      graphRAG: 'Per-query only',
      rage: 'Frame-level reusability + rehydration',
    },
    {
      feature: 'Output Traceability',
      traditional: 'Poor',
      graphRAG: 'Some via graph',
      rage: 'Full — every answer linked to source frames',
    },
    {
      feature: 'Input Flexibility',
      traditional: 'Mostly text/PDF',
      graphRAG: 'Requires pre-structured data',
      rage: 'Any input: Slack, email, docs, audio (via plugins)',
    },
    {
      feature: 'Agent Integration',
      traditional: 'Hard to maintain state',
      graphRAG: 'Limited memory graphs',
      rage: 'Native agent memory + semantic planning substrate',
    },
  ];

  return (
    <>
      {/* Header Section - Above Grid */}
      <div className="relative z-10 mx-auto max-w-4xl pb-16">
        <div className="container mx-auto px-4 py-12 sm:px-6 md:px-12 md:py-20 lg:px-16 xl:px-20">
          <div className="mx-auto max-w-6xl text-left">
            <h1 className="mb-8 font-medium text-3xl leading-[0.9] tracking-tight md:text-5xl lg:text-6xl">
              Beyond Retrieval: Building Recursive Understanding
            </h1>
            <p className="mx-auto mb-12 max-w-4xl font-light text-muted-foreground text-xl leading-relaxed md:text-2xl">
              Recurse implements a new approach called Recursive Agentic Graph
              Embeddings (RAGE). Instead of treating context as flat chunks of
              text, RAGE parses knowledge into structured semantic frames and
              builds a recursive graph that evolves with every interaction. Each
              node on the graph carries instructions for how to interpret the
              node, and how to use it in a larger context.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content with Grid Layout */}
      <ScrollAnimation enableFadeOut={true} exitBlur={6} exitScale={0.98}>
        <div className="relative z-10">
          <AnimatedContent
            blur={true}
            delay={0.3}
            direction="vertical"
            distance={60}
            duration={0.8}
            initialBlur={4}
          >
            <GridLayout maxWidth="lg">
              {/* Vision Statement */}
              <SingleColumnSection>
                <div className="mx-auto max-w-4xl text-left">
                  <h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
                    Moving From Retrieval to Recursive Understanding
                  </h2>
                  <p className="mb-8 font-light text-lg text-muted-foreground leading-relaxed">
                    For years, AI has promised to transform how we manage
                    knowledge, yet most systems today barely scratch the
                    surface. They fetch, but rarely understand. They organize,
                    but rarely contextualize. True intelligence and
                    collaboration—whether between humans, AI systems, or a
                    hybrid of the two—must mirror how humans genuinely process
                    and interact with information: recursively, contextually,
                    and associatively.
                  </p>
                </div>
              </SingleColumnSection>

              {/* Why Recursive - Three Key Concepts */}
              <ThreeColumnSection>
                <GridCell>
                  <FeatureCard
                    description="Human cognition isn't linear—it's fractal. We interpret ideas, abstract them into summaries, reuse them in new contexts, and continuously refine our mental models. RAGE explicitly models this recursive structure."
                    icon={Brain}
                    iconStrokeWidth={1.5}
                    title="Recursive Cognition"
                  />
                </GridCell>

                <GridCell>
                  <FeatureCard
                    description="RAGE identifies meaningful structures—called semantic frames—from raw text, building hierarchical abstractions over these frames, and making these summaries recursively available for higher-level interpretations."
                    icon={GitGraph}
                    iconStrokeWidth={1.5}
                    title="Semantic Frames"
                  />
                </GridCell>

                <GridCell>
                  <FeatureCard
                    description="RAGE is not just a tool—it's an infrastructure that aligns AI with human cognitive patterns. It provides a foundation for systems that don't merely fetch information but actively participate in understanding."
                    icon={Layers}
                    iconStrokeWidth={1.5}
                    title="Cognitive Infrastructure"
                  />
                </GridCell>
              </ThreeColumnSection>

              {/* Technology Deep Dive Header */}
              <SingleColumnSection
                className="scroll-mt-32"
                id="frame-semantics"
              >
                <div className="mx-auto max-w-4xl text-left">
                  <h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
                    Frame Semantics: The Foundation
                  </h2>
                  <p className="mb-8 font-light text-lg text-muted-foreground leading-relaxed">
                    At the heart of RAGE lies Frame Semantics, pioneered by
                    Charles Fillmore. This approach treats meaning as structured
                    in frames—defined roles filled by specific elements. Unlike
                    traditional keyword matching, frame semantics captures the
                    relational context that gives words their meaning.
                  </p>
                </div>
              </SingleColumnSection>

              {/* Frame Semantics Examples - Two Column Layout */}
              <div className="grid grid-cols-2 gap-0">
                <GridCell>
                  <div className="max-w-2xl text-left">
                    <h3 className="mb-4 font-medium text-xl">
                      Traditional Approach
                    </h3>
                    <div className="mb-4 rounded-lg bg-muted/30 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-muted-foreground text-sm">
                        &quot;John sold the car to Mary for $5000&quot;
                      </pre>
                    </div>
                    <p className="font-light text-muted-foreground leading-relaxed">
                      Traditional systems see:{' '}
                      <code className="rounded bg-muted px-1 py-0.5 text-sm">
                        John
                      </code>
                      ,{' '}
                      <code className="rounded bg-muted px-1 py-0.5 text-sm">
                        sold
                      </code>
                      ,{' '}
                      <code className="rounded bg-muted px-1 py-0.5 text-sm">
                        car
                      </code>
                      ,{' '}
                      <code className="rounded bg-muted px-1 py-0.5 text-sm">
                        Mary
                      </code>
                      ,{' '}
                      <code className="rounded bg-muted px-1 py-0.5 text-sm">
                        $5000
                      </code>{' '}
                      as separate tokens.
                    </p>
                  </div>
                </GridCell>
                <GridCell className="border-r-0">
                  <div className="max-w-2xl text-left">
                    <h3 className="mb-4 font-medium text-xl">
                      Frame Semantics
                    </h3>
                    <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        <span className="font-semibold text-primary">
                          Commercial_transaction
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          ├─ <span className="text-primary">Seller:</span> John
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          ├─ <span className="text-primary">Buyer:</span> Mary
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          ├─ <span className="text-primary">Goods:</span> car
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          │ └─{' '}
                          <span className="font-semibold text-primary">
                            ItemDetails
                          </span>
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          │ ├─ <span className="text-primary">Type:</span>{' '}
                          vehicle
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          │ └─ <span className="text-primary">Condition:</span>{' '}
                          used
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          └─ <span className="text-primary">Money:</span> $5000
                        </span>
                      </pre>
                    </div>
                    <p className="font-light text-muted-foreground leading-relaxed">
                      RAGE captures the complete transactional relationship with
                      defined roles and semantic context.
                    </p>
                  </div>
                </GridCell>
              </div>

              {/* Recursive Graph Construction Section */}
              <SingleColumnSection
                className="scroll-mt-32"
                id="recursive-graphs"
              >
                <div className="mx-auto max-w-4xl text-left">
                  <h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
                    Recursive Graph Construction
                  </h2>
                  <p className="mb-8 font-light text-lg text-muted-foreground leading-relaxed">
                    Beyond individual frames, RAGE builds recursive graphs where
                    frames nest within other frames, creating hierarchies of
                    knowledge that mirror how concepts naturally relate.
                    Traditional knowledge graphs store information as flat
                    triples—RAGE builds recursive structures where complex ideas
                    contain other complex ideas.
                  </p>
                </div>
              </SingleColumnSection>

              {/* Graph Structure Examples - Two Column Layout */}
              <div className="grid grid-cols-2 gap-0">
                <GridCell>
                  <div className="max-w-2xl text-left">
                    <h3 className="mb-4 font-medium text-xl">
                      Traditional Knowledge Graph
                    </h3>
                    <div className="mb-4 rounded-lg bg-muted/30 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-muted-foreground text-sm">
                        Flat triples:
                        <br />
                        Paper_123 hasAuthor &quot;Smith&quot;
                        <br />
                        Paper_123 hasTitle &quot;AI Research&quot;
                        <br />
                        Paper_123 contains Claim_456
                        <br />
                        Claim_456 hasText &quot;AI improves efficiency&quot;
                        <br />
                        Evidence_789 supports Claim_456
                      </pre>
                    </div>
                    <p className="font-light text-muted-foreground leading-relaxed">
                      Everything is stored as disconnected facts. Relationships
                      exist but the deeper structure and meaning are lost.
                    </p>
                  </div>
                </GridCell>
                <GridCell className="border-r-0">
                  <div className="max-w-2xl text-left">
                    <h3 className="mb-4 font-medium text-xl">
                      RAGE&apos;s Recursive Structure
                    </h3>
                    <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <pre className="whitespace-pre-wrap font-mono text-sm">
                        <span className="font-semibold text-primary">
                          ResearchCategory
                        </span>{' '}
                        &quot;AI Productivity Studies&quot;
                        <br />
                        <span className="text-muted-foreground">
                          └─{' '}
                          <span className="font-semibold text-primary">
                            Summary
                          </span>{' '}
                          &quot;AI Research Overview&quot;
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          {' '}
                          ├─{' '}
                          <span className="font-semibold text-primary">
                            ClaimSupportStructure
                          </span>
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          {' '}
                          │ ├─ <span className="text-primary">Claim:</span>{' '}
                          &quot;AI improves efficiency&quot;
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          {' '}
                          │ ├─ <span className="text-primary">Evidence:</span>{' '}
                          &quot;Study of 500 companies&quot;
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          {' '}
                          │ │ └─{' '}
                          <span className="font-semibold text-primary">
                            SourceAttribution
                          </span>
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          {' '}
                          │ │ ├─ <span className="text-primary">Author:</span>{' '}
                          &quot;MIT Research Lab&quot;
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          {' '}
                          │ │ └─ <span className="text-primary">Date:</span>{' '}
                          &quot;2024-03-15&quot;
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          {' '}
                          │ └─ <span className="text-primary">Context:</span>{' '}
                          &quot;Manufacturing sector&quot;
                        </span>
                        <br />
                        <span className="text-muted-foreground">
                          {' '}
                          └─{' '}
                          <span className="font-semibold text-primary">
                            FutureWork
                          </span>{' '}
                          &quot;Test in healthcare&quot;
                        </span>
                      </pre>
                    </div>
                    <p className="font-light text-muted-foreground leading-relaxed">
                      Ideas nest naturally within other ideas, preserving the
                      logical structure and making complex reasoning possible.
                    </p>
                  </div>
                </GridCell>
              </div>

              {/* Operations as Knowledge Section */}
              <SingleColumnSection
                className="scroll-mt-32"
                id="operations-as-knowledge"
              >
                <div className="mx-auto max-w-4xl text-left">
                  <h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
                    Operations as Knowledge: The Self-Instructing System
                  </h2>
                  <p className="mb-8 font-light text-lg text-muted-foreground leading-relaxed">
                    RAGE doesn&apos;t just store knowledge—it stores knowledge
                    about how to work with knowledge. The system treats actions
                    like &quot;summarize this research&quot; or &quot;find
                    related concepts&quot; as structured information that can be
                    discovered, suggested, and combined intelligently. Most
                    importantly, the system instructs itself through these
                    operation hints—it ingests knowledge, identifies potential
                    actions, and then comes back to perform them later.
                  </p>
                </div>
              </SingleColumnSection>

              {/* Operations Examples - Two Column Layout */}
              <div className="grid grid-cols-2 gap-0">
                <GridCell>
                  <div className="max-w-2xl text-left">
                    <h3 className="mb-4 font-medium text-xl">
                      Traditional Approach
                    </h3>
                    <div className="mb-4 rounded-lg bg-muted/30 p-4">
                      <p className="text-muted-foreground text-sm">
                        Fixed menu of actions:
                        <br />• Summarize
                        <br />• Find related
                        <br />• Generate questions
                        <br />
                        <br />
                        Same options everywhere, regardless of content type or
                        context.
                      </p>
                    </div>
                    <p className="font-light text-muted-foreground leading-relaxed">
                      Users get the same generic tools everywhere. The system
                      waits for explicit commands and can&apos;t learn from
                      patterns of use.
                    </p>
                  </div>
                </GridCell>
                <GridCell className="border-r-0">
                  <div className="max-w-2xl text-left">
                    <h3 className="mb-4 font-medium text-xl">
                      RAGE&apos;s Self-Instructing Operations
                    </h3>
                    <div className="mb-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
                      <p className="text-muted-foreground text-sm">
                        Context-aware suggestions:
                        <br />•{' '}
                        <span className="text-primary">For a hypothesis:</span>{' '}
                        &quot;Generate test cases&quot;
                        <br />•{' '}
                        <span className="text-primary">For evidence:</span>{' '}
                        &quot;Find contradictions&quot;
                        <br />•{' '}
                        <span className="text-primary">For a method:</span>{' '}
                        &quot;Identify limitations&quot;
                        <br />
                        <br />
                        <span className="font-medium text-primary">
                          The system creates its own to-do list
                        </span>{' '}
                        based on what it learns.
                      </p>
                    </div>
                    <p className="font-light text-muted-foreground leading-relaxed">
                      The system understands your content, suggests relevant
                      actions, and creates operation hints for future
                      processing—essentially instructing itself.
                    </p>
                  </div>
                </GridCell>
              </div>

              {/* Lineage of Ideas Header */}
              <SingleColumnSection>
                <div className="mx-auto max-w-4xl text-left">
                  <h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
                    Lineage of Ideas
                  </h2>
                  <p className="font-light text-lg text-muted-foreground leading-relaxed">
                    RAGE stands on the shoulders of giants, drawing from
                    diverse, foundational theories:
                  </p>
                </div>
              </SingleColumnSection>

              {/* Lineage Cards - First Row (3x1) */}
              <ThreeColumnSection>
                <GridCell>
                  <div className="h-full rounded-lg border border-border p-4">
                    <h4 className="mb-2 font-medium text-foreground">
                      Frame Semantics
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Charles Fillmore&apos;s theory that meaning is structured
                      in frames—defined roles filled by specific elements.
                    </p>
                  </div>
                </GridCell>
                <GridCell>
                  <div className="h-full rounded-lg border border-border p-4">
                    <h4 className="mb-2 font-medium text-foreground">
                      Society of Mind
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Minsky&apos;s concept of knowledge as nested structures
                      with triggers and roles.
                    </p>
                  </div>
                </GridCell>
                <GridCell>
                  <div className="h-full rounded-lg border border-border p-4">
                    <h4 className="mb-2 font-medium text-foreground">
                      Construction Grammar
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Adele Goldberg&apos;s theory that meaning emerges from
                      recurring relational patterns.
                    </p>
                  </div>
                </GridCell>
              </ThreeColumnSection>

              {/* Lineage Cards - Second Row (2x1) */}
              <div className="grid grid-cols-2 gap-0">
                <GridCell>
                  <div className="h-full rounded-lg border border-border p-4">
                    <h4 className="mb-2 font-medium text-foreground">
                      Discourse Representation Theory
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Hans Kamp&apos;s approach to context and meaning across
                      sentences and conversations.
                    </p>
                  </div>
                </GridCell>
                <GridCell className="border-r-0">
                  <div className="h-full rounded-lg border border-border p-4">
                    <h4 className="mb-2 font-medium text-foreground">
                      Homoiconicity
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      Lisp&apos;s principle where data and code share
                      structures, echoed in how RAGE treats frames as executable
                      constructs.
                    </p>
                  </div>
                </GridCell>
              </div>

              {/* Comparison Header */}
              <SingleColumnSection className="scroll-mt-32" id="comparison">
                <div className="mx-auto max-w-4xl text-left">
                  <h2 className="mb-6 font-medium text-2xl tracking-tight md:text-3xl">
                    Why RAGE vs Other RAG Systems?
                  </h2>
                  <p className="font-light text-lg text-muted-foreground leading-relaxed">
                    Here&apos;s how Recurse&apos;s RAGE approach compares to
                    traditional RAG and GraphRAG systems:
                  </p>
                </div>
              </SingleColumnSection>

              {/* Comparison Table Section */}
              <SingleColumnSection>
                <div className="mx-auto max-w-4xl">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold">
                          Feature / Model
                        </TableHead>
                        <TableHead className="font-semibold">
                          Traditional RAG
                        </TableHead>
                        <TableHead className="font-semibold">
                          GraphRAG
                        </TableHead>
                        <TableHead className="font-semibold text-primary">
                          RAGE via Recurse
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparisonData.map((row, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {row.feature}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.traditional}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.graphRAG}
                          </TableCell>
                          <TableCell className="font-medium text-primary">
                            {row.rage}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </SingleColumnSection>
            </GridLayout>
          </AnimatedContent>
        </div>
      </ScrollAnimation>

      {/* CTA Section */}
      <CTASection />
    </>
  );
}
