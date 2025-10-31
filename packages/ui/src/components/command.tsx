'use client';

import React from 'react';
import { cn } from '@recurse/ui/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@recurse/ui/components/dialog';
import { type DialogProps } from '@radix-ui/react-dialog';
import { Command as CommandPrimitive } from 'cmdk';
import { Check, LucideIcon, Search } from 'lucide-react';

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', className)}
      {...props}
    />
  );
}

type CommandDialogProps = DialogProps & { 
  className?: string;
  showCloseButton?: boolean;
};

const CommandDialog = ({ children, className, showCloseButton = true, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>Command Palette</DialogTitle>
        <DialogDescription>Search for a command to run...</DialogDescription>
      </DialogHeader>
      <DialogContent 
        className={cn('overflow-hidden p-0 w-[900px] max-w-[90vw] rounded-lg', className)}
        showCloseButton={showCloseButton}
      >
        <Command className="rounded-lg">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div 
      className="flex h-12 w-full items-center gap-2 border-b px-3" 
      cmdk-input-wrapper="" 
      data-slot="command-input-wrapper"
    >
      <Search className="h-4 w-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        className={cn('flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-hidden text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50', className)}
        data-slot="command-input"
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty 
      data-slot="command-empty" 
      className={cn('py-6 text-center text-sm', className)} 
      {...props} 
    />
  );
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn('overflow-hidden p-1 text-foreground', className)}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn('-mx-1 h-px bg-border', className)}
      {...props}
    />
  );
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden',
        'data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        '[&_svg:not([class*="size-"])]:size-4 [&_svg:not([class*="text-"])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0',
        className,
      )}
      {...props}
    />
  );
}

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      data-slot="command-shortcut"
      className={cn('ms-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  );
};

interface ButtonArrowProps extends React.SVGProps<SVGSVGElement> {
  icon?: LucideIcon; // Allows passing any Lucide icon
}

function CommandCheck({ icon: Icon = Check, className, ...props }: ButtonArrowProps) {
  return (
    <Icon
      data-slot="command-check"
      data-check="true"
      className={cn('size-4 ms-auto text-primary', className)}
      {...props}
    />
  );
}

export {
  Command,
  CommandCheck,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
};
