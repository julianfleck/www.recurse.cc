import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IconToggleButtonProps {
  icon1: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  icon2: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isIcon2Showing?: boolean;
  onClick?: () => void;
  className?: string;
  buttonProps?: React.ComponentProps<typeof Button>;
  tooltip?: string;
  icon1ClassName?: string;
  icon2ClassName?: string;
}

export function IconToggleButton({
  icon1: Icon1,
  icon2: Icon2,
  isIcon2Showing = false,
  onClick,
  className,
  buttonProps,
  tooltip,
  icon1ClassName,
  icon2ClassName,
}: IconToggleButtonProps) {
  const content = (
    <Button
      className={cn(
        "group/toggle",
        "group relative overflow-hidden",
        className
      )}
      onClick={onClick}
      size="icon"
      variant="outline"
      {...buttonProps}
    >
      <div className="relative flex h-5 w-5 items-center justify-center transition-all duration-600 ease-out">
        <Icon1
          className={cn(
            "absolute h-[20px] w-[20px] transition-all delay-50 duration-200 ease-out",
            icon1ClassName,
            isIcon2Showing
              ? "group-hover/toggle:-translate-y-6 translate-y-0 opacity-100 group-hover/toggle:opacity-0"
              : "-translate-y-6 opacity-0 group-hover/toggle:translate-y-0 group-hover/toggle:opacity-100"
          )}
          strokeWidth={1.5}
        />
        <Icon2
          className={cn(
            "absolute h-[20px] w-[20px] transition-all delay-50 duration-200 ease-out",
            icon2ClassName,
            isIcon2Showing
              ? "translate-y-6 opacity-0 group-hover/toggle:translate-y-0 group-hover/toggle:opacity-100"
              : "translate-y-0 opacity-100 group-hover/toggle:translate-y-6 group-hover/toggle:opacity-0"
          )}
          strokeWidth={1.5}
        />
      </div>
      {buttonProps?.children}
    </Button>
  );

  if (!tooltip) {
    return content;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent sideOffset={6}>{tooltip}</TooltipContent>
    </Tooltip>
  );
}
