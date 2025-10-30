'use client';

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme,
} from 'next-themes';
import { useEffect, useRef, type ReactNode } from 'react';
import { useUIStore } from '../lib/ui-store';

/**
 * Internal component to sync next-themes with UI store (bidirectional)
 * Uses refs to track last synced values and prevent infinite loops
 */
function ThemeSync({ children }: { children: ReactNode }) {
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme();
  const { theme: storeTheme, setTheme: setStoreTheme } = useUIStore();
  
  // Track last synced values to prevent circular updates
  const lastSyncedNextTheme = useRef<string | undefined>(nextTheme);
  const lastSyncedStoreTheme = useRef<string | undefined>(storeTheme);

  // Sync UI store -> next-themes when store changes (e.g., from another tab)
  useEffect(() => {
    // Only sync if store actually changed from what we last synced
    if (storeTheme && storeTheme !== lastSyncedStoreTheme.current) {
      lastSyncedStoreTheme.current = storeTheme;
      lastSyncedNextTheme.current = storeTheme;
      setNextTheme(storeTheme);
    }
  }, [storeTheme, setNextTheme]); // Don't include nextTheme in deps to avoid loop

  // Sync next-themes -> UI store when next-themes changes (e.g., user toggles theme)
  useEffect(() => {
    // Only sync if next-themes actually changed from what we last synced
    if (nextTheme && nextTheme !== lastSyncedNextTheme.current) {
      lastSyncedNextTheme.current = nextTheme;
      lastSyncedStoreTheme.current = nextTheme;
      setStoreTheme(nextTheme as 'light' | 'dark' | 'system');
    }
  }, [nextTheme, setStoreTheme]); // Don't include storeTheme in deps to avoid loop

  return <>{children}</>;
}

/**
 * Shared ThemeProvider wrapper that ensures consistent theme storage
 * across all apps and subdomains.
 * 
 * next-themes uses localStorage (for same-subdomain tabs) but we sync it
 * with our cookie-based UI store for cross-subdomain synchronization.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      storageKey="theme"
      {...props}
    >
      <ThemeSync>{children}</ThemeSync>
    </NextThemesProvider>
  );
}

