'use client';

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CornerDownLeft,
  Delete,
  type LucideIcon,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

// Define the size variants
type KeyboardShortcutSize = 'sm' | 'md' | 'lg';

// Text mode or icon mode
type DisplayMode = 'text' | 'icon';

// Define the special key mapping for display
const specialKeyMap: Record<string, { mac: string; win: string }> = {
  cmd: { mac: '⌘', win: 'Ctrl' },
  command: { mac: '⌘', win: 'Ctrl' },
  ctrl: { mac: '⌃', win: 'Ctrl' },
  control: { mac: '⌃', win: 'Ctrl' },
  alt: { mac: '⌥', win: 'Alt' },
  option: { mac: '⌥', win: 'Alt' },
  shift: { mac: '⇧', win: 'Shift' },
  up: { mac: '↑', win: '↑' },
  down: { mac: '↓', win: '↓' },
  left: { mac: '←', win: '←' },
  right: { mac: '→', win: '→' },
  tab: { mac: '⇥', win: 'Tab' },
  return: { mac: '⏎', win: 'Enter' },
  enter: { mac: '⏎', win: 'Enter' },
  space: { mac: '␣', win: 'Space' },
  esc: { mac: '⎋', win: 'Esc' },
  escape: { mac: '⎋', win: 'Esc' },
  backspace: { mac: '⌫', win: 'Backspace' },
  delete: { mac: '⌦', win: 'Delete' },
};

// Determine which keys use Unicode symbols vs icons
const useUnicodeSymbol = [
  'cmd',
  'command',
  'ctrl',
  'control',
  'alt',
  'option',
  'shift',
];

// Icon mapping for keys that still use icons
interface IconMapping {
  icon: LucideIcon;
  ariaLabel: string;
}

const keyIconMap: Record<string, IconMapping> = {
  up: { icon: ArrowUp, ariaLabel: 'Up arrow' },
  down: { icon: ArrowDown, ariaLabel: 'Down arrow' },
  left: { icon: ArrowLeft, ariaLabel: 'Left arrow' },
  right: { icon: ArrowRight, ariaLabel: 'Right arrow' },
  backspace: { icon: Delete, ariaLabel: 'Backspace' },
  delete: { icon: Delete, ariaLabel: 'Delete' },
  enter: { icon: CornerDownLeft, ariaLabel: 'Enter' },
  return: { icon: CornerDownLeft, ariaLabel: 'Return' },
};

// Key data structure for mixed display
type KeyDisplay =
  | { type: 'icon'; icon: LucideIcon; ariaLabel: string; displayText: string }
  | { type: 'symbol'; symbol: string; ariaLabel: string; displayText: string }
  | { type: 'text'; text: string; ariaLabel: string; displayText: string };

// Define the component props
interface KeyboardShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
  shortcut: string; // Format: 'cmd-k', 'shift-ctrl-s', etc.
  size?: KeyboardShortcutSize;
  mode?: DisplayMode;
}

export function KeyboardShortcut({
  shortcut,
  size = 'md',
  mode = 'icon', // Default to icon mode now
  className,
  ...props
}: KeyboardShortcutProps) {
  const [isMac, setIsMac] = useState(true); // Default to Mac

  // Detect OS
  useEffect(() => {
    const isMacOS = navigator.userAgent.toLowerCase().indexOf('mac') !== -1;
    setIsMac(isMacOS);
  }, []);

  // Parse the shortcut string for text display
  const parseShortcutText = (shortcutStr: string) => {
    return shortcutStr
      .toLowerCase()
      .split('-')
      .map((key) => {
        const trimmedKey = key.trim();
        if (trimmedKey in specialKeyMap) {
          return isMac
            ? specialKeyMap[trimmedKey].mac
            : specialKeyMap[trimmedKey].win;
        }
        return trimmedKey.toUpperCase();
      });
  };

  // Parse the shortcut for mixed icon/symbol display
  const parseShortcutMixed = (shortcutStr: string): KeyDisplay[] => {
    return shortcutStr
      .toLowerCase()
      .split('-')
      .map((key) => {
        const trimmedKey = key.trim();
        const displayText =
          trimmedKey in specialKeyMap
            ? isMac
              ? specialKeyMap[trimmedKey].mac
              : specialKeyMap[trimmedKey].win
            : trimmedKey.toUpperCase();

        // Check if we should use Unicode symbol for this key
        if (useUnicodeSymbol.includes(trimmedKey)) {
          return {
            type: 'symbol',
            symbol: displayText,
            ariaLabel:
              trimmedKey === 'cmd' || trimmedKey === 'command'
                ? 'Command'
                : trimmedKey === 'alt' || trimmedKey === 'option'
                  ? 'Option'
                  : trimmedKey.charAt(0).toUpperCase() + trimmedKey.slice(1),
            displayText,
          };
        }

        // Check if the key has an icon mapping
        if (trimmedKey in keyIconMap) {
          return {
            type: 'icon',
            icon: keyIconMap[trimmedKey].icon,
            ariaLabel: keyIconMap[trimmedKey].ariaLabel,
            displayText,
          };
        }

        // Default for keys without specific icon mapping
        return {
          type: 'text',
          text: displayText,
          ariaLabel: displayText,
          displayText,
        };
      });
  };

  const textKeys = parseShortcutText(shortcut);
  const mixedKeys = parseShortcutMixed(shortcut);

  // Style variants based on size - making icons smaller, symbols bigger, and adding more vertical padding
  const sizeClasses = {
    sm: {
      container: 'text-xs px-1 py-0.75 min-w-4 h-5', // Keep padding
      icon: 'h-1.25 w-1.25', // Even smaller icons
      symbol: 'text-base leading-none', // Even bigger symbols
    },
    md: {
      container: 'text-sm px-1.5 py-1 min-w-5 h-6', // Keep padding
      icon: 'h-1.5 w-1.5', // Even smaller icons
      symbol: 'text-lg leading-none', // Even bigger symbols
    },
    lg: {
      container: 'text-base px-2 py-1.5 min-w-6 h-7', // Keep padding
      icon: 'h-2 w-2', // Even smaller icons
      symbol: 'text-xl leading-none', // Even bigger symbols
    },
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center gap-0.5',
        className
      )}
      {...props}
    >
      {mode === 'text'
        ? // Text mode display
          textKeys.map((key, i) => (
            <kbd
              className={cn(
                'inline-flex items-center justify-center rounded border border-muted bg-muted font-medium text-muted-foreground',
                sizeClasses[size].container
              )}
              key={i}
            >
              {key}
            </kbd>
          ))
        : // Mixed icon and symbol display
          mixedKeys.map((keyConfig, i) => {
            // Safely render the appropriate content based on type
            let content;
            if (keyConfig.type === 'icon') {
              const IconComponent = keyConfig.icon;
              content = (
                <IconComponent
                  className={sizeClasses[size].icon}
                  strokeWidth={2}
                />
              );
            } else if (keyConfig.type === 'symbol') {
              content = (
                <span
                  className={cn(
                    sizeClasses[size].symbol,
                    'flex items-center justify-center font-semibold'
                  )}
                >
                  {keyConfig.symbol}
                </span>
              );
            } else {
              content = keyConfig.text;
            }

            return (
              <kbd
                aria-label={keyConfig.ariaLabel}
                className={cn(
                  'inline-flex items-center justify-center rounded border border-muted bg-muted font-medium text-muted-foreground',
                  sizeClasses[size].container
                )}
                key={i}
                title={keyConfig.displayText}
              >
                {content}
              </kbd>
            );
          })}
    </span>
  );
}
