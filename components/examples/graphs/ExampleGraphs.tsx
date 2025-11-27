"use client";

import { useState } from "react";
import { GraphView } from "@/components/graph-view";
import recurseSteppedData from "./default-example.json" with { type: "json" };
import codeDocumentationData from "./code-documentation.json" with {
  type: "json",
};
import newsletterData from "./newsletter.json" with { type: "json" };
import researchPaperData from "./research-paper.json" with { type: "json" };

type GraphNode = {
  id: string;
  // Other properties are present but not required for GraphView typing here
  // so we keep this minimal and structural.
};

type GraphLink = {
  source: string;
  target: string;
};

type AnimationStep = {
  stepNumber: number;
  description: string;
};

type SteppedAnimationData = {
  baseData: { nodes: GraphNode[]; links: GraphLink[] };
  stepAdditions: Record<
    number | string,
    { nodes: GraphNode[]; links: GraphLink[] }
  >;
  animationSteps: AnimationStep[];
};

function buildDataUpToStep(
  stepNumber: number,
  baseData: { nodes: GraphNode[]; links: GraphLink[] },
  stepAdditions: Record<
    number | string,
    { nodes: GraphNode[]; links: GraphLink[] }
  >,
) {
  const result = {
    nodes: [...baseData.nodes],
    links: [...baseData.links],
  };

  for (let i = 1; i <= stepNumber; i++) {
    const stepKey = i.toString();
    if (stepAdditions[i] || stepAdditions[stepKey]) {
      const stepData = stepAdditions[i] ?? stepAdditions[stepKey];
      if (stepData) {
        result.nodes.push(...stepData.nodes);
        result.links.push(...stepData.links);
      }
    }
  }

  return result;
}

const recurseStepped = recurseSteppedData as SteppedAnimationData;
const finalStepNumber =
  recurseStepped.animationSteps[recurseStepped.animationSteps.length - 1]
    ?.stepNumber ?? 1;
const recurseStaticData = buildDataUpToStep(
  finalStepNumber,
  recurseStepped.baseData,
  recurseStepped.stepAdditions,
);

const examples = [
  {
    id: "recurse",
    label: "Recurse Knowledge Graph",
    description:
      "Recurse turns your documents into a living knowledge graph of arguments, evidence, and relationships you can actually explore.",
    data: recurseStaticData,
  },
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
  const [selectedExample, setSelectedExample] = useState<string>("recurse");
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
