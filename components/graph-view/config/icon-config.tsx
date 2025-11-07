import type { IconProps } from "@tabler/icons-react";
import {
	IconAlertTriangle,
	IconArrowFork,
	IconArrowRight,
	IconArrowsJoin,
	IconArrowsSplit,
	IconBackground,
	IconBlockquote,
	IconBook,
	IconBoxMultipleFilled,
	IconBulb,
	IconCalendar,
	IconCheck,
	IconCircleCheck,
	IconCircleDashed,
	IconCircles,
	IconClipboardList,
	IconContrastFilled,
	IconDatabase,
	IconExclamationCircleFilled,
	IconFile,
	IconFileCheck,
	IconFileFilled,
	IconFileText,
	IconFolder,
	IconFolderOpen,
	IconGitPullRequestClosed,
	IconHandFinger,
	IconHelpHexagon,
	IconHierarchy,
	IconIndentIncrease,
	IconLink,
	IconListNumbers,
	IconMessageCircle,
	IconMessageCircleCheck,
	IconMicroscope,
	IconMoodCheck,
	IconNumbers,
	IconOld,
	IconPilcrow,
	IconQuote,
	IconRipple,
	IconSearch,
	IconSourceCode,
	IconStepInto,
	IconTag,
	IconTarget,
	IconTexture,
	IconTopologyRing2,
	IconUser,
	IconUsers,
	IconZoom,
	IconZoomScan,
} from "@tabler/icons-react";
import type { JSX } from "react";
import { normalizeTypeLabel } from "./visual-config";

export type IconLookupResult = {
	icon: JSX.Element;
	label: string;
};

export type IconOptions = {
	size?: string;
	strokeWidth?: number;
	filled?: boolean;
};

type IconCtor = React.ComponentType<IconProps>;

const ICON_MAP: Record<
	string,
	{ Closed: IconCtor; Open: IconCtor; label: string }
