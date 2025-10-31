import type { LucideIcon } from 'lucide-react';
import { Button } from '@recurse/ui/components';
import { cn } from '@/lib/utils';

interface IconToggleButtonProps {
  icon1: LucideIcon;
  icon2: LucideIcon;
  isIcon2Showing?: boolean;
  onClick?: () => void;
  className?: string;
  tooltip?: React.ReactNode;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  buttonProps?: React.ComponentProps<typeof Button>;
}

export function IconToggleButton({
  icon1: Icon1,
  icon2: Icon2,
  isIcon2Showing = false,
  onClick,
  className,
  tooltip,
  tooltipSide = "bottom",
  buttonProps,
}: IconToggleButtonProps) {
  return (
    <Button
      className={cn(
        'group/toggle',
        'group relative overflow-hidden',
        className
      )}
      onClick={onClick}
      size="icon"
      tooltip={tooltip}
      variant="outline"
      {...buttonProps}
      tooltipSide={buttonProps?.tooltipSide ?? tooltipSide}
    >
      <div className="relative flex h-5 w-5 items-center justify-center transition-all duration-200 ease-out">
        <Icon1
          className={cn(
            'absolute h-[20px] w-[20px] transition-all delay-50 duration-200 ease-out',
            isIcon2Showing
              ? 'group-hover/toggle:-translate-y-6 translate-y-0 opacity-100 group-hover/toggle:opacity-0'
              : '-translate-y-6 opacity-0 group-hover/toggle:translate-y-0 group-hover/toggle:opacity-100'
          )}
        />
        <Icon2
          className={cn(
            'absolute h-[20px] w-[20px] transition-all delay-50 duration-200 ease-out',
            isIcon2Showing
              ? 'translate-y-6 opacity-0 group-hover/toggle:translate-y-0 group-hover/toggle:opacity-100'
              : 'translate-y-0 opacity-100 group-hover/toggle:translate-y-6 group-hover/toggle:opacity-0'
          )}
        />
      </div>
      {buttonProps?.children}
    </Button>
  );
}
