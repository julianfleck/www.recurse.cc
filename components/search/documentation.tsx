"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/cn";

type DocumentationSearchProps = {
  hideIfDisabled?: boolean;
  size?: "icon-sm" | "sm" | "default" | "lg";
  color?:
    | "ghost"
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "link";
};

export function DocumentationSearchToggle({
  hideIfDisabled,
  size = "icon-sm",
  color = "ghost",
  ...props
}: DocumentationSearchProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        aria-label="Open Documentation Search"
        className={cn(
          buttonVariants({
            size,
            color,
          }),
          props.className
        )}
        data-search=""
        onClick={() => {
          setOpen(true);
        }}
        type="button"
      >
        <Search />
      </button>
      <DocumentationSearchDialog onOpenChange={setOpen} open={open} />
    </>
  );
}

export function LargeDocumentationSearchToggle({
  hideIfDisabled,
  customText,
  ...props
}: React.ComponentProps<"button"> & {
  hideIfDisabled?: boolean;
  customText?: string;
}) {
  const [open, setOpen] = useState(false);

  // Global keyboard shortcut for documentation search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <button
        data-search-full=""
        type="button"
        {...props}
        className={cn(
          buttonVariants({
            variant: "outline",
            size: "sm",
          }),
          "inline-flex items-center gap-2 bg-fd-secondary/50 px-3 py-2 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground",
          props.className
        )}
        onClick={() => {
          setOpen(true);
        }}
      >
        <Search />
        {customText || "Search Documentation"}
        <div className="ms-auto inline-flex gap-0.5">
          <kbd className="rounded-md border bg-fd-background px-1.5">⌘</kbd>
          <kbd className="rounded-md border bg-fd-background px-1.5">K</kbd>
        </div>
      </button>
      <DocumentationSearchDialog onOpenChange={setOpen} open={open} />
    </>
  );
}

// Import Fumadocs search dialog dynamically to avoid SSR issues
function DocumentationSearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [SearchDialog, setSearchDialog] = useState<React.ComponentType<{
    open: boolean;
    onOpenChange: (open: boolean) => void;
    api: string;
  }> | null>(null);

  useEffect(() => {
    // Import Fumadocs DefaultSearchDialog
    import("fumadocs-ui/components/dialog/search-default").then((module) => {
      setSearchDialog(() => module.default);
    });
  }, []);

  if (!SearchDialog) {
    return null;
  }

  return (
    <SearchDialog api="/api/search" onOpenChange={onOpenChange} open={open} />
  );
}