> = {
	document: { Closed: IconFolder, Open: IconFolderOpen, label: "Document" },
	article: { Closed: IconFile, Open: IconFileFilled, label: "Article" },
	heading_section: {
		Closed: IconIndentIncrease,
		Open: IconIndentIncrease,
		label: "Heading Section",
	},
	paragraph: { Closed: IconPilcrow, Open: IconPilcrow, label: "Paragraph" },
	claim: {
		Closed: IconExclamationCircleFilled,
		Open: IconExclamationCircleFilled,
		label: "Claim",
	},
	quote: { Closed: IconBlockquote, Open: IconBlockquote, label: "Quote" },
	example: { Closed: IconArrowsSplit, Open: IconArrowsSplit, label: "Example" },
	implication: {
		Closed: IconArrowsJoin,
		Open: IconArrowsJoin,
		label: "Implication",
	},
	experience: { Closed: IconOld, Open: IconOld, label: "Experience" },
	question: {
		Closed: IconHelpHexagon,
		Open: IconHelpHexagon,
		label: "Question",
	},
	observation: { Closed: IconZoom, Open: IconZoom, label: "Observation" },
	goal: { Closed: IconTarget, Open: IconTarget, label: "Goal" },
	insight: { Closed: IconBulb, Open: IconBulb, label: "Insight" },
	definition: { Closed: IconBook, Open: IconBook, label: "Definition" },
	contrast: {
		Closed: IconContrastFilled,
		Open: IconContrastFilled,
		label: "Contrast",
	},
	reference: { Closed: IconLink, Open: IconLink, label: "Reference" },
	source_attribution: {
		Closed: IconMessageCircleCheck,
		Open: IconMessageCircleCheck,
		label: "Source Attribution",
	},
	critique: {
		Closed: IconAlertTriangle,
		Open: IconAlertTriangle,
		label: "Critique",
	},
	tag: { Closed: IconTag, Open: IconTag, label: "Tag" },
	hyponym: {
		Closed: IconTopologyRing2,
		Open: IconTopologyRing2,
		label: "Hyponym",
	},
	hypernym: { Closed: IconHierarchy, Open: IconHierarchy, label: "Hypernym" },
	problem: {
		Closed: IconAlertTriangle,
		Open: IconAlertTriangle,
		label: "Problem",
	},
	risk: {
		Closed: IconAlertTriangle,
		Open: IconAlertTriangle,
		label: "Risk",
	},
	rootcause: {
		Closed: IconSearch,
		Open: IconSearch,
		label: "Root Cause",
	},
	analysis: {
		Closed: IconZoomScan,
		Open: IconZoomScan,
		label: "Analysis",
	},
	option: {
		Closed: IconArrowFork,
		Open: IconArrowFork,
		label: "Option",
	},
	impact: { Closed: IconRipple, Open: IconRipple, label: "Impact" },
	diagnosis: {
		Closed: IconMicroscope,
		Open: IconMicroscope,
		label: "Diagnosis",
	},
	solution: {
		Closed: IconCircleCheck,
		Open: IconCircleCheck,
		label: "Solution",
	},
	hypothesis: {
		Closed: IconHandFinger,
		Open: IconHandFinger,
		label: "Hypothesis",
	},
	background: {
		Closed: IconTexture,
		Open: IconTexture,
		label: "Background",
	},
	acknowledgement: {
		Closed: IconMoodCheck,
		Open: IconMoodCheck,
		label: "Acknowledgement",
	},
	evidence: {
		Closed: IconFileCheck,
		Open: IconFileCheck,
		label: "Evidence",
	},
	abstract: {
		Closed: IconFileText,
		Open: IconFileText,
		label: "Abstract",
	},
	dataset: {
		Closed: IconDatabase,
		Open: IconDatabase,
		label: "Dataset",
	},
	citation: {
		Closed: IconQuote,
		Open: IconQuote,
		label: "Citation",
	},
	decision: {
		Closed: IconCheck,
		Open: IconCheck,
		label: "Decision",
	},
	event: {
		Closed: IconCalendar,
		Open: IconCalendar,
		label: "Event",
	},
	discussion: {
		Closed: IconMessageCircle,
		Open: IconMessageCircle,
		label: "Discussion",
	},
	method: {
		Closed: IconStepInto,
		Open: IconStepInto,
		label: "Discussion",
	},
	limitation: {
		Closed: IconAlertTriangle,
		Open: IconAlertTriangle,
		label: "Discussion",
	},
	constraint: {
		Closed: IconAlertTriangle,
		Open: IconAlertTriangle,
		label: "Constraint",
	},
	participants: {
		Closed: IconUsers,
		Open: IconUsers,
		label: "Participants",
	},
	agenda: {
		Closed: IconClipboardList,
		Open: IconClipboardList,
		label: "Agenda",
	},
	viewpoint: {
		Closed: IconUser,
		Open: IconUser,
		label: "Viewpoint",
	},
	task: {
		Closed: IconCircleDashed,
		Open: IconCircleDashed,
		label: "Task",
	},
	followup: {
		Closed: IconArrowRight,
		Open: IconArrowRight,
		label: "Follow-up",
	},
	unknown: { Closed: IconCircles, Open: IconCircles, label: "Unknown" },
};

export function getNodeIcon(
	type: string,
	options: IconOptions = {},
): IconLookupResult {
	const nodeType = normalizeTypeLabel(type || "");
	const { size = "h-full w-full", strokeWidth = 1.5, filled = false } = options;
	const commonProps = {
		className: size,
		strokeWidth,
		"aria-hidden": false,
	};
	const entry = ICON_MAP[nodeType] ?? ICON_MAP.unknown;
	const Comp = filled ? entry.Open : entry.Closed;
	return { icon: <Comp {...commonProps} />, label: entry.label };
}

// Helper function for backward compatibility with node-visual
export function renderNodeIcon(
	type: string,
	options?: IconOptions,
): JSX.Element {
	return getNodeIcon(type, options).icon;
}

// Return both outline and filled variants for list UIs
export function getNodeIcons(
	type: string,
	options: Omit<IconOptions, "filled"> = {},
): { iconClosed: JSX.Element; iconOpen: JSX.Element; label: string } {
	const nodeType = normalizeTypeLabel(type || "");
	const { size = "h-full w-full", strokeWidth = 1.5 } = options;
	const commonProps = {
		className: size,
		strokeWidth,
		"aria-hidden": false,
	};
	const entry = ICON_MAP[nodeType] ?? ICON_MAP.unknown;
	const Closed = entry.Closed;
	const Open = entry.Open;
	return {
		iconClosed: <Closed {...commonProps} />,
		iconOpen: <Open {...commonProps} />,
		label: entry.label,
	};
}
