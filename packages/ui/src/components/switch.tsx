"use client";

import {
  Root as SwitchRoot,
  Thumb as SwitchThumb,
} from "@radix-ui/react-switch";
import type { ComponentProps } from "react";

import { cn } from "@recurse/ui/lib/index";

type SwitchSize = "sm" | "md";

type SwitchProps = ComponentProps<typeof SwitchRoot> & {
  size?: SwitchSize;
};

const trackSizeClasses: Record<SwitchSize, string> = {
  sm: "h-4 w-7",
  md: "h-[1.15rem] w-8",
};

const thumbSizeClasses: Record<SwitchSize, string> = {
  sm: "size-3",
  md: "size-4",
};

function Switch({ className, size = "md", ...props }: SwitchProps) {
  return (
    <SwitchRoot
      className={cn(
        "peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        trackSizeClasses[size],
        className
      )}
      data-slot="switch"
      {...props}
    >
      <SwitchThumb
        className={cn(
          "pointer-events-none block rounded-full bg-background ring-0 transition-transform",
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          "dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground",
          thumbSizeClasses[size]
        )}
        data-slot="switch-thumb"
      />
    </SwitchRoot>
  );
}

export { Switch };
