"use client";

import {
	ChevronLeft,
	ChevronRight,
	Pause,
	Play,
	RotateCcw,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { GraphView } from "@/components/graph-view";
import { cn } from "@/lib/cn";
import defaultData from "./default-example.json" with { type: "json" };

type GraphNode = {
	id: string;
	type: string;
	title: string;
	summary: string;
	children: unknown[];
	metadata: Record<string, unknown>;
};

type GraphLink = {
	source: string;
	target: string;
};

type AnimationStep = {
	stepNumber: number;
	description: string;
};

export type AnimationData = {
	baseData: { nodes: GraphNode[]; links: GraphLink[] };
	stepAdditions: Record<
		number | string,
		{ nodes: GraphNode[]; links: GraphLink[] }
	>;
	animationSteps: AnimationStep[];
	initialDepth?: number;
};

// Function to build data structure up to a given step
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

	// Add all step additions up to the current step
	// Handle both numeric and string keys (JSON uses string keys)
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

const STEP_DELAY_MS = 3000; // 3 second delay between steps
const PROGRESS_BAR_WIDTH_PERCENT = 100; // 100% for full width
const INITIAL_FIT_DELAY_MS = 500; // Delay before initial fit to view
const STEP_CHANGE_FIT_DELAY_MS = 300; // Delay before fit to view after step change
const RELOAD_FIT_DELAY_MS = 300; // Delay before fit to view after reload

type AnimatedGraphExampleProps = {
	data?: AnimationData;
	className?: string;
};

export function AnimatedGraphExample({
	data,
	className,
}: AnimatedGraphExampleProps = {}) {
	const animationData = data ?? (defaultData as AnimationData);

	const { baseData, stepAdditions, animationSteps, initialDepth } =
		animationData;

	const [currentStep, setCurrentStep] = useState(0); // Start with step 0 (first step)
	const [isAutoPlaying, setIsAutoPlaying] = useState(true); // Auto-play by default
	const [isComplete, setIsComplete] = useState(false); // Track if animation is complete
	const [graphData, setGraphData] = useState(() =>
		buildDataUpToStep(1, baseData, stepAdditions),
	); // Graph data state
	const [graphDataHash, setGraphDataHash] = useState(() => {
		// Create a hash of the graph data structure to detect actual changes
		const initialData = buildDataUpToStep(1, baseData, stepAdditions);
		return JSON.stringify({
			nodes: initialData.nodes.map((n) => n.id),
			links: initialData.links,
		});
	});
	const [fitTick, setFitTick] = useState(0);

	const containerRef = useRef<HTMLDivElement>(null);

	// Reset state when data prop changes (e.g., tab switch)
	useEffect(() => {
		// Reset to initial state with new data
		setCurrentStep(0);
		setIsAutoPlaying(true);
		setIsComplete(false);

		const initialData = buildDataUpToStep(1, baseData, stepAdditions);
		setGraphData(initialData);

		const initialHash = JSON.stringify({
			nodes: initialData.nodes.map((n) => n.id),
			links: initialData.links,
		});
		setGraphDataHash(initialHash);

		// Trigger fit to view after a brief delay to ensure GraphView has mounted/updated
		const timer = setTimeout(() => {
			const fitEvent = new KeyboardEvent("keydown", { key: "0" });
			document.dispatchEvent(fitEvent);
		}, INITIAL_FIT_DELAY_MS);

		return () => clearTimeout(timer);
	}, [baseData, stepAdditions]);

	// Initial fit to view when component mounts
	useEffect(() => {
		const timer = setTimeout(() => {
			const fitEvent = new KeyboardEvent("keydown", { key: "0" });
			document.dispatchEvent(fitEvent);
			setFitTick((t) => t + 1);
		}, INITIAL_FIT_DELAY_MS);

		return () => clearTimeout(timer);
	}, []);

	// Auto-play through steps (only when not manually controlled)
	useEffect(() => {
		if (!isAutoPlaying || currentStep >= animationSteps.length - 1) {
			// Mark as complete when we reach the final step
			if (currentStep >= animationSteps.length - 1) {
				setIsComplete(true);
				setIsAutoPlaying(false);
			}
			return;
		}

		const timer = setTimeout(() => {
			setCurrentStep((prev: number) => prev + 1);
		}, STEP_DELAY_MS);

		return () => clearTimeout(timer);
	}, [isAutoPlaying, currentStep, animationSteps.length]);

	// Update data when step changes
	useEffect(() => {
		const stepData = animationSteps[currentStep];
		if (stepData) {
			const newGraphData = buildDataUpToStep(
				stepData.stepNumber,
				baseData,
				stepAdditions,
			);

			// Create hash to detect if data actually changed
			const newHash = JSON.stringify({
				nodes: newGraphData.nodes.map((n) => n.id),
				links: newGraphData.links,
			});

			// Only update if data actually changed
			if (newHash !== graphDataHash) {
				setGraphData(newGraphData);
				setGraphDataHash(newHash);
			}

			// Fit to view after a brief delay to let the graph render
			setTimeout(() => {
				const fitEvent = new KeyboardEvent("keydown", { key: "0" });
				document.dispatchEvent(fitEvent);
				setFitTick((t) => t + 1);
			}, STEP_CHANGE_FIT_DELAY_MS);
		}
	}, [currentStep, baseData, stepAdditions, animationSteps, graphDataHash]);

	const handleStepBack = () => {
		if (currentStep > 0) {
			setIsAutoPlaying(false); // Pause auto-play when manually navigating
			setIsComplete(false); // Reset complete state when manually navigating
			setCurrentStep(currentStep - 1);
		}
	};

	const handleStepForward = () => {
		if (currentStep < animationSteps.length - 1) {
			setIsAutoPlaying(false); // Pause auto-play when manually navigating
			setIsComplete(false); // Reset complete state when manually navigating
			setCurrentStep(currentStep + 1);
		}
	};

	const handleReload = () => {
		// Reset all state to initial values
		setCurrentStep(0);
		setIsAutoPlaying(true);
		setIsComplete(false);

		// Reset to step 1 data
		const initialData = buildDataUpToStep(1, baseData, stepAdditions);
		setGraphData(initialData);
		const initialHash = JSON.stringify({
			nodes: initialData.nodes.map((n) => n.id),
			links: initialData.links,
		});
		setGraphDataHash(initialHash);

		// Fit to view after reset
		setTimeout(() => {
			const fitEvent = new KeyboardEvent("keydown", { key: "0" });
			document.dispatchEvent(fitEvent);
		}, RELOAD_FIT_DELAY_MS);
	};

	const currentStepData = animationSteps[currentStep];

	// Determine button content and handler
	let buttonIcon: React.ReactNode;
	let buttonTitle: string;
	let buttonHandler: () => void;

	if (isComplete) {
		buttonIcon = <RotateCcw className="h-4 w-4" />;
		buttonTitle = "Restart animation";
		buttonHandler = handleReload;
	} else if (isAutoPlaying) {
		buttonIcon = <Pause className="h-4 w-4" />;
		buttonTitle = "Pause auto-play";
		buttonHandler = () => setIsAutoPlaying(!isAutoPlaying);
	} else {
		buttonIcon = <Play className="h-4 w-4" />;
		buttonTitle = "Resume auto-play";
		buttonHandler = () => setIsAutoPlaying(!isAutoPlaying);
	}

	return (
		<div
			className={cn("mt-8 mb-4", className)}
			key={`graph-${graphDataHash.slice(0, 16)}`}
			ref={containerRef}
		>
			<div
				className={cn(
					"h-[500px] w-full overflow-hidden rounded-lg border bg-card",
					className,
				)}
			>
				<GraphView
					data={graphData}
					depth={initialDepth ?? 1000}
					fitSignal={fitTick}
					withSidebar={false}
					zoomModifier="cmd"
				/>
			</div>
			{/* Progress indicator with description - only show if more than one step */}
			{animationSteps.length > 1 && (
				<div className="mt-2 mb-4 flex items-center gap-3 rounded-md border border-border p-2">
					<button
						className="shrink-0 rounded p-1 hover:bg-secondary"
						onClick={buttonHandler}
						title={buttonTitle}
						type="button"
					>
						{buttonIcon}
					</button>

					<span className="shrink-0 whitespace-nowrap font-medium text-sm">
						Step {currentStep + 1} of {animationSteps.length}
					</span>

					<div className="h-2 w-24 shrink-0 overflow-hidden rounded-full bg-secondary">
						<div
							className="h-full bg-primary transition-all duration-500"
							style={{
								width: `${
									((currentStep + 1) / animationSteps.length) *
									PROGRESS_BAR_WIDTH_PERCENT
								}%`,
							}}
						/>
					</div>

					<div className="flex min-w-0 grow items-center justify-between gap-1">
						<span className="line-clamp-1 min-w-0 font-mono text-muted-foreground text-xs">
							{currentStepData.description}
						</span>

						<div className="flex shrink-0 items-center gap-1">
							<button
								className="rounded p-1 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
								disabled={currentStep <= 0}
								onClick={handleStepBack}
								title="Previous step"
								type="button"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							<button
								className="rounded p-1 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
								disabled={currentStep >= animationSteps.length - 1}
								onClick={handleStepForward}
								title="Next step"
								type="button"
							>
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
