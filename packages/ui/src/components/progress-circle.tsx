import * as React from "react";

interface ProgressCircleProps
  extends Omit<React.ComponentProps<"svg">, "strokeWidth"> {
  value: number;
  strokeWidth?: number;
  size?: number;
  min?: number;
  max?: number;
}

function clamp(input: number, min: number, max: number): number {
  if (input < min) {
    return min;
  }
  if (input > max) {
    return max;
  }
  return input;
}

export function ProgressCircle({
  value,
  strokeWidth = 2,
  size = 16,
  min = 0,
  max = 100,
  ...restSvgProps
}: ProgressCircleProps) {
  const normalizedValue = clamp(value, min, max);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (normalizedValue / max) * circumference;
  const circleProps = {
    cx: size / 2,
    cy: size / 2,
    r: radius,
    fill: "none",
    strokeWidth,
  };

  return (
    <svg
      aria-valuemax={max}
      aria-valuemin={min}
      aria-valuenow={normalizedValue}
      height={size}
      role="progressbar"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      {...restSvgProps}
    >
      <circle {...circleProps} className="stroke-current/25" />
      <circle
        {...circleProps}
        className="transition-all"
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={circumference - progress}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}
