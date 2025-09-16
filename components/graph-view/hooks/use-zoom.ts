import type { Selection } from 'd3-selection';
import { zoomIdentity } from 'd3-zoom';
import type React from 'react';

export type ZoomPoint = { x: number; y: number };

export type ZoomDeps = {
  svgRef: React.MutableRefObject<SVGSVGElement | null>;
  edgesGroupRef: React.MutableRefObject<SVGGElement | null>;
  htmlLayerRef: React.MutableRefObject<HTMLDivElement | null>;
  transformRef: React.MutableRefObject<{ x: number; y: number; k: number }>;
  selectionRef: React.MutableRefObject<Selection<
    Element,
    unknown,
    null,
    undefined
  > | null>;
  zoomBehaviorRef: React.MutableRefObject<unknown>;
  positionsRef: React.MutableRefObject<Map<string, ZoomPoint>>;
};

export function applyTransform(deps: ZoomDeps): void {
  const { transformRef, edgesGroupRef, htmlLayerRef } = deps;
  const { x, y, k } = transformRef.current;
  if (edgesGroupRef.current) {
    edgesGroupRef.current.setAttribute(
      'transform',
      `translate(${x}, ${y}) scale(${k})`
    );
  }
  if (htmlLayerRef.current) {
    htmlLayerRef.current.style.transform = `translate(${x}px, ${y}px) scale(${k})`;
  }
}

export function resetZoomToFit(
  deps: ZoomDeps,
  ids: string[],
  padding = 120
): void {
  const { svgRef, positionsRef, transformRef, selectionRef, zoomBehaviorRef } =
    deps;
  if (!svgRef.current) {
    return;
  }
  if (ids.length === 0) {
    return;
  }
  const rect = svgRef.current.getBoundingClientRect();
  const nodes = ids
    .map((id) => positionsRef.current.get(id))
    .filter((p): p is ZoomPoint => p != null);
  if (nodes.length === 0) {
    return;
  }
  const minX = Math.min(...nodes.map((p) => p.x));
  const maxX = Math.max(...nodes.map((p) => p.x));
  const minY = Math.min(...nodes.map((p) => p.y));
  const maxY = Math.max(...nodes.map((p) => p.y));
  const width = Math.max(100, maxX - minX);
  const height = Math.max(100, maxY - minY);
  const scaleX = rect.width / (width + padding * 2);
  const scaleY = rect.height / (height + padding * 2);
  const k = Math.max(0.1, Math.min(3, Math.min(scaleX, scaleY)));
  const tx = rect.width / 2 - (minX + width / 2) * k;
  const ty = rect.height / 2 - (minY + height / 2) * k;
  transformRef.current = { x: tx, y: ty, k };
  applyTransform(deps);
  if (selectionRef.current && zoomBehaviorRef.current) {
    const t = zoomIdentity.translate(tx, ty).scale(k);
    const sel = selectionRef.current as Selection<
      Element,
      unknown,
      null,
      undefined
    >;
    const zoomBehavior = zoomBehaviorRef.current as unknown as {
      transform: (
        s: Selection<Element, unknown, null, undefined>,
        tr: typeof t
      ) => void;
    };
    sel.transition().duration(400).call(zoomBehavior.transform, t);
  }
}

export function fitAll(deps: ZoomDeps, padding = 160): void {
  const { positionsRef } = deps;
  const ids = Array.from(positionsRef.current.keys());
  resetZoomToFit(deps, ids, padding);
}

export function scheduleFitToView(
  _deps: ZoomDeps,
  _ids: string[],
  _padding: number,
  _reason?: string
): void {
  // no-op scheduling placeholder, matches current behavior
}

export function recenterToCurrentZoom(_deps: ZoomDeps): void {
  // no-op recenter in this phase; keep transform as-is
}

export function zoomIn(deps: ZoomDeps): void {
  const { selectionRef, zoomBehaviorRef, svgRef } = deps;
  if (!(selectionRef.current && zoomBehaviorRef.current)) {
    return;
  }
  const rect = svgRef.current?.getBoundingClientRect();
  const cx = rect ? rect.width / 2 : 0;
  const cy = rect ? rect.height / 2 : 0;
  const sel = selectionRef.current as Selection<
    Element,
    unknown,
    null,
    undefined
  >;
  const zoomBehavior = zoomBehaviorRef.current as unknown as {
    scaleBy: (
      s: Selection<Element, unknown, null, undefined>,
      k: number,
      p: [number, number]
    ) => void;
  };
  sel
    .transition()
    .duration(300)
    .call(zoomBehavior.scaleBy, 1.2, [cx, cy] as [number, number]);
}

export function zoomOut(deps: ZoomDeps): void {
  const { selectionRef, zoomBehaviorRef, svgRef } = deps;
  if (!(selectionRef.current && zoomBehaviorRef.current)) {
    return;
  }
  const rect = svgRef.current?.getBoundingClientRect();
  const cx = rect ? rect.width / 2 : 0;
  const cy = rect ? rect.height / 2 : 0;
  const sel = selectionRef.current as Selection<
    Element,
    unknown,
    null,
    undefined
  >;
  const zoomBehavior = zoomBehaviorRef.current as unknown as {
    scaleBy: (
      s: Selection<Element, unknown, null, undefined>,
      k: number,
      p: [number, number]
    ) => void;
  };
  sel
    .transition()
    .duration(300)
    .call(zoomBehavior.scaleBy, 1 / 1.2, [cx, cy] as [number, number]);
}
