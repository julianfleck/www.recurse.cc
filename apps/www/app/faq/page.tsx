import ScrollAnimation from '@/components/animations/ScrollAnimation/ScrollAnimation';
import { CTASection } from '@/components/common/CTASection';
import {
  GridLayout,
  SingleColumnSection,
} from '@/components/layout/GridLayout';

export default function FAQPage() {
  const faqs = [
    {
      question: 'What do you mean by "recursive"?',
      answer:
        "Recurse structures knowledge in nested layers. A paragraph might contain claims → which contain concepts → which reference other documents — all linked. Outputs can be re-ingested to generate new context, which feeds back into the system. It's not just a static store — it grows as you use it.",
    },
    {
      question: 'Is this like ChatGPT memory?',
      answer:
        "Not really. ChatGPT's memory stores flat notes per user. Recurse builds a semantic graph of everything you've seen, ingested, and asked — with structure, relations, and traceability. Think personal memory → vs. organizational cognition.",
    },
    {
      question: 'How is this different from a vector store?',
      answer:
        'Vector stores retrieve text that *looks similar*. Recurse retrieves nodes that *mean something similar* — with the added benefit of slot-level detail, type awareness, and multi-hop traversal.',
    },
    {
      question: 'Do I need to understand graphs to use this?',
      answer:
        'No. You can treat it like an API that gives you smarter retrieval and structured summaries. But if you *do* want to query the graph directly — you can.',
    },
    {
      question: 'What\'s "rehydration"?',
      answer:
        'Rehydration means taking a previously generated frame, answer, or insight and turning it *back into structured input* — ready to be used in a new generation or reasoning task. It closes the loop between input and output.',
    },
    {
      question: 'Why ".cc"?',
      answer:
        'Think "carbon copy" — you just copy everything into the system and it becomes your extended memory. Like how you\'d CC someone on an email to keep them in the loop, recurse.cc keeps your AI systems in the loop with all your knowledge and context.',
    },
    {
      question: 'Can I use my own LLMs?',
      answer:
        'Yes. You can plug in your own models (via OpenRouter or direct API) and control how extraction, summarization, and generation behave.',
    },
    {
      question: 'Is this just for text?',
      answer:
        'Nope. We support anything that can be parsed — audio (via Whisper), chat threads, emails, code snippets, notes, and more.',
    },
    {
      question: 'Can this power multi-agent systems?',
      answer:
        "Yes — and that's exactly what it's designed for. Agents need memory, context, and ways to reason across knowledge. Recurse provides that substrate.",
    },
    {
      question: 'Can I use this just for retrieval?',
      answer:
        'Absolutely. If you want a better way to index and search your documents semantically, without using LLMs — that works too.',
    },
    {
      question: 'Do I have to install anything?',
      answer:
        'No. Hosted API access is available. For enterprise users, we offer on-prem deployment and full control of the stack.',
    },
  ];

  return (
    <>
      {/* Header Section - Above Grid */}
      <div className="relative z-10 mx-auto max-w-4xl pb-16">
        <div className="container mx-auto px-4 py-12 sm:px-6 md:px-12 md:py-20 lg:px-16 xl:px-20">
          <div className="mx-auto max-w-6xl text-left">
            <h1 className="mb-8 font-medium text-3xl leading-[0.9] tracking-tight md:text-5xl lg:text-6xl">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto mb-12 max-w-3xl font-light text-muted-foreground text-xl leading-relaxed md:text-2xl">
              Everything you need to know about Recurse and RAGE
            </p>
          </div>
        </div>
      </div>

      {/* Main Content with Grid Layout */}
      <ScrollAnimation enableFadeOut={true} exitBlur={6} exitScale={0.98}>
        <div className="relative z-10">
          <GridLayout maxWidth="lg">
            {/* FAQ Section */}
            <SingleColumnSection>
              <div className="mx-auto max-w-4xl space-y-12">
                {faqs.map((faq, index) => (
                  <div
                    className="border-border border-b pb-8 last:border-b-0"
                    key={index}
                  >
                    <h3 className="mb-4 font-semibold text-foreground text-xl md:text-2xl">
                      {faq.question}
                    </h3>
                    <p className="font-light text-lg text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </SingleColumnSection>
          </GridLayout>
        </div>
      </ScrollAnimation>

      {/* CTA Section */}
      <CTASection />
    </>
  );
}
