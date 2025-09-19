import type { IconProps } from "@tabler/icons-react";
import {
  IconAlertTriangle,
  IconArrowsJoin,
  IconArrowsSplit,
  IconBackground,
  IconBlockquote,
  IconBook,
  IconBulb,
  IconCircles,
  IconFile,
  IconFileFilled,
  IconFolder,
  IconFolderOpen,
  IconHelpHexagon,
  IconHierarchy,
  IconIndentIncrease,
  IconLink,
  IconNumbers,
  IconOld,
  IconPilcrow,
  IconSourceCode,
  IconTag,
  IconTarget,
  IconTopologyRing2,
  IconZoom,
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
  claim: { Closed: IconNumbers, Open: IconNumbers, label: "Claim" },
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
  contrast: { Closed: IconBackground, Open: IconBackground, label: "Contrast" },
  reference: { Closed: IconLink, Open: IconLink, label: "Reference" },
  source_attribution: {
    Closed: IconSourceCode,
    Open: IconSourceCode,
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
  unknown: { Closed: IconCircles, Open: IconCircles, label: "Unknown" },
};

export function getNodeIcon(
  type: string,
  options: IconOptions = {}
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
  options?: IconOptions
): JSX.Element {
  return getNodeIcon(type, options).icon;
}

// Return both outline and filled variants for list UIs
export function getNodeIcons(
  type: string,
  options: Omit<IconOptions, "filled"> = {}
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
