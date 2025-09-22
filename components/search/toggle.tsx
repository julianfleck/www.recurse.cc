"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { SearchCommandDialog } from "./dialog";
import { documentationProvider, knowledgeBaseProvider } from "./providers";
import type { SearchProvider } from "./types";

type ToggleProps = Omit<React.ComponentProps<"button">, "color"> & {
  hideIfDisabled?: boolean;
  size?: "icon-sm" | "sm" | "default" | "lg";
  color?:
    | "ghost"
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "link";
  provider?: SearchProvider;
  providerKey?: "documentation" | "knowledgeBase";
  placeholder?: string;
  enableHotkey?: boolean;
};

export function SearchToggle({
  hideIfDisabled,
  size = "icon-sm",
  color = "ghost",
  provider,
  providerKey,
  placeholder,
  enableHotkey = false,
  ...props
}: ToggleProps) {
  const [open, setOpen] = useState(false);

  const resolvedProvider: SearchProvider = useMemo(() => {
    return provider
      ? provider
      : providerKey === "documentation"
        ? documentationProvider
        : knowledgeBaseProvider;
  }, [provider, providerKey]);

  useEffect(() => {
    if (!enableHotkey) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
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
        className={cn(buttonVariants({ size, color }), props.className)}
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search />
      </button>
      <SearchCommandDialog
        debounceMs={300}
        onOpenChange={setOpen}
        open={open}
        placeholder={placeholder}
        provider={resolvedProvider}
        searchType={providerKey === "documentation" ? "documentation" : "knowledgeBase"}
      />
    </>
  );
}

export function LargeSearchToggle({
  customText,
  provider,
  providerKey,
  placeholder,
  enableHotkey = true,
  ...props
}: React.ComponentProps<"button"> & {
  customText?: string;
  provider?: SearchProvider;
  providerKey?: "documentation" | "knowledgeBase";
  placeholder?: string;
  enableHotkey?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const resolvedProvider: SearchProvider = useMemo(() => {
    return provider
      ? provider
      : providerKey === "documentation"
        ? documentationProvider
        : knowledgeBaseProvider;
  }, [provider, providerKey]);

  useEffect(() => {
    if (!enableHotkey) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
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
        data-search-full=""
        type="button"
        {...props}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "inline-flex items-center gap-2 bg-fd-secondary/50 px-3 py-2 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground",
          props.className
        )}
        onClick={() => setOpen(true)}
      >
        <Search />
        {customText || "Search"}
        <div className="ms-auto inline-flex gap-0.5">
          <kbd className="rounded-md border bg-fd-background px-1.5">⌘</kbd>
          <kbd className="rounded-md border bg-fd-background px-1.5">K</kbd>
        </div>
      </button>
      <SearchCommandDialog
        debounceMs={300}
        onOpenChange={setOpen}
        open={open}
        placeholder={placeholder}
        provider={resolvedProvider}
        searchType={providerKey === "documentation" ? "documentation" : "knowledgeBase"}
      />
    </>
  );
}
