import { cn } from '@/lib/utils';

interface CodeProps {
  children: string;
  className?: string;
}

export function Code({ children, className }: CodeProps) {
  return (
    <pre
      className={cn(
        'overflow-x-auto rounded-lg bg-muted p-4 text-sm',
        'border border-border',
        className
      )}
    >
      <code className="text-muted-foreground">{children}</code>
    </pre>
  );
}
