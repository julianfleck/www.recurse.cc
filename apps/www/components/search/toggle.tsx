'use client';

import { Button } from '@recurse/ui/components';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { documentationProvider } from '@/lib/search-provider';
import { SearchCommandDialog } from './dialog';
import type { SearchProvider } from './types';

type ToggleProps = Omit<React.ComponentProps<'button'>, 'variant'> & {
  hideIfDisabled?: boolean;
  size?: 'icon' | 'icon-sm' | 'sm' | 'default' | 'lg';
  variant?:
    | 'ghost'
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline'
    | 'link';
  provider?: SearchProvider;
  placeholder?: string;
  enableHotkey?: boolean;
};

export function SearchToggle({
  hideIfDisabled,
  size = 'icon-sm',
  variant = 'outline',
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
    if (!enableHotkey) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      // Only trigger if "/" is pressed and not typing in an input/textarea
      const target = event.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      if (event.key === '/' && !isInput && !target.isContentEditable) {
        event.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [enableHotkey]);

  return (
    <>
      <Button
        aria-label="Open Search"
        className={props.className}
        onClick={() => setOpen(true)}
        size={size}
        tooltip="Search documentation (Press /)"
        variant={variant}
      >
        <Search />
      </Button>
      <SearchCommandDialog
        debounceMs={300}
        onOpenChange={setOpen}
        open={open}
        placeholder={placeholder || 'Search documentation...'}
        provider={resolvedProvider}
      />
    </>
  );
}
