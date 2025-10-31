"use client";

import { File } from "lucide-react";
import { useMemo } from "react";
import {
  CommandGroup,
  CommandItem,
} from "@recurse/ui/components/command";
import { useTreeContext } from "fumadocs-ui/contexts/tree";
import type { PageTree } from "fumadocs-core/server";

function getRootPages(root: PageTree.Root) {
  const suggestions: Array<{ title: string; href: string }> = [];
  
  // Get root-level pages (first level children)
  if (root.children) {
    root.children.forEach((child) => {
      if (child.type === "page" && child.url) {
        suggestions.push({
          title: child.name,
          href: child.url,
        });
      }
    });
  }
  
  // Limit to top 5-6 root pages
  return suggestions.slice(0, 6);
}

export function DocumentationSuggestions({
  onSelect,
}: {
  onSelect?: () => void;
}) {
  const { root } = useTreeContext();
  const suggestions = useMemo(() => getRootPages(root), [root]);
  
  if (suggestions.length === 0) {
    return null;
  }
  
  const handleSelect = (href: string) => {
    if (href) {
      window.location.href = href;
      onSelect?.();
    }
  };
  
  return (
    <CommandGroup heading="Suggestions">
      {suggestions.map((suggestion) => (
        <CommandItem
          key={suggestion.href}
          onSelect={() => handleSelect(suggestion.href)}
          value={suggestion.title}
        >
          <File className="h-4 w-4 text-muted-foreground" />
          <span>{suggestion.title}</span>
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

