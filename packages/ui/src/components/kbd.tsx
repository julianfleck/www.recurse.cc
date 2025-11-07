import { cn } from '@recurse/ui/lib/index';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        'pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium select-none',
        // Base colors - can be overridden by className
        'bg-muted text-muted-foreground',
        // SVG sizing
        "[&_svg:not([class*='size-'])]:size-3",
        // Tooltip-specific styles - use contrasting colors for visibility
        // Tooltip has bg-popover with text-foreground, so Kbd needs lighter/more visible background
        '[[data-slot=tooltip-content]_&]:bg-muted/60 [[data-slot=tooltip-content]_&]:text-foreground',
        // User-provided className overrides come last and will take precedence
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <kbd data-slot="kbd-group" className={cn('inline-flex items-center gap-1', className)} {...props} />;
}

export { Kbd, KbdGroup };
