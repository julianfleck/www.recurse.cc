'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@recurse/ui/lib/utils';
import { mergeRefs } from '@recurse/ui/lib/merge-refs';

type GlowCardElement = HTMLDivElement | HTMLAnchorElement | HTMLElement;

export interface GlowCardProps extends React.HTMLAttributes<GlowCardElement> {
  /**
   * Render the glow card without adding an extra DOM node.
   * Useful when composing with Next.js Link or other components.
   */
  asChild?: boolean;
  /**
   * Disable the glow/mouse tracking effect.
   */
  enableGlow?: boolean;
  /**
   * Override the CSS radius for the glow gradient.
   */
  glowRadius?: string;
}

export const GlowCard = React.forwardRef<GlowCardElement, GlowCardProps>(
  ({ asChild = false, enableGlow = false, glowRadius = '500px', className, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div';
    const internalRef = React.useRef<GlowCardElement>(null);
    const mergedRef = mergeRefs(ref, internalRef);

    React.useEffect(() => {
      if (!enableGlow || !internalRef.current) return;

      const card = internalRef.current;

      const handleMouseMove = (event: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const relativeX = ((event.clientX - rect.left) / rect.width) * 100;
        const relativeY = ((event.clientY - rect.top) / rect.height) * 100;

        card.style.setProperty('--glow-x', `${relativeX}%`);
        card.style.setProperty('--glow-y', `${relativeY}%`);
        card.style.setProperty('--glow-intensity', '1');
      };

      const handleMouseLeave = () => {
        card.style.setProperty('--glow-intensity', '0');
      };

      card.addEventListener('mousemove', handleMouseMove as EventListener);
      card.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        card.removeEventListener('mousemove', handleMouseMove as EventListener);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    }, [enableGlow]);

    const glowStyle = enableGlow
      ? ({
          '--glow-x': '20%',
          '--glow-y': '20%',
          '--glow-intensity': '0',
          '--glow-radius': glowRadius,
        } as React.CSSProperties)
      : undefined;

    return (
      <Comp
        ref={mergedRef}
        className={cn(
          'nav-card-glow block h-full select-none rounded-xl border border-border bg-card/60 p-4 no-underline outline-none transition-all',
          'hover:border-chart-1 focus-visible:ring-4 focus-visible:ring-chart-1/20',
          'dark:hover:border-chart-1/40 dark:focus-visible:ring-chart-1/40',
          enableGlow && 'nav-card-glow',
          className,
        )}
        style={enableGlow ? { ...glowStyle, ...style } : style}
        {...props}
      />
    );
  },
);

GlowCard.displayName = 'GlowCard';


