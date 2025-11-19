"use client";

export type HierarchicalNode = {
	id: string;
	title: string;
	type: string;
	summary?: string;
	isDocument?: boolean;
	x?: number;
	y?: number;
};

export type HierarchicalLink = {
	source: string;
	target: string;
};

export type HierarchicalLayoutOptions = {
	width: number;
	height: number;
	nodeWidth: number;
	nodeHeight: number;
	horizontalSpacing: number;
	verticalSpacing: number;
	marginTop: number;
	marginLeft: number;
};

export class HierarchicalLayout {
	private options: HierarchicalLayoutOptions;
	private nodes: HierarchicalNode[] = [];
	private links: HierarchicalLink[] = [];

	constructor(options: Partial<HierarchicalLayoutOptions> = {}) {
		this.options = {
			width: 800,
			height: 600,
			nodeWidth: 190, // Document node width
			nodeHeight: 80, // Document node height
			horizontalSpacing: 80, // Slightly less space between siblings
			verticalSpacing: 240, // Slightly less space between levels (parent/child)
			marginTop: 50,
			marginLeft: 50,
			...options,
		};
	}

	/**
	 * Update layout data and calculate positions
	 */
	updateData(nodes: HierarchicalNode[], links: HierarchicalLink[]): void {
		this.nodes = [...nodes];
		this.links = [...links];
		this.calculatePositions();
	}

	/**
	 * Calculate hierarchical positions
	 * - Parents: Left to Right (LTR)
	 * - Children: Top to Bottom (TTB) below parents
	 * - Children of children: Left to Right (LTR) again
	 */
	private calculatePositions(): void {
		// Build hierarchy with content nodes first and metadata nodes last per parent
		const hierarchy = this.buildHierarchySorted();

		// Calculate positions for each level
		this.positionNodes(hierarchy);
	}

	/**
	 * Build hierarchy structure from nodes and links
	 */
	private buildHierarchySorted(): Map<number, HierarchicalNode[]> {
		const nodeMap = new Map<string, HierarchicalNode>();
		const childrenMap = new Map<string, string[]>();
		const parentMap = new Map<string, string>();

		// Create node map
		for (const node of this.nodes) {
			nodeMap.set(node.id, node);
		}

		// Build parent-child relationships
		for (const link of this.links) {
			const children = childrenMap.get(link.source) || [];
			children.push(link.target);
			childrenMap.set(link.source, children);
			parentMap.set(link.target, link.source);
		}

		// Find root nodes (nodes with no parents)
		const rootNodes = this.nodes.filter((node) => !parentMap.has(node.id));

		// Build levels
		const levels = new Map<number, HierarchicalNode[]>();
		const visited = new Set<string>();

		const assignLevel = (nodeId: string, level: number) => {
			if (visited.has(nodeId)) {
				return;
			}
			visited.add(nodeId);

			const node = nodeMap.get(nodeId);
			if (!node) {
				return;
			}

			const nodesAtLevel = levels.get(level) || [];
			nodesAtLevel.push(node);
			levels.set(level, nodesAtLevel);

			// Process children at next level
			const children = childrenMap.get(nodeId) || [];
			for (const childId of children) {
				assignLevel(childId, level + 1);
			}
		};

		// Start with root nodes at level 0
		for (const rootNode of rootNodes) {
			assignLevel(rootNode.id, 0);
		}

		// Sort each level so content nodes come before metadata nodes
		for (const [lvl, arr] of levels.entries()) {
			arr.sort((a, b) => {
				const aMeta = this.isMetadataLike(a);
				const bMeta = this.isMetadataLike(b);
				if (aMeta !== bMeta) {
					return aMeta ? 1 : -1; // content first
				}
				return (a.title || "").localeCompare(b.title || "");
			});
			levels.set(lvl, arr);
		}
		return levels;
	}

