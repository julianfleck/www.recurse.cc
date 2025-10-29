"use client";

import { GraphView } from "@/components/graph-view";

export default function Page() {
  return (
    <div className="h-[calc(100vh-var(--fd-nav-height))] w-full overflow-hidden">
      <GraphView
        className="h-full w-full"
        depth={0}
        withSidebar={false}
        zoomModifier=""
      />
    </div>
  );
}