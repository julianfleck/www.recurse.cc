"use client";

import {
  BaseEdge,
  type EdgeProps,
  getSmoothStepPath,
  getStraightPath,
} from "@xyflow/react";

// Step Edge Component
export function StepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge id={id} markerEnd={markerEnd} path={edgePath} style={style} />
  );
}

// Sinusoidal Edge Component
export function SinusoidalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) {
  // Create a sinusoidal path between source and target
  const createSinusoidalPath = () => {
    const distance = Math.sqrt(
      (targetX - sourceX) ** 2 + (targetY - sourceY) ** 2
    );
    const amplitude = Math.min(30, distance * 0.1); // Amplitude based on distance
    const frequency = 3; // Number of waves
    const steps = 50; // Number of points to create smooth curve

    let path = `M ${sourceX} ${sourceY}`;

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = sourceX + (targetX - sourceX) * t;
      const y =
        sourceY +
        (targetY - sourceY) * t +
        amplitude * Math.sin(frequency * Math.PI * t);
      path += ` L ${x} ${y}`;
    }

    return path;
  };

  const edgePath = createSinusoidalPath();

  return (
    <BaseEdge id={id} markerEnd={markerEnd} path={edgePath} style={style} />
  );
}

// Straight Edge Component
export function StraightEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <BaseEdge id={id} markerEnd={markerEnd} path={edgePath} style={style} />
  );
}

// Curved Terminal Edge Component
export function CurvedTerminalEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) {
  const createCurvedTerminalPath = () => {
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Curve length as percentage of total distance (small curves)
    const curveLength = Math.min(30, distance * 0.15);

    // Calculate direction vector
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Start curve point (slightly away from source)
    const startCurveX = sourceX + dirX * curveLength;
    const startCurveY = sourceY + dirY * curveLength;

    // End curve point (slightly before target)
    const endCurveX = targetX - dirX * curveLength;
    const endCurveY = targetY - dirY * curveLength;

    // Control points for smooth curves (perpendicular offset)
    const controlOffset = curveLength * 0.5;
    const perpX = -dirY; // Perpendicular to direction
    const perpY = dirX;

    // Source curve control point
    const sourceControlX = sourceX + perpX * controlOffset;
    const sourceControlY = sourceY + perpY * controlOffset;

    // Target curve control point
    const targetControlX = targetX + perpX * controlOffset;
    const targetControlY = targetY + perpY * controlOffset;

    // Create path: start -> curved section -> straight section -> curved section -> end
    const path = [
      `M ${sourceX} ${sourceY}`, // Move to source
      `Q ${sourceControlX} ${sourceControlY} ${startCurveX} ${startCurveY}`, // Curve from source
      `L ${endCurveX} ${endCurveY}`, // Straight line in middle
      `Q ${targetControlX} ${targetControlY} ${targetX} ${targetY}`, // Curve to target
    ].join(" ");

    return path;
  };

  const edgePath = createCurvedTerminalPath();

  return (
    <BaseEdge id={id} markerEnd={markerEnd} path={edgePath} style={style} />
  );
}

// Custom edge types object
export const customEdgeTypes = {
  step: StepEdge,
  sinusoidal: SinusoidalEdge,
  straight: StraightEdge,
  curvedTerminal: CurvedTerminalEdge,
};
