"use client";

import {
  Arrow as TooltipPrimitiveArrow,
  Content as TooltipPrimitiveContent,
  Portal as TooltipPrimitivePortal,
  Provider as TooltipPrimitiveProvider,
  Root as TooltipPrimitiveRoot,
  Trigger as TooltipPrimitiveTrigger,
} from "@radix-ui/react-tooltip";
import type { ComponentProps } from "react";

import { cn } from "@recurse/ui/lib";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: ComponentProps<typeof TooltipPrimitiveProvider>) {
  return (
    <TooltipPrimitiveProvider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({ ...props }: ComponentProps<typeof TooltipPrimitiveRoot>) {
  return (
    <TooltipProvider>
      <TooltipPrimitiveRoot data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: ComponentProps<typeof TooltipPrimitiveTrigger>) {
  return <TooltipPrimitiveTrigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: ComponentProps<typeof TooltipPrimitiveContent>) {
  return (
    <TooltipPrimitivePortal>
      <TooltipPrimitiveContent
        className={cn(
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 fade-in-0 zoom-in-95 pointer-events-none z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in text-balance rounded-md border border-border bg-popover px-3 py-1.5 text-popover-foreground text-xs data-[state=closed]:animate-out",
          className
        )}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        {...props}
      >
        {children}
        <TooltipPrimitiveArrow className="z-50 size-2.5 translate-y-[calc(-50%)] rotate-45 rounded-[2px] border-border border-r border-b bg-popover fill-popover" />
      </TooltipPrimitiveContent>
    </TooltipPrimitivePortal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
