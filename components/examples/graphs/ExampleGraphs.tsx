"use client";

import { useState } from "react";
import { GraphView } from "@/components/graph-view";
import codeDocumentationData from "./code-documentation.json" with {
  type: "json",
};
import newsletterData from "./newsletter.json" with { type: "json" };
import researchPaperData from "./research-paper.json" with { type: "json" };

const examples = [
  {
    id: "newsletter",
    label: "Newsletter Summary",
    description:
      "Newsletter content automatically structured into claims, evidence, and topics with semantic relationships.",
    data: newsletterData,
  },
  {
    id: "research-paper",
    label: "Research Paper",
    description:
      "Research papers are broken down into hypotheses, methods, evidence, and conclusions with their relationships preserved.",
    data: researchPaperData,
  },
  {
    id: "code-documentation",
    label: "Code Documentation",
    description:
      "Code documentation connects components, functions, examples, and usage patterns in a navigable structure.",
    data: codeDocumentationData,
  },
];

export function ExampleGraphs() {
  const [selectedExample, setSelectedExample] = useState<string>("newsletter");
  const currentExample = examples.find((ex) => ex.id === selectedExample);

  return (
    <div>
      {" "}
      {/* Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {examples.map((example) => (
            <button
              className={`rounded px-2 py-1 text-xs ${
                selectedExample === example.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              key={example.id}
              onClick={() => setSelectedExample(example.id)}
              type="button"
            >
              {example.label}
            </button>
          ))}
        </div>
      </div>
      {/* Graph Visualizer */}
      <div className="h-[500px] w-full overflow-hidden rounded-lg border bg-card">
        <GraphView
          className="h-full w-full"
          data={currentExample?.data}
          withSidebar={false}
          zoomModifier="cmd"
        />
      </div>
      {/* Description */}
      {currentExample && (
        <p className="mt-4 max-w-lg p-4 text-muted-foreground text-sm">
          {currentExample.description}
        </p>
      )}
    </div>
  );
}
