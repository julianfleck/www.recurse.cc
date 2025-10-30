"use client";

import {
  Corner as ScrollAreaCorner,
  Root as ScrollAreaRoot,
  Scrollbar as ScrollAreaScrollbar,
  Thumb as ScrollAreaThumb,
  Viewport as ScrollAreaViewport,
} from "@radix-ui/react-scroll-area";
import type {
  ComponentProps,
  ComponentPropsWithoutRef,
  ComponentRef,
} from "react";
import { forwardRef } from "react";

import { cn } from "@recurse/ui/lib";

function ScrollArea({
  className,
  children,
  ...props
}: ComponentProps<typeof ScrollAreaRoot>) {
  return (
    <ScrollAreaRoot
      className={cn("relative", className)}
      data-slot="scroll-area"
      {...props}
    >
      <ScrollAreaViewport
        className={cn(
          "size-full rounded-[inherit] outline-none transition-[color,box-shadow]",
          "focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        )}
        data-slot="scroll-area-viewport"
      >
        {children}
      </ScrollAreaViewport>
      <ScrollBar />
      <ScrollAreaCorner />
    </ScrollAreaRoot>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ComponentProps<typeof ScrollAreaScrollbar>) {
  return (
    <ScrollAreaScrollbar
      className={cn(
        "flex touch-none select-none p-px transition-colors",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      {...props}
    >
      <ScrollAreaThumb
        className={cn("relative flex-1 rounded-full bg-border")}
        data-slot="scroll-area-thumb"
      />
    </ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };

// Back-compat named export used by `components/sidebar.tsx`
const ScrollViewport = forwardRef<
  ComponentRef<typeof ScrollAreaViewport>,
  ComponentPropsWithoutRef<typeof ScrollAreaViewport>
>(({ className, ...props }, ref) => (
  <ScrollAreaViewport
    className={cn("size-full rounded-[inherit]", className)}
    ref={ref}
    {...props}
  />
));

ScrollViewport.displayName = "ScrollViewport";

export { ScrollViewport };
