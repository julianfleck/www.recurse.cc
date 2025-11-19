"use client";

import { GraphView } from "@/components/graph-view";
import newsletterData from "./newsletter.json" with { type: "json" };

export function ExampleGraphs() {
	return (
		<div className="h-[500px] w-full overflow-hidden rounded-lg border bg-card">
			<GraphView
				className="h-full w-full"
				data={newsletterData}
				withSidebar={false}
				zoomModifier="cmd"
			/>
		</div>
	);
}
