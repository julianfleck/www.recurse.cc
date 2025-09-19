"use client";
import { useI18n } from "fumadocs-ui/contexts/i18n";
import { useSearchContext } from "fumadocs-ui/contexts/search";
import { Search } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { type ButtonProps, buttonVariants } from "./ui/button";

interface SearchToggleProps
  extends Omit<ComponentProps<"button">, "color">,
    ButtonProps {
  hideIfDisabled?: boolean;
}

export function SearchToggle({
  hideIfDisabled,
  size = "icon-sm",
  color = "ghost",
  ...props
}: SearchToggleProps) {
  const { setOpenSearch, enabled } = useSearchContext();
  if (hideIfDisabled && !enabled) {
    return null;
  }

  return (
    <button
      aria-label="Open Search"
      className={cn(
        buttonVariants({
          size,
          color,
        }),
        props.className
      )}
      data-search=""
      onClick={() => {
        setOpenSearch(true);
      }}
      type="button"
    >
      <Search />
    </button>
  );
}

export function LargeSearchToggle({
  hideIfDisabled,
  customText,
  ...props
}: ComponentProps<"button"> & {
  hideIfDisabled?: boolean;
  customText?: string;
}) {
  const { enabled, hotKey, setOpenSearch } = useSearchContext();
  const { text } = useI18n();
  if (hideIfDisabled && !enabled) {
    return null;
  }

  return (
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
        setOpenSearch(true);
      }}
    >
      <Search />
      {customText || text.search}
      <div className="ms-auto inline-flex gap-0.5">
        {hotKey.map((k) => (
          <kbd
            className="rounded-md border bg-fd-background px-1.5"
            key={k.display}
          >
            {k.display}
          </kbd>
        ))}
      </div>
    </button>
  );
}