	/**
	 * Position nodes based on hierarchy levels
	 */
	private positionNodes(hierarchy: Map<number, HierarchicalNode[]>): void {
		const { marginLeft, marginTop, verticalSpacing } = this.options;

		for (const [level, nodesAtLevel] of hierarchy.entries()) {
			// For tree-diagram feel, always position children grouped under their parent
			this.positionVerticallyByParent(
				nodesAtLevel,
				level,
				marginTop + level * verticalSpacing,
			);
		}
	}

	/**
	 * Position nodes vertically by parent (TTB)
	 */
	private positionVerticallyByParent(
		nodes: HierarchicalNode[],
		_level: number,
		baseY: number,
	): void {
		const { horizontalSpacing, nodeWidth, nodeHeight, verticalSpacing } =
			this.options;

		// Group nodes by their parent
		const nodesByParent = new Map<string, HierarchicalNode[]>();

		for (const node of nodes) {
			const parentLink = this.links.find((link) => link.target === node.id);
			const parentId = parentLink?.source || "root";

			const siblings = nodesByParent.get(parentId) || [];
			siblings.push(node);
			nodesByParent.set(parentId, siblings);
		}

		// Position each group under its parent
		for (const [parentId, children] of nodesByParent.entries()) {
			let parentX = 0;

			if (parentId !== "root") {
				const parentNode = this.nodes.find((n) => n.id === parentId);
				parentX = parentNode?.x || 0;
			}

			// Split into content row (closer to parent) and metadata row (further away)
			const contentChildren = children.filter((c) => !this.isMetadataLike(c));
			const metaChildren = children.filter((c) => this.isMetadataLike(c));

			// Content: left-to-right centered at baseY (closer to parent)
			if (contentChildren.length > 0) {
				const totalWidth =
					(contentChildren.length - 1) * (nodeWidth + horizontalSpacing);
				const startX = parentX - totalWidth / 2;
				contentChildren.forEach((child, index) => {
					child.x = startX + index * (nodeWidth + horizontalSpacing);
					child.y = baseY;
				});
			}

			// Metadata: left-to-right centered on a lower row beneath content
			if (metaChildren.length > 0) {
				const rowY = baseY + nodeHeight + Math.max(16, verticalSpacing * 0.25);
				const totalWidth =
					(metaChildren.length - 1) * (nodeWidth + horizontalSpacing);
				const startX = parentX - totalWidth / 2;
				metaChildren.forEach((child, index) => {
					child.x = startX + index * (nodeWidth + horizontalSpacing);
					child.y = rowY;
				});
			}
		}
	}

	/**
	 * Get current node positions
	 */
	getNodePositions(): Array<{ id: string; x: number; y: number }> {
		return this.nodes.map((node) => ({
			id: node.id,
			x: node.x || 0,
			y: node.y || 0,
		}));
	}

	private isMetadataLike(n: HierarchicalNode): boolean {
		const t = (n.type || "").toLowerCase();
		return (
			t === "tag" ||
			t === "hyponym" ||
			t === "hypernym" ||
			t === "metadata" ||
			n.id.startsWith("tag:") ||
			n.id.startsWith("hyponym:") ||
			n.id.startsWith("hypernym:") ||
			n.id.startsWith("tag_") ||
			n.id.startsWith("hyponym_") ||
			n.id.startsWith("hypernym_")
		);
	}

	/**
	 * Update layout options
	 */
	updateOptions(newOptions: Partial<HierarchicalLayoutOptions>): void {
		this.options = { ...this.options, ...newOptions };
		if (this.nodes.length > 0) {
			this.calculatePositions();
		}
	}

	/**
	 * Get layout bounds
	 */
	getBounds(): { width: number; height: number } {
		if (this.nodes.length === 0) {
			return { width: this.options.width, height: this.options.height };
		}

		const positions = this.getNodePositions();
		const minX = Math.min(...positions.map((p) => p.x));
		const maxX = Math.max(...positions.map((p) => p.x));
		const minY = Math.min(...positions.map((p) => p.y));
		const maxY = Math.max(...positions.map((p) => p.y));

		return {
			width: maxX - minX + this.options.nodeWidth + this.options.marginLeft * 2,
			height:
				maxY - minY + this.options.nodeHeight + this.options.marginTop * 2,
		};
	}
}
