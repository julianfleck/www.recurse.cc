// BlurText removed - no longer used

import {
  ArrowRight,
  Brain,
  GitGraph,
  InfinityIcon,
  Layers,
  Search,
  SendToBack,
} from 'lucide-react';
import Link from 'next/link';
import AnimatedContent from '@/components/animations/AnimatedContent/AnimatedContent';
import ScrollAnimation from '@/components/animations/ScrollAnimation/ScrollAnimation';
import { CTASection } from '@/components/common/CTASection';
import { DocsLinkButton } from '@/components/common/DocsLinkButton';
import { SignupForm } from '@/components/forms/SignupForm';
import { FeatureCard } from '@/components/layout/FeatureCard';
// Import new grid components
import {
  GridCell,
  GridLayout,
  SingleColumnSection,
  ThreeColumnSection,
} from '@/components/layout/GridLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';

export default function HomePage() {
  return (
    <>
      {/* Hero Section - Above Grid, Centered */}
      <ScrollAnimation
        enableFadeIn={true}
        enableFadeOut={true}
        exitBlur={12}
        exitScale={0.9}
      >
        <div className="relative z-10 mx-auto max-w-4xl pb-16">
          <div className="container mx-auto px-4 py-12 sm:px-6 md:px-12 md:py-20 lg:px-16 xl:px-20">
            <div className="mx-auto max-w-6xl text-left">
              {/* 1. Main Headline */}
              <AnimatedContent
                blur={true}
                delay={0.3}
                direction="vertical"
                distance={80}
                duration={1.0}
                initialBlur={8}
              >
                <h1 className="mb-12 font-medium text-2xl leading-[1.1] tracking-tight md:text-4xl lg:text-6xl">
                  The Universal Memory Layer for AI
                </h1>
              </AnimatedContent>

              {/* 2. Intro Content - Appears after headline */}
              <AnimatedContent
                blur={true}
                delay={1.5}
                direction="vertical"
                distance={60}
                duration={0.8}
                initialBlur={6}
              >
                <div>
                  {/* Recurse turns raw input... */}
                  <p className="mx-auto mb-4 max-w-5xl text-left font-medium text-foreground text-lg leading-normal md:text-2xl">
                    Recurse turns raw input into structured, agent-ready
                    context.
                  </p>

                  {/* Main text and buttons */}
                  <p className="mx-auto mb-12 max-w-5xl text-left font-light text-base text-muted-foreground leading-normal transition-colors duration-300 hover:text-foreground/80 md:text-2xl">
                    AI applications need context that makes sense. Recurse is
                    the memory backend for building systems that are supposed to{' '}
                    <span className="underline underline-offset-6">
                      understand
                    </span>{' '}
                    instead of blindly retrieving similar chunks. Ingest
                    unstructured content from anywhere and transform it into a
                    living, structured knowledge graph that AI (and you) can act
                    on, reason through, and build on top of.
                  </p>

                  <div className="flex justify-start gap-4">
                    <Button
                      asChild
                      className="group rounded-full px-4 py-3 font-medium text-base"
                      size="default"
                      variant="default"
                    >
                      <Link href="/about">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                    <DocsLinkButton variant="subtle">
                      Read the docs
                    </DocsLinkButton>
                  </div>
                </div>
              </AnimatedContent>
            </div>
          </div>
        </div>
      </ScrollAnimation>

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
              {/* Value Proposition Header */}
              <SingleColumnSection id="about">
                <div className="max-w-2xl text-left">
                  <h2 className="mb-4 font-medium text-2xl tracking-tight md:text-3xl">
                    Recurse gives you context that&apos;s structured,
                    composable, and recursive
                  </h2>
                  <p className="font-light text-lg text-muted-foreground leading-relaxed">
                    Traditional data systems force you to choose between
                    structure and flexibility. Recurse gives you both – turning
                    unstructured inputs into composable knowledge graphs that
                    evolve with every user interaction.
                  </p>
                </div>
              </SingleColumnSection>

              {/* Value Proposition Features - Custom Responsive Grid */}
              <div className="grid grid-cols-1 gap-0 lg:grid-cols-3">
                {/* Row 1: Icon Left, Structured Text Right */}
                <GridCell className="flex items-center justify-start lg:col-span-1 lg:justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10">
                    <GitGraph
                      className="h-8 w-8 text-secondary"
                      strokeWidth={1.5}
                    />
                  </div>
                </GridCell>
                <GridCell className="flex items-center lg:col-span-2">
                  <div className="max-w-2xl text-left">
                    <h3 className="mb-3 font-medium text-xl">Structured</h3>
                    <p className="font-light text-muted-foreground leading-relaxed">
                      Recurse parses knowledge into semantic frames – meaningful
                      structures with defined roles and relationships. Each
                      piece of information becomes a typed, queryable entity
                      that preserves context and meaning.
                    </p>
                  </div>
                </GridCell>

                {/* Row 2: Composable Text Left, Icon Right */}
                <GridCell className="order-4 flex items-center lg:order-none lg:col-span-2">
                  <div className="max-w-2xl text-left">
                    <h3 className="mb-3 font-medium text-xl">Composable</h3>
                    <p className="font-light text-muted-foreground leading-relaxed">
                      Frames nest within other frames, creating hierarchies of
                      knowledge that mirror how concepts naturally relate.
                      Extract insights from one document and seamlessly
                      integrate them into new contexts, building layered
                      understanding with full traceability.
                    </p>
                  </div>
                </GridCell>
                <GridCell className="order-3 flex items-center justify-start lg:order-none lg:col-span-1 lg:justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10">
                    <SendToBack
                      className="h-8 w-8 text-secondary"
                      strokeWidth={1.5}
                    />
                  </div>
                </GridCell>

                {/* Row 3: Icon Left, Recursive Text Right */}
                <GridCell className="flex items-center justify-start lg:col-span-1 lg:justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-secondary/20 bg-secondary/10">
                    <InfinityIcon
                      className="h-8 w-8 text-secondary"
                      strokeWidth={1.5}
                    />
                  </div>
                </GridCell>
                <GridCell className="flex items-center lg:col-span-2">
                  <div className="max-w-2xl text-left">
                    <h3 className="mb-3 font-medium text-xl">Recursive</h3>
                    <p className="font-light text-muted-foreground leading-relaxed">
                      Every query becomes part of the graph itself, capturing
                      interaction patterns and usage contexts. The system learns
                      from questions and searches, building richer context
                      through use. Knowledge grows not just from new inputs, but
                      from how ideas are explored and connected.
                    </p>
                  </div>
                </GridCell>
              </div>

              {/* What You Can Build Header and Table */}
              <SingleColumnSection>
                <div className="max-w-2xl text-left">
                  <h2 className="mb-4 font-medium text-2xl tracking-tight md:text-3xl">
                    What You Can Build
                  </h2>
                  <p className="mb-8 font-light text-lg text-muted-foreground leading-relaxed">
                    From AI assistants to knowledge workspaces, build
                    applications that understand context and adapt to how people
                    actually think and work.
                  </p>

                  {/* Examples Table */}
                  <div className="max-w-full">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="w-1/3 font-medium">
                            AI Assistants
                          </TableCell>
                          <TableCell className="font-light text-muted-foreground">
                            that retain context across time and sources
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="w-1/3 font-medium">
                            Knowledge Workspaces
                          </TableCell>
                          <TableCell className="font-light text-muted-foreground">
                            that adapt to your thought process
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="w-1/3 font-medium">
                            Collaborative Agents
                          </TableCell>
                          <TableCell className="font-light text-muted-foreground">
                            that plan, remember, and reason like real
                            collaborators
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="w-1/3 font-medium">
                            Live Dashboards
                          </TableCell>
                          <TableCell className="font-light text-muted-foreground">
                            that update from live semantic inputs, not stale
                            metrics
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </SingleColumnSection>

              {/* Use Cases - Three Columns */}
              <ThreeColumnSection>
                <GridCell>
                  <FeatureCard
                    description="Build smarter apps without reinventing infrastructure. Recurse provides a plug-and-play backend for parsing, embedding, and graphifying your inputs—with full traceability and LLM-readiness."
                    icon={Brain}
                    iconStrokeWidth={1.5}
                    title="For Developers"
                  />
                </GridCell>

                <GridCell>
                  <FeatureCard
                    description="Turn scattered research material into a recursive graph of insights. Recurse extracts claims, actors, and citations from your corpus, allowing you to search by meaning—a living thinking partner, not a static archive."
                    icon={Search}
                    iconStrokeWidth={1.5}
                    title="For Researchers"
                  />
                </GridCell>

                <GridCell>
                  <FeatureCard
                    description="Automatically classify and route incoming information: feedback, decisions, blockers, ideas. Recurse turns chaos into clarity by structuring communication threads and surfacing relationships across teams."
                    icon={Layers}
                    iconStrokeWidth={1.5}
                    title="For Teams"
                  />
                </GridCell>
              </ThreeColumnSection>
            </GridLayout>
          </AnimatedContent>
        </div>
      </ScrollAnimation>

      {/* Signup Form Section - Separate from main content */}
      <div className="relative z-10 py-16 md:py-24">
        <ScrollAnimation enableFadeOut={true} exitBlur={2} exitScale={0.99}>
          <AnimatedContent
            delay={0.2}
            direction="vertical"
            distance={60}
            duration={0.8}
          >
            <GridLayout maxWidth="lg">
              <SingleColumnSection
                cellClassName="p-0 md:p-0 border-b-0"
                id="beta"
              >
                <SignupForm />
              </SingleColumnSection>
            </GridLayout>
          </AnimatedContent>
        </ScrollAnimation>
      </div>

      {/* Final CTA Section */}
      <CTASection />
    </>
  );
}
