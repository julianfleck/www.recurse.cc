/**
 * Simplified Graph Renderer
 * Clean click-based architecture with accordion-style interactions
 */

import {
	forceCenter,
	forceCollide,
	forceLink,
	forceManyBody,
	forceSimulation,
	type Simulation,
} from "d3-force";
import type { Selection } from "d3-selection";
import { type ZoomBehavior, zoom, zoomIdentity } from "d3-zoom";
import type { GraphLink, GraphNode } from "../utils/data/data-manager";

export class GraphRenderer {
	private readonly svg: Selection<SVGSVGElement, unknown, null, undefined>;
	private readonly g: Selection<SVGGElement, unknown, null, undefined>;
	private simulation: Simulation<GraphNode, GraphLink> | null = null;
	private readonly zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>;
	private readonly onNodeClick: (nodeId: string) => void;
	private readonly onNodeHover: (nodeId: string | null) => void;
	private readonly baseDistance = 80;
	private currentZoom = 1;
	private pendingFocusNodeId: string | null = null;
	private currentNodes: GraphNode[] = [];
	private currentLinks: GraphLink[] = [];

	constructor(
		svg: Selection<SVGSVGElement, unknown, null, undefined>,
		onNodeClick: (nodeId: string) => void,
		onNodeHover: (nodeId: string | null) => void,
	) {
		this.svg = svg;
		this.onNodeClick = onNodeClick;
		this.onNodeHover = onNodeHover;

		// Setup zoom behavior
		this.zoomBehavior = zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.1, 3])
			.on("zoom", (event) => {
				this.g.attr("transform", event.transform);
				this.updateZoomLevel(event.transform.k);
			});

		this.svg.call(this.zoomBehavior);

		// Create main group
		this.g = this.svg.append("g").attr("class", "graph-content");

		// Setup event listeners
		this.setupEventListeners();
	}

	private setupEventListeners(): void {
		// Clear hover when mouse leaves the SVG
		this.svg.on("mouseleave", () => {
			this.onNodeHover(null);
		});
	}

	/**
	 * Update zoom level and recalculate distances
	 */
	private updateZoomLevel(zoomScale: number): void {
		this.currentZoom = zoomScale;

		// Update link distance based on zoom level
		if (this.simulation) {
			const dynamicDistance = this.calculateDynamicDistance();
			const linkForce = this.simulation.force("link");
			if (
				linkForce &&
				"distance" in linkForce &&
				typeof linkForce.distance === "function"
			) {
				linkForce.distance(dynamicDistance);
				// Restart simulation with low alpha to apply new distances smoothly
				this.simulation.alpha(0.1).restart();
			}
		}
	}

	/**
	 * Calculate dynamic distance based on zoom level
	 */
	private calculateDynamicDistance(): number {
		// As we zoom in (scale > 1), increase distance
		// As we zoom out (scale < 1), decrease distance
		// This creates more space when zoomed in, tighter layout when zoomed out
		const scaleFactor = Math.max(0.5, Math.min(2.5, this.currentZoom));
		return this.baseDistance * scaleFactor;
	}

	/**
	 * Update graph with new data
	 */
	updateGraph(nodes: GraphNode[], links: GraphLink[]): void {
		// Store current data for fitToScreen methods
		this.currentNodes = nodes;
		this.currentLinks = links;

		if (nodes.length === 0) {
			this.clearGraph();
			return;
		}

		// Stop any existing simulation
		if (this.simulation) {
			this.simulation.stop();
		}

		// Create new simulation
		this.simulation = forceSimulation(nodes)
			.force(
				"link",
				forceLink(links)
					.id((d) => (d as GraphNode).id)
					.distance(this.calculateDynamicDistance()),
			)
			.force("charge", forceManyBody().strength(-300))
			.force("collide", forceCollide().radius(30))
			.force("center", forceCenter(0, 0));

		// Render elements
		this.renderLinks(links);
		this.renderNodes(nodes);

		// Start simulation
		this.simulation.on("tick", () => this.tick());
		this.simulation.alpha(0.3).restart();
	}

	private renderLinks(links: GraphLink[]): void {
		const linkSelection = this.g
			.selectAll<SVGLineElement, GraphLink>(".link")
			.data(
				links,
				(d) =>
					`${typeof d.source === "string" ? d.source : d.source.id}-${typeof d.target === "string" ? d.target : d.target.id}`,
			);

		// Remove old links
		linkSelection.exit().remove();

		// Add new links
		const linkEnter = linkSelection
			.enter()
			.append("line")
			.attr("class", "link")
			.attr("stroke", "#e2e8f0")
			.attr("stroke-width", 2);

		linkEnter.merge(linkSelection);
	}

	private renderNodes(nodes: GraphNode[]): void {
		const nodeSelection = this.g
			.selectAll<SVGGElement, GraphNode>(".node")
			.data(nodes, (d) => d.id);

		// Remove old nodes
		nodeSelection.exit().remove();

		// Add new nodes
		const nodeEnter = nodeSelection
			.enter()
			.append("g")
			.attr("class", "node")
			.style("cursor", "pointer");

		// Add circles
		nodeEnter
			.append("circle")
			.attr("r", (d) => this.getNodeRadius(d))
			.attr("fill", (d) => this.getNodeColor(d))
			.attr("stroke", "#ffffff")
			.attr("stroke-width", 2);

		// Add labels
		nodeEnter
			.append("text")
			.attr("text-anchor", "middle")
			.attr("dy", "0.35em")
			.attr("font-size", "12px")
			.attr("font-weight", "600")
			.attr("fill", "#1f2937")
			.text((d) => this.getNodeLabel(d));

		// Merge selections and add event handlers
		const nodeUpdate = nodeEnter.merge(nodeSelection);

		nodeUpdate
			.on("click", (event, d) => {
				event.stopPropagation();
				this.onNodeClick(d.id);
			})
			.on("mouseenter", (_event, d) => {
				this.onNodeHover(d.id);
			})
			.on("mouseleave", () => {
				this.onNodeHover(null);
			});

		// Update node appearance based on state
		nodeUpdate
			.select("circle")
			.attr("r", (d) => this.getNodeRadius(d))
			.attr("fill", (d) => this.getNodeColor(d));

		nodeUpdate.select("text").text((d) => this.getNodeLabel(d));
	}

	private tick(): void {
		// Update link positions
		this.g
			.selectAll<SVGLineElement, GraphLink>(".link")
			.attr("x1", (d) => (typeof d.source === "string" ? 0 : d.source.x || 0))
			.attr("y1", (d) => (typeof d.source === "string" ? 0 : d.source.y || 0))
			.attr("x2", (d) => (typeof d.target === "string" ? 0 : d.target.x || 0))
			.attr("y2", (d) => (typeof d.target === "string" ? 0 : d.target.y || 0));

		// Update node positions
		this.g
			.selectAll<SVGGElement, GraphNode>(".node")
			.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
	}

	private getNodeRadius(node: GraphNode): number {
		if (node.type === "Document" || node.type === "article") {
			return 20;
		}
		return 15;
	}

	private getNodeColor(node: GraphNode): string {
		switch (node.type) {
			case "Document":
			case "article":
				return "#3b82f6"; // Blue for documents
			case "Concept":
				return "#10b981"; // Green for concepts
			case "Claim":
				return "#f59e0b"; // Orange for claims
			case "Question":
				return "#8b5cf6"; // Purple for questions
			default:
				return "#6b7280"; // Gray for others
		}
	}

	private getNodeLabel(node: GraphNode): string {
		const maxLength = 12;
		if (node.title.length <= maxLength) {
			return node.title;
		}
		return `${node.title.slice(0, maxLength)}...`;
	}

	/**
	 * Highlight a specific node
	 */
	highlightNode(nodeId: string | null): void {
		this.g
			.selectAll<SVGCircleElement, GraphNode>(".node circle")
			.attr("stroke", (d) => (d.id === nodeId ? "#fbbf24" : "#ffffff"))
			.attr("stroke-width", (d) => (d.id === nodeId ? 3 : 2));
	}

	/**
	 * Focus on a specific node by centering it and zooming in slightly
	 */
	focusNode(nodeId: string, immediate = false): void {
		// First try to find the node in our stored data
		const nodeData = this.currentNodes.find((n) => n.id === nodeId);

		if (!nodeData) {
			return;
		}

		if (nodeData.x !== undefined && nodeData.y !== undefined && immediate) {
			this.centerAndZoomToNode(nodeData, 1.4); // Zoom in slightly when focusing
		} else if (nodeData.x !== undefined && nodeData.y !== undefined) {
			// For non-immediate focus, wait for simulation to settle
			this.focusNodeAfterSimulation(nodeId);
		} else {
			// Node hasn't been positioned yet by simulation, wait a bit and try again
			setTimeout(() => {
				this.focusNode(nodeId, immediate);
			}, 100);
		}
	}

	/**
	 * Fit specified nodes to screen with optimal zoom and centering
	 * @param nodeIds - Array of node IDs to fit to screen
	 * @param padding - Padding around the bounding box (default: 100)
	 * @param duration - Animation duration in ms (default: 600)
	 * @param maxZoom - Maximum zoom level (default: 3)
	 * @param minZoom - Minimum zoom level (default: 0.1)
	 */
	fitToScreen(
		nodeIds: string[],
		padding = 100,
		duration = 600,
		maxZoom = 3,
		minZoom = 0.1,
	): void {
		if (nodeIds.length === 0) {
			return;
		}

		// Find all specified nodes that have positions
		const targetNodes = this.currentNodes.filter(
			(node: GraphNode) =>
				nodeIds.includes(node.id) &&
				node.x !== undefined &&
				node.y !== undefined,
		);

		if (targetNodes.length === 0) {
			return;
		}

		// Calculate bounding box of target nodes
		const bounds = this.calculateNodesBounds(targetNodes);
		if (!bounds) {
			return;
		}

		// Get SVG dimensions
		const svgRect = (this.svg.node() as SVGSVGElement).getBoundingClientRect();
		const svgWidth = svgRect.width;
		const svgHeight = svgRect.height;

		// Calculate required scale to fit bounds with padding
		const scaleX = svgWidth / (bounds.width + padding * 2);
		const scaleY = svgHeight / (bounds.height + padding * 2);
		let targetScale = Math.min(scaleX, scaleY);

		// Clamp scale to min/max zoom levels
		targetScale = Math.max(minZoom, Math.min(maxZoom, targetScale));

		// Calculate center point of bounds
		const centerX = bounds.x + bounds.width / 2;
		const centerY = bounds.y + bounds.height / 2;

		// Create transform to center and scale
		const newTransform = zoomIdentity
			.translate(svgWidth / 2, svgHeight / 2)
			.scale(targetScale)
			.translate(-centerX, -centerY);

		// Animate to new transform
		(this.svg as any)
			.transition()
			.duration(duration)
			.call(this.zoomBehavior.transform, newTransform);
	}

	/**
	 * Calculate bounding box for a set of nodes
	 */
	private calculateNodesBounds(nodes: GraphNode[]): {
		x: number;
		y: number;
		width: number;
		height: number;
	} | null {
		if (nodes.length === 0) {
			return null;
		}

		const validNodes = nodes.filter(
			(n) => n.x !== undefined && n.y !== undefined,
		);
		if (validNodes.length === 0) {
			return null;
		}

		const xs = validNodes.map((n) => n.x!);
		const ys = validNodes.map((n) => n.y!);

		const minX = Math.min(...xs);
		const maxX = Math.max(...xs);
		const minY = Math.min(...ys);
		const maxY = Math.max(...ys);

		// Add some minimum size for single nodes
		const width = Math.max(maxX - minX, 100);
		const height = Math.max(maxY - minY, 100);

		return {
			x: minX,
			y: minY,
			width,
			height,
		};
	}

	/**
	 * Fit subgraph (parent + children) to screen
	 */
	fitSubgraphToScreen(parentNodeId: string, duration = 600): void {
		// Find parent node
		const parentNode = this.currentNodes.find(
			(n: GraphNode) => n.id === parentNodeId,
		);
		if (!parentNode) {
			return;
		}

	// Find all children of this parent
	const childNodeIds = this.currentNodes
		.filter((node: GraphNode) => {
			return this.currentLinks.some((link: GraphLink) => {
				// Skip links with missing source or target
				if (!(link?.source && link.target)) {
					return false;
				}
				const sourceId =
					typeof link.source === "string" ? link.source : link.source.id;
				const targetId =
					typeof link.target === "string" ? link.target : link.target.id;
				return sourceId === parentNodeId && targetId === node.id;
			});
		})
		.map((n: GraphNode) => n.id);

		// Include parent and all children
		const allNodeIds = [parentNodeId, ...childNodeIds];

		this.fitToScreen(allNodeIds, 120, duration, 2.5, 0.5);
	}

	/**
	 * Fit all visible nodes to screen (useful for initial view)
	 */
	fitAllToScreen(duration = 1000): void {
		const allNodeIds = this.currentNodes.map((n: GraphNode) => n.id);
		if (allNodeIds.length === 0) {
			return;
		}

		this.fitToScreen(allNodeIds, 150, duration, 1.5, 0.1);
	}

	/**
	 * Animate collapse of a subgraph by moving children back to parent
	 */
	animateCollapseSubgraph(
		parentNodeId: string,
		childNodeIds: string[],
		onComplete?: () => void,
	): void {
		if (childNodeIds.length === 0) {
			onComplete?.();
			return;
		}

		const parentNode = this.currentNodes.find((n) => n.id === parentNodeId);
		if (!(parentNode?.x && parentNode.y)) {
			onComplete?.();
			return;
		}

		// Find child nodes in the DOM
		const childNodes = this.g
			.selectAll<SVGGElement, GraphNode>(".node")
			.filter((d) => childNodeIds.includes(d.id));

		const childLinks = this.g
			.selectAll<SVGLineElement, GraphLink>(".link")
			.filter((d) => {
				const sourceId = typeof d.source === "string" ? d.source : d.source.id;
				const targetId = typeof d.target === "string" ? d.target : d.target.id;
				return sourceId === parentNodeId && childNodeIds.includes(targetId);
			});

		// Animate child nodes to parent position
		(childNodes as any)
			.transition()
			.duration(400)
			.attr("transform", `translate(${parentNode.x}, ${parentNode.y})`)
			.style("opacity", 0);

		// Animate child links to collapse
		(childLinks as any)
			.transition()
			.duration(400)
			.attr("x1", parentNode.x)
			.attr("y1", parentNode.y)
			.attr("x2", parentNode.x)
			.attr("y2", parentNode.y)
			.style("opacity", 0)
			.on("end", () => {
				// After animation completes, call the completion callback
				onComplete?.();
			});

		// If no links to animate, still call completion after node animation
		if (childLinks.empty()) {
			setTimeout(() => {
				onComplete?.();
			}, 400);
		}
	}

	/**
	 * Restart simulation to close gaps after node removal
	 */
	restartSimulationToCloseGaps(): void {
		if (!this.simulation) {
			return;
		}

		// Get current center force
		const centerForce = this.simulation.force("center") as
			| ReturnType<typeof import("d3-force").forceCenter>
			| undefined;
		const originalStrength =
			centerForce && typeof centerForce.strength === "function"
				? centerForce.strength()
				: 1;

		// Temporarily increase center force strength to pull nodes together
		if (centerForce && typeof centerForce.strength === "function") {
			centerForce.strength(originalStrength * 3);
		}

		// Restart with high energy
		this.simulation
			.alpha(0.8) // High energy to overcome current equilibrium
			.alphaTarget(0.1) // Keep some energy longer
			.restart();

		// Reset forces after simulation has had time to reorganize
		setTimeout(() => {
			if (
				this.simulation &&
				centerForce &&
				typeof centerForce.strength === "function"
			) {
				centerForce.strength(originalStrength);
				this.simulation.alphaTarget(0);
			}
		}, 800);
	}

	/**
	 * Focus on a node after simulation has settled
	 */
	private focusNodeAfterSimulation(nodeId: string): void {
		// Cancel any existing pending focus
		this.pendingFocusNodeId = nodeId;

		if (!this.simulation) {
			// No simulation running, focus immediately
			this.executePendingFocus();
			return;
		}

		// Wait for simulation to settle (alpha < 0.05 means it's mostly settled)
		const checkSimulation = () => {
			if (!this.simulation || this.simulation.alpha() < 0.05) {
				// Simulation has settled, focus the node
				setTimeout(() => {
					this.executePendingFocus();
				}, 200); // Small delay to ensure positioning is stable
			} else {
				// Still running, check again
				setTimeout(checkSimulation, 100);
			}
		};

		checkSimulation();
	}

	/**
	 * Execute pending focus operation
	 */
	private executePendingFocus(): void {
		if (!this.pendingFocusNodeId) {
			return;
		}

		const nodeId = this.pendingFocusNodeId;
		this.pendingFocusNodeId = null;

		const nodeData = this.g
			.selectAll<SVGGElement, GraphNode>(".node")
			.data()
			.find((d) => d.id === nodeId);

		if (nodeData && nodeData.x !== undefined && nodeData.y !== undefined) {
			this.centerAndZoomToNode(nodeData, 1.4);
		}
	}

	/**
	 * Center and zoom to a specific node with custom zoom level
	 */
	centerAndZoomToNode(node: GraphNode, targetZoom = 1.4): void {
		// Use fitToScreen for single node with custom zoom level
		this.fitToScreen([node.id], 50, 500, targetZoom, targetZoom);
	}

	/**
	 * Clear the graph
	 */
	private clearGraph(): void {
		if (this.simulation) {
			this.simulation.stop();
			this.simulation = null;
		}
		this.g.selectAll("*").remove();
	}

	/**
	 * Clear any pending focus operation
	 */
	clearPendingFocus(): void {
		this.pendingFocusNodeId = null;
	}

	/**
	 * Cleanup
	 */
	destroy(): void {
		this.clearGraph();
		this.clearPendingFocus();
		this.svg.on(".zoom", null);
		this.svg.on("mouseleave", null);
	}
}
