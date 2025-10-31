'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@recurse/ui/components';
import { cn } from '@/lib/utils';

interface ThemeToggleButtonProps {
  className?: string;
}

export function ThemeToggleButton({ className }: ThemeToggleButtonProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const isDarkMode = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <Button
      className={cn('group relative h-8 w-8 overflow-hidden p-0', className)}
      onClick={toggleTheme}
      size="icon"
      tooltip={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      tooltipSide="bottom"
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
