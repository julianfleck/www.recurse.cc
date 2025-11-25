'use client';

import * as React from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
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
   * Controls how strong the glow color appears (0-1).
   * Higher values = more visible glow on hover.
   */
  glowIntensity?: number;
  /**
   * Controls the blur amount for the glow in pixels.
   */
  glowBlur?: number;
}

export const GlowCard = React.forwardRef<GlowCardElement, GlowCardProps>(
  (
    {
      asChild = false,
      enableGlow = true,
      glowRadius = '420px',
      glowIntensity = 0.08,
      glowBlur = 100,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'div';
    const internalRef = React.useRef<GlowCardElement>(null);
    const spotlightRef = React.useRef<HTMLDivElement>(null);
    const mergedRef = mergeRefs(ref, internalRef);

    React.useEffect(() => {
      if (!enableGlow || !internalRef.current) return;

      const card = internalRef.current;
      const spotlight = spotlightRef.current;

      const handleMouseMove = (event: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const relativeX = ((event.clientX - rect.left) / rect.width) * 100;
        const relativeY = ((event.clientY - rect.top) / rect.height) * 100;

        card.style.setProperty('--glow-x', `${relativeX}%`);
        card.style.setProperty('--glow-y', `${relativeY}%`);
        card.style.setProperty('--glow-intensity', '1');

        // Also update the spotlight element directly for better performance
        if (spotlight) {
          spotlight.style.setProperty('--glow-x', `${relativeX}%`);
          spotlight.style.setProperty('--glow-y', `${relativeY}%`);
        }
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

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);
    const intensity = clamp(glowIntensity, 0, 1);

    const glowStyle = enableGlow
      ? ({
          '--glow-x': '50%',
          '--glow-y': '50%',
          '--glow-intensity': '0',
          '--glow-radius': glowRadius,
          '--glow-color-strength': intensity.toString(),
          '--glow-blur': `${glowBlur}px`,
        } as React.CSSProperties)
      : undefined;

    const baseCardClass =
      'block h-full select-none rounded-xl border border-border bg-card/60 p-4 no-underline outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-chart-1/30';

    const classNames = cn(
      enableGlow && 'glow-card',
      !asChild && baseCardClass,
      className,
    );

    // For asChild mode, we need to inject the spotlight as a sibling
    // For regular mode, we render it as a child
    const spotlightElement = enableGlow ? (
      <div
        ref={spotlightRef}
        className="glow-card-spotlight"
        style={
          {
            '--glow-x': '50%',
            '--glow-y': '50%',
            '--glow-color-strength': intensity.toString(),
            '--glow-blur': `${glowBlur}px`,
            '--glow-radius': glowRadius,
          } as React.CSSProperties
        }
        aria-hidden="true"
      />
    ) : null;

    if (asChild) {
      return (
        <Comp
          ref={mergedRef}
          className={classNames}
          style={enableGlow ? { ...glowStyle, ...style } : style}
          {...props}
        >
          {spotlightElement}
          <Slottable>{children}</Slottable>
        </Comp>
      );
    }

    return (
      <Comp
        ref={mergedRef}
        className={classNames}
        style={enableGlow ? { ...glowStyle, ...style } : style}
        {...props}
      >
        {spotlightElement}
        {children}
      </Comp>
    );
  },
);

GlowCard.displayName = 'GlowCard';


