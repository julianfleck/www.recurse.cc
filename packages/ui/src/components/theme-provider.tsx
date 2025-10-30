'use client';

import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
  useTheme,
} from 'next-themes';
import { useEffect } from 'react';
import { useUIStore } from '../lib/ui-store';

/**
 * Internal component to sync next-themes with UI store
 */
function ThemeSync({ children }: { children: React.ReactNode }) {
  const { theme: nextTheme } = useTheme();
  const { theme: storeTheme, setTheme: setStoreTheme } = useUIStore();

  // Sync UI store with next-themes when theme changes
  useEffect(() => {
    if (nextTheme && nextTheme !== storeTheme) {
      setStoreTheme(nextTheme as 'light' | 'dark' | 'system');
    }
  }, [nextTheme, storeTheme, setStoreTheme]);

  return <>{children}</>;
}

/**
 * Shared ThemeProvider wrapper that ensures consistent theme storage
 * across all apps. Uses localStorage key 'theme' (next-themes default).
 * 
 * Also syncs theme changes with the shared UI store for cross-app awareness.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Ensure storage key is consistent (next-themes default is 'theme')
  // This ensures theme persists across all subdomains
  return (
    <NextThemesProvider
      storageKey="theme"
      {...props}
    >
      <ThemeSync>{children}</ThemeSync>
    </NextThemesProvider>
  );
}

