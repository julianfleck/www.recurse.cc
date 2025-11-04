'use client';

import {
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from '@recurse/ui/components/command';
import { Spinner } from '@recurse/ui/components/spinner';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DocumentationResults } from './results/documentation';
import { WebsiteSuggestions } from './suggestions';
import type { SearchProvider } from './types';

type SearchCommandDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: SearchProvider;
  placeholder?: string;
  debounceMs?: number;
};

export function SearchCommandDialog({
  open,
  onOpenChange,
  provider,
  placeholder = 'Search documentation...',
  debounceMs = 300,
}: SearchCommandDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<
    Awaited<ReturnType<SearchProvider['search']>>
  >([]);
  const resultsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setResults([]);
      setError(null);
      setHasSearched(false);
    }
  }, [open]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setError(null);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const searchResults = await provider.search(searchTerm);
        setResults(searchResults);
        setHasSearched(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, provider, debounceMs]);

  const emptyMessage = useMemo(() => {
    if (error) {
      return error;
    }
    if (searchTerm && !isLoading && hasSearched && results.length === 0) {
      return 'No results found.';
    }
    return null;
  }, [error, searchTerm, isLoading, hasSearched, results.length]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      // Focus the first focusable item in the results
      const firstItem = resultsRef.current?.querySelector<HTMLElement>(
        '[role="menuitem"], [data-slot="accordion-menu-item"], [data-slot="accordion-menu-sub-trigger"]'
      );
      if (firstItem) {
        firstItem.focus();
      }
    }
  };

  const handleSelectAll = () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  };

  return (
    <CommandDialog
      onOpenChange={onOpenChange}
      open={open}
      showCloseButton={!isLoading}
    >
      <CommandInput
        ref={inputRef}
        onValueChange={setSearchTerm}
        placeholder={placeholder}
        value={searchTerm}
        onKeyDown={handleInputKeyDown}
      />
      <CommandList ref={resultsRef}>
        {!searchTerm && (
          <WebsiteSuggestions onSelect={() => onOpenChange(false)} />
        )}
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <Spinner size={16} strokeWidth={2} />
          </div>
        )}
        {emptyMessage && <CommandEmpty>{emptyMessage}</CommandEmpty>}
        {searchTerm && !isLoading && results.length > 0 && (
          <DocumentationResults
            onSelect={() => onOpenChange(false)}
            onSelectAll={handleSelectAll}
            results={results}
            searchTerm={searchTerm}
          />
        )}
      </CommandList>
    </CommandDialog>
  );
}
