"use client";

import { GraphView } from "@/components/graph-view";
import codeDocumentationData from "../../../components/examples/graphs/code-documentation.json" with {
  type: "json",
};

export default function Page() {
  return (
    <div className="h-[calc(100vh-var(--fd-nav-height))] w-full overflow-hidden">
      <GraphView
        className="h-full w-full"
        data={codeDocumentationData}
        withSidebar={false}
        zoomModifier=""
      />
    </div>
  );
}
