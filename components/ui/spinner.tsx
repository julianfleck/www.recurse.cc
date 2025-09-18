import { cn } from "@/lib/utils";

interface SpinnerProps extends React.ComponentProps<"svg"> {
  size?: number;
  strokeWidth?: number;
}

export function Spinner({
  size = 24,
  strokeWidth = 2,
  className,
  ...props
}: SpinnerProps) {
  return (
    <svg
      className={cn(
        "animate-spin text-muted-foreground",
        className
      )}
      fill="none"
      height={size}
      role="img"
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      <title>Loading</title>
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      <path
        className="opacity-75"
        d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"
      />
    </svg>
  );
}
