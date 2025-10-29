"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SearchCommandDialog } from "./dialog";
import { documentationProvider } from "@/lib/search-provider";
import type { SearchProvider } from "../../../docs/components/search/types";

type ToggleProps = Omit<React.ComponentProps<"button">, "variant"> & {
  hideIfDisabled?: boolean;
  size?: "icon-sm" | "sm" | "default" | "lg";
  variant?:
    | "ghost"
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "link";
  provider?: SearchProvider;
  placeholder?: string;
  enableHotkey?: boolean;
};

export function SearchToggle({
  hideIfDisabled,
  size = "icon-sm",
  variant = "ghost",
  provider,
  placeholder,
  enableHotkey = true,
  ...props
}: ToggleProps) {
  const [open, setOpen] = useState(false);

  const resolvedProvider: SearchProvider = useMemo(() => {
    return provider || documentationProvider;
  }, [provider]);

  useEffect(() => {
    if (!enableHotkey) return;
    const onKey = (event: KeyboardEvent) => {
      // Only trigger if "/" is pressed and not typing in an input/textarea
      const target = event.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (event.key === "/" && !isInput && !target.isContentEditable) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [enableHotkey]);

  return (
    <>
      <button
        aria-label="Open Search"
        className={cn(buttonVariants({ size, variant }), props.className)}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search />
      </button>
      <SearchCommandDialog
        debounceMs={300}
        onOpenChange={setOpen}
        open={open}
        placeholder={placeholder || "Search documentation..."}
        provider={resolvedProvider}
      />
    </>
  );
}

