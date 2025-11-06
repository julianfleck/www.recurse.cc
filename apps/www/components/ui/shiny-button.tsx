import { Slot } from '@radix-ui/react-slot';
import { buttonVariants } from '@recurse/ui/components';
import type { VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ShinyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  shinySpeed?: number;
  disabled?: boolean;
  asChild?: boolean;
}

const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  (
    {
      className,
      variant,
      size,
      children,
      shinySpeed = 5,
      disabled = false,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const animationDuration = `${shinySpeed}s`;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant: variant || 'default', size, className }),
          'group relative overflow-hidden border-0',
          disabled ? 'pointer-events-none opacity-70' : ''
        )}
        disabled={disabled && !asChild}
        ref={ref}
        {...props}
      >
        <span className="relative z-10">{children}</span>
        <span
          className={`absolute inset-0 rounded-md border-2 border-primary ${disabled ? '' : 'animate-shine'}`}
          style={{
            backgroundSize: '200% 100%',
            animationDuration,
            borderImage:
              'linear-gradient(120deg, hsl(var(--primary)), transparent, hsl(var(--primary))) 1',
            borderImageSlice: '1',
          }}
        />
      </Comp>
    );
  }
);

ShinyButton.displayName = 'ShinyButton';

export { ShinyButton };
