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
  /**
   * Controls how strong the background (outer) glow appears (0-1).
   */
  backgroundGlowIntensity?: number;
  /**
   * Controls hover strength for the background glow (0-1).
   */
  backgroundGlowHoverIntensity?: number;
  /**
   * Controls how strong the border glow appears (0-1).
   */
  borderGlowIntensity?: number;
  /**
   * Controls hover strength for the border glow (0-1).
   */
  borderGlowHoverIntensity?: number;
}

export const GlowCard = React.forwardRef<GlowCardElement, GlowCardProps>(
  (
    {
      asChild = false,
      enableGlow = true,
      glowRadius = '500px',
      backgroundGlowIntensity = 0.02,
      backgroundGlowHoverIntensity,
      borderGlowIntensity = 0.38,
      borderGlowHoverIntensity,
      className,
      style,
      ...props
    },
    ref,
  ) => {
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

    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
    const borderRest = clamp(borderGlowIntensity, 0, 1);
    const borderHover = clamp(borderGlowHoverIntensity ?? borderRest * 1.6, 0, 1);
    const backgroundRest = clamp(backgroundGlowIntensity, 0, 0.4);
    const backgroundHover = clamp(backgroundGlowHoverIntensity ?? backgroundRest * 2, 0, 0.4);

    const glowStyle = enableGlow
      ? ({
          '--glow-x': '50%',
          '--glow-y': '50%',
          '--glow-intensity': '0',
          '--glow-radius': glowRadius,
          '--glow-border-opacity-rest': borderRest.toString(),
          '--glow-border-opacity-hover': borderHover.toString(),
          '--glow-background-opacity-rest': backgroundRest.toString(),
          '--glow-background-opacity-hover': backgroundHover.toString(),
        } as React.CSSProperties)
      : undefined;

    const baseCardClass =
      'block h-full select-none rounded-xl border border-border bg-card/60 p-4 no-underline outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-chart-1/30';

    const classNames = cn(
      enableGlow && 'glow-card',
      !asChild && baseCardClass,
      className,
    );

    return (
      <Comp
        ref={mergedRef}
        className={classNames}
        style={enableGlow ? { ...glowStyle, ...style } : style}
        {...props}
      />
    );
  },
);

GlowCard.displayName = 'GlowCard';


