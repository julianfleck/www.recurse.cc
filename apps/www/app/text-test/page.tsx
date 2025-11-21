"use client"

import { useState } from "react"
import { TextTransitionPair } from "@/components/text-transitions/pair"

const HERO_HEADLINES: string[] = [
  "Infrastructure for Sense-making, not just Retrieval",
  "Memory Infrastructure for Understanding, not just Similarity Search",
  "Memory Substrate for Exploration, not just Question-Answering",
  "Knowledge Graph for Discovery, not just Fact-Finding",
]

export default function TextTestPage() {
  const [index, setIndex] = useState(0)
  const from = HERO_HEADLINES[index]
  const to = HERO_HEADLINES[(index + 1) % HERO_HEADLINES.length]

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-4xl font-bold">Two-Text Transition (One-shot)</h1>
        <p className="text-muted-foreground">
          Component compares two texts, fades out non-shared tokens, opens gaps, and fades in new tokens. Click Next to feed a new pair.
        </p>
        <div className="flex gap-4">
          <button
            className="px-3 py-2 rounded-md border hover:bg-card"
            onClick={() => setIndex((i) => (i + 1) % HERO_HEADLINES.length)}
          >
            Next
          </button>
        </div>
      </div>

      <section className="max-w-4xl mx-auto space-y-4">
        <div className="border rounded-lg p-8 bg-card">
          <p className="font-semibold text-2xl leading-[1.15] tracking-tight text-foreground md:text-4xl lg:text-5xl">
            <TextTransitionPair fromText={from} toText={to} durationMs={1400} />
          </p>
        </div>
      </section>
    </div>
  )
}

