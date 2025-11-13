"use client";

import {
	IconFile,
	IconFolder,
	IconFolderFilled,
	IconTag,
} from "@tabler/icons-react";
import type { ComponentType } from "react";

export type IconLibrary = "tabler" | "lucide";

export type TablerIconType = ComponentType<{
	size?: number;
	className?: string;
}>;

export type NodeVisualSpec = {
	uiLabel: string;
	Icon: TablerIconType | null;
	FilledIcon?: TablerIconType | null; // for expanded state in sidebar
	colorClass?: string; // Tailwind class for color
};

export type GraphVisualConfig = {
	iconLibrary: IconLibrary;
	// Set of type labels that are considered metadata
	metadataTypes: Set<string>;
	// Map external node type/label → visual spec
	labelMap: Record<string, NodeVisualSpec>;
};

export const defaultGraphVisualConfig: GraphVisualConfig = {
	iconLibrary: "tabler",
	metadataTypes: new Set(["tag", "hyponym", "hypernym", "metadata"]),
	labelMap: {
		document: {
			uiLabel: "Document",
			Icon: IconFile,
			colorClass: "bg-secondary text-secondary-foreground",
		},
		article: {
			uiLabel: "Article",
			Icon: IconFile,
			colorClass: "bg-primary text-primary-foreground",
		},
		heading_section: {
			uiLabel: "Section",
			Icon: IconFolder,
			FilledIcon: IconFolderFilled,
			colorClass: "bg-accent text-accent-foreground",
		},
		section: {
			uiLabel: "Section",
			Icon: IconFolder,
			FilledIcon: IconFolderFilled,
			colorClass: "bg-accent text-accent-foreground",
		},
		tag: {
			uiLabel: "Tag",
			Icon: IconTag,
			colorClass: "bg-muted text-muted-foreground",
		},
	},
};

export function normalizeTypeLabel(raw: string): string {
	const s = (raw || "").toLowerCase();
	if (!s) {
		return "";
	}
	// Prefer the last segment when colon-delimited (e.g., "document:article" → "article")
	const parts = s.split(":").filter(Boolean);
	const candidate = parts.length > 1 ? (parts.at(-1) ?? "") : (parts[0] ?? "");
	// Map common aliases/synonyms
	if (candidate === "doc") {
		return "document";
	}
	if (
		candidate === "heading_section" ||
		candidate === "section" ||
		candidate === "heading"
	) {
		return "heading_section";
	}
	return candidate;
}

export function getVisualForLabel(
	typeLabel: string,
	cfg: GraphVisualConfig = defaultGraphVisualConfig,
): NodeVisualSpec | null {
	const key = normalizeTypeLabel(typeLabel);
	const mapped = key ? cfg.labelMap[key] : undefined;
	if (mapped) {
		return mapped;
	}
	// Fallbacks
	if (key && cfg.metadataTypes.has(key)) {
		return cfg.labelMap.tag ?? { uiLabel: key, Icon: IconTag };
	}
	return cfg.labelMap.document ?? { uiLabel: key || "Node", Icon: IconFile };
}

export function isMetadataType(
	typeLabel: string | undefined,
	cfg: GraphVisualConfig = defaultGraphVisualConfig,
): boolean {
	if (!typeLabel) {
		return false;
	}
	const key = normalizeTypeLabel(typeLabel);
	return cfg.metadataTypes.has(key);
}
