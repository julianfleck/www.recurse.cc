export type Point = { x: number; y: number };

export type Bounds = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

export function computeBounds(
  positionsById: Map<string, Point>,
  ids: string[]
): Bounds | null {
  if (ids.length === 0) {
    return null;
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const id of ids) {
    const p = positionsById.get(id);
    if (!p) {
      continue;
    }
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }

  if (
    !(
      Number.isFinite(minX) &&
      Number.isFinite(minY) &&
      Number.isFinite(maxX) &&
      Number.isFinite(maxY)
    )
  ) {
    return null;
  }

  return { minX, minY, maxX, maxY };
}

export function clampScale(k: number, min = 0.1, max = 3): number {
  return Math.max(min, Math.min(max, k));
}

export function computeFitTransform(
  rect: { width: number; height: number },
  bounds: Bounds,
  padding: number,
  scaleLimits?: { min?: number; max?: number }
): { k: number; tx: number; ty: number } {
  const width = Math.max(100, bounds.maxX - bounds.minX);
  const height = Math.max(100, bounds.maxY - bounds.minY);
  const scaleX = rect.width / (width + padding * 2);
  const scaleY = rect.height / (height + padding * 2);
  const unclamped = Math.min(scaleX, scaleY);
  const min = scaleLimits?.min ?? 0.1;
  const max = scaleLimits?.max ?? 3;
  const k = clampScale(unclamped, min, max);

  const cx = bounds.minX + width / 2;
  const cy = bounds.minY + height / 2;
  const tx = rect.width / 2 - cx * k;
  const ty = rect.height / 2 - cy * k;
  return { k, tx, ty };
}

export function computeCenterTransform(
  rect: { width: number; height: number },
  center: { x: number; y: number },
  k: number
): { tx: number; ty: number } {
  const tx = rect.width / 2 - center.x * k;
  const ty = rect.height / 2 - center.y * k;
  return { tx, ty };
}
