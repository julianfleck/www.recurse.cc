import { IconApi } from "@tabler/icons-react";
import type { ComponentProps, HTMLAttributes } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Use consistent colors regardless of theme for SSR compatibility
const getStatusColor = (status: string): string => {
  switch (status) {
    case "online":
      return "#a6c82e";
    case "maintenance":
      return "#8d87cf";
    case "degraded":
      return "#e57637";
    case "offline":
      return "#dc2626";
    default:
      return "#dc2626";
  }
};

export type StatusProps = ComponentProps<typeof Badge> & {
  status: "online" | "offline" | "maintenance" | "degraded";
  icon?: React.ComponentType<{ className?: string }>;
};

export const Status = ({
  className,
  status,
  icon: Icon,
  ...props
}: StatusProps) => {
  const IconComponent = Icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {IconComponent && <IconComponent className="h-5 w-5" />}
      <Badge
        className={cn("flex items-center gap-2", "group", status)}
        variant="secondary"
        {...props}
      >
        <StatusIndicator status={status} />
        <StatusLabel />
      </Badge>
    </div>
  );
};

export type StatusIndicatorProps = HTMLAttributes<HTMLSpanElement> & {
  status?: "online" | "offline" | "maintenance" | "degraded";
};

export const StatusIndicator = ({
  className,
  status = "offline",
  ...props
}: StatusIndicatorProps) => {
  const color = getStatusColor(status);

  return (
    <span className="relative flex h-2 w-2" {...props}>
      <span
        className={cn(
          "absolute inline-flex h-full w-full animate-ping rounded-full opacity-75",
          className
        )}
        style={{ backgroundColor: color }}
      />
      <span
        className={cn("relative inline-flex h-2 w-2 rounded-full", className)}
        style={{ backgroundColor: color }}
      />
    </span>
  );
};

export type StatusLabelProps = HTMLAttributes<HTMLSpanElement>;

export const StatusLabel = ({
  className,
  children,
  ...props
}: StatusLabelProps) => (
  <span className={cn("text-muted-foreground", className)} {...props}>
    {children ?? (
      <>
        <span className="hidden group-[.online]:block">Online</span>
        <span className="hidden group-[.offline]:block">Offline</span>
        <span className="hidden group-[.maintenance]:block">Maintenance</span>
        <span className="hidden group-[.degraded]:block">Degraded</span>
      </>
    )}
  </span>
);
