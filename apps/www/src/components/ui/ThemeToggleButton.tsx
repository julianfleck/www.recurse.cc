'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeSync, useUIStore } from '@/stores/uiStore';

interface ThemeToggleButtonProps {
  className?: string;
}

export function ThemeToggleButton({ className }: ThemeToggleButtonProps) {
  // Sync the store with next-themes
  useThemeSync();

  // Use the store
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const toggleDarkMode = useUIStore((state) => state.toggleDarkMode);

  return (
    <Button
      className={cn('group relative h-8 w-8 overflow-hidden p-0', className)}
      onClick={toggleDarkMode}
      variant="ghost"
    >
      <span className="sr-only">Toggle theme</span>
      <div className="relative flex h-full w-full items-center justify-center">
        <Moon
          className={cn(
            'absolute h-4 w-4 transition-all duration-200',
            isDarkMode
              ? 'group-hover:-translate-y-6 translate-y-0 opacity-100 group-hover:opacity-0'
              : 'translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
          )}
        />
        <Sun
          className={cn(
            'absolute h-4 w-4 transition-all duration-200',
            isDarkMode
              ? 'translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'
              : 'group-hover:-translate-y-6 translate-y-0 opacity-100 group-hover:opacity-0'
          )}
        />
      </div>
    </Button>
  );
}
