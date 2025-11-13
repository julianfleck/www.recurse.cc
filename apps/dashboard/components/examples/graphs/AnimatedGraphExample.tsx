"use client";

import {
	ChevronLeft,
	ChevronRight,
	Pause,
	Play,
	RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { GraphView } from "@/components/graph-view";

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

// Base data structure (step 1)
const baseData: { nodes: GraphNode[]; links: GraphLink[] } = {
	nodes: [
		{
			id: "doc-1",
			type: "Document:newsletter",
			title: "Tech Policy Newsletter #47",
			summary:
				"Weekly roundup of regulatory developments in technology, AI, and data privacy",
			children: [],
			metadata: {},
		},
	],
	links: [],
};

// Step additions - what gets added at each step
const stepAdditions: Record<
	number,
	{ nodes: GraphNode[]; links: GraphLink[] }
> = {
	1: { nodes: [], links: [] }, // Step 1: just the base document
	2: {
		// Step 2: Add semantic structure
		nodes: [
			{
				id: "sec-1",
				type: "heading_section",
				title: "AI Regulation Updates",
				summary:
					"Latest developments in artificial intelligence governance and policy",
				children: [],
				metadata: {
					tags: ["AI", "Regulation", "Europe"],
					hypernyms: ["Technology Policy", "Governance"],
				},
			},
			{
				id: "sec-2",
				type: "heading_section",
				title: "Data Privacy Developments",
				summary: "Recent changes and proposed updates to data protection laws",
				children: [],
				metadata: {
					tags: ["Privacy", "Data Protection", "US Policy"],
					hypernyms: ["Consumer Rights", "Digital Regulation"],
				},
			},
			{
				id: "sec-3",
				type: "heading_section",
				title: "Emerging Technologies",
				summary:
					"Latest developments in AI, quantum computing, and next-generation technologies",
				children: [],
				metadata: {
					tags: ["AI", "Quantum Computing", "Innovation"],
					hypernyms: ["Technology Advancement", "Research"],
				},
			},
		],
		links: [
			{ source: "doc-1", target: "sec-1" },
			{ source: "doc-1", target: "sec-2" },
			{ source: "doc-1", target: "sec-3" },
		],
	},
	3: {
		// Step 3: Add semantic frames (claims and evidence)
		nodes: [
			{
				id: "claim-1",
				type: "claim",
				title: "New EU AI Act requires transparency",
				summary:
					"The European Union's comprehensive AI legislation mandates clear documentation and accountability for AI systems",
				children: [],
				metadata: {
					tags: ["EU AI Act", "Regulation", "Transparency"],
					hypernyms: ["AI Governance", "European Policy"],
				},
			},
			{
				id: "evidence-1",
				type: "evidence",
				title: "European Parliament vote results",
				summary:
					"Parliament approved the AI Act with amendments strengthening risk assessment requirements",
				children: [],
				metadata: {
					tags: ["European Parliament", "Legislation", "Voting"],
					hypernyms: ["Policy Making", "Democratic Process"],
				},
			},
			{
				id: "claim-2",
				type: "claim",
				title: "US considers federal privacy law",
				summary:
					"Congress is advancing bipartisan legislation to establish comprehensive data privacy standards",
				children: [],
				metadata: {
					tags: ["Privacy Law", "Federal Legislation", "Data Protection"],
					hypernyms: ["US Policy", "Consumer Protection"],
				},
			},
			{
				id: "evidence-2",
				type: "evidence",
				title: "Congress committee hearings",
				summary:
					"Multiple committees held hearings on data privacy frameworks and industry accountability",
				children: [],
				metadata: {
					tags: ["Congress", "Hearings", "Oversight"],
					hypernyms: ["Government Process", "Policy Development"],
				},
			},
			{
				id: "claim-3",
				type: "claim",
				title: "Quantum computing achieves major milestone",
				summary:
					"Recent breakthroughs in quantum error correction bring scalable quantum computing closer to reality",
				children: [],
				metadata: {
					tags: ["Quantum Computing", "Breakthrough", "Scalability"],
					hypernyms: ["Technology Advancement", "Computing Innovation"],
				},
			},
			{
				id: "evidence-3",
				type: "evidence",
				title: "IBM quantum roadmap update",
				summary:
					"IBM announced significant progress in quantum error correction and plans for 1000+ qubit systems by 2025",
				children: [],
				metadata: {
					tags: ["IBM", "Quantum Roadmap", "Error Correction"],
					hypernyms: ["Technology Development", "Corporate Strategy"],
				},
			},
		],
		links: [
			{ source: "sec-1", target: "claim-1" },
			{ source: "sec-1", target: "evidence-1" },
			{ source: "claim-1", target: "evidence-1" },
			{ source: "sec-2", target: "claim-2" },
			{ source: "sec-2", target: "evidence-2" },
			{ source: "claim-2", target: "evidence-2" },
			{ source: "sec-3", target: "claim-3" },
			{ source: "sec-3", target: "evidence-3" },
			{ source: "claim-3", target: "evidence-3" },
		],
	},
	4: {
		// Step 4: Add connections to existing knowledge base
		nodes: [
			{
				id: "doc-related-1",
				type: "Document:article",
				title: "AI Ethics Framework v2.1",
				summary:
					"Comprehensive ethical guidelines for AI development and deployment",
				children: [],
				metadata: {
					tags: ["AI Ethics", "Guidelines", "Development"],
					hypernyms: ["AI Governance", "Technology Standards"],
				},
			},
			{
				id: "doc-related-2",
				type: "Document:policy",
				title: "Data Protection Regulation 2024",
				summary: "Updated privacy regulations for the digital age",
				children: [],
				metadata: {
					tags: ["Privacy", "Regulation", "Data Protection"],
					hypernyms: ["Consumer Rights", "Digital Law"],
				},
			},
			{
				id: "tag-ai-governance",
				type: "concept",
				title: "AI Governance",
				summary:
					"Framework for regulating artificial intelligence systems and applications",
				children: [],
				metadata: {
					tags: ["AI", "Governance", "Regulation"],
					hypernyms: ["Technology Policy", "Public Policy"],
				},
			},
			{
				id: "tag-privacy-rights",
				type: "concept",
				title: "Privacy Rights",
				summary: "Legal and ethical rights concerning personal data protection",
				children: [],
				metadata: {
					tags: ["Privacy", "Rights", "Data Protection"],
					hypernyms: ["Consumer Protection", "Digital Rights"],
				},
			},
		],
		links: [
			// Connect to related documents
			{ source: "doc-1", target: "doc-related-1" },
			{ source: "doc-1", target: "doc-related-2" },
			// Connect to existing concepts/tags
			{ source: "sec-1", target: "tag-ai-governance" },
			{ source: "claim-1", target: "tag-ai-governance" },
			{ source: "evidence-1", target: "tag-ai-governance" },
			{ source: "sec-2", target: "tag-privacy-rights" },
			{ source: "claim-2", target: "tag-privacy-rights" },
			{ source: "evidence-2", target: "tag-privacy-rights" },
			// Connect related docs to concepts
			{ source: "doc-related-1", target: "tag-ai-governance" },
			{ source: "doc-related-2", target: "tag-privacy-rights" },
		],
	},
};

// Define the animation steps - each step specifies what gets added
const animationSteps = [
	// Step 1: Root document only
	{
		stepNumber: 1,
		description: "Document ingested and basic metadata extracted",
	},
	// Step 2: Add semantic structure
	{
		stepNumber: 2,
		description: "Identified semantic structure and section hierarchy",
	},
	// Step 3: Add semantic frames
	{
		stepNumber: 3,
		description: "Extracted semantic frames",
	},
	// Step 4: Add connections to knowledge base
	{
		stepNumber: 4,
		description: "Establishing connections to existing knowledge base",
	},
];

// Function to build data structure up to a given step
function buildDataUpToStep(stepNumber: number) {
	const result = {
		nodes: [...baseData.nodes],
		links: [...baseData.links],
	};

	// Add all step additions up to the current step
	for (let i = 1; i <= stepNumber; i++) {
		if (stepAdditions[i]) {
			result.nodes.push(...stepAdditions[i].nodes);
			result.links.push(...stepAdditions[i].links);
		}
	}

	return result;
}

const STEP_DELAY_MS = 2500; // 2.5 second delay between steps
const PROGRESS_BAR_WIDTH_PERCENT = 100; // 100% for full width
const INITIAL_FIT_DELAY_MS = 500; // Delay before initial fit to view
const STEP_CHANGE_FIT_DELAY_MS = 300; // Delay before fit to view after step change
const RELOAD_FIT_DELAY_MS = 300; // Delay before fit to view after reload

export function AnimatedGraphExample() {
	const [currentStep, setCurrentStep] = useState(0); // Start with step 0 (first step)
	const [isAutoPlaying, setIsAutoPlaying] = useState(true); // Auto-play by default
	const [isComplete, setIsComplete] = useState(false); // Track if animation is complete
	const [data, setData] = useState(() => buildDataUpToStep(1)); // Graph data state

	// Initial fit to view when component mounts
	useEffect(() => {
		const timer = setTimeout(() => {
			const fitEvent = new KeyboardEvent("keydown", { key: "0" });
			document.dispatchEvent(fitEvent);
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
			setCurrentStep((prev) => prev + 1);
		}, STEP_DELAY_MS);

		return () => clearTimeout(timer);
	}, [isAutoPlaying, currentStep]);

	// Update data when step changes
	useEffect(() => {
		const stepData = animationSteps[currentStep];
		if (stepData) {
			setData(buildDataUpToStep(stepData.stepNumber));

			// Fit to view after a brief delay to let the graph render
			setTimeout(() => {
				const fitEvent = new KeyboardEvent("keydown", { key: "0" });
				document.dispatchEvent(fitEvent);
			}, STEP_CHANGE_FIT_DELAY_MS);
		}
	}, [currentStep]);

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
		setData(buildDataUpToStep(1));

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
		<div>
			<div className="mt-8 mb-4">
				{/* Graph Visualization */}
				<div className="h-[500px] w-full overflow-hidden rounded-lg border bg-card">
					<GraphView
						className="h-full w-full"
						data={data}
						depth={4}
						withSidebar={false}
						zoomModifier="cmd"
					/>
				</div>

				{/* Progress indicator with description */}
				<div className="mt-2 mb-4 flex items-center gap-3 rounded-md border border-border p-2">
					<button
						className="flex-shrink-0 rounded p-1 hover:bg-secondary"
						onClick={buttonHandler}
						title={buttonTitle}
						type="button"
					>
						{buttonIcon}
					</button>

					<span className="flex-shrink-0 whitespace-nowrap font-medium text-sm">
						Step {currentStep + 1} of {animationSteps.length}
					</span>

					<div className="h-2 w-24 flex-shrink-0 overflow-hidden rounded-full bg-secondary">
						<div
							className="h-full bg-primary transition-all duration-500"
							style={{
								width: `${((currentStep + 1) / animationSteps.length) * PROGRESS_BAR_WIDTH_PERCENT}%`,
							}}
						/>
					</div>

					<div className="flex min-w-0 grow items-center justify-between gap-1">
						<span className="line-clamp-1 min-w-0 font-mono text-muted-foreground text-xs">
							{currentStepData.description}
						</span>

						<div className="flex flex-shrink-0 items-center gap-1">
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
			</div>
		</div>
	);
}
