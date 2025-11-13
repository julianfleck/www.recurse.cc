type Point = { x: number; y: number };

export function bezierPath(a: Point, b: Point): string {
	const dx = (b.x - a.x) * 0.3;
	const dy = (b.y - a.y) * 0.3;
	const c1 = { x: a.x + dx, y: a.y };
	const c2 = { x: b.x - dx, y: b.y };
	return `M ${a.x} ${a.y} C ${c1.x} ${a.y + dy}, ${c2.x} ${b.y - dy}, ${b.x} ${b.y}`;
}

// 90-degree orthogonal (elbow) path suitable for tree diagrams
export function orthogonalPath(a: Point, b: Point): string {
	// Route with a horizontal-then-vertical elbow at mid Y
	const midY = (a.y + b.y) / 2;
	return `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`;
}
