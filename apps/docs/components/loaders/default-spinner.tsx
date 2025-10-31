import { Spinner } from "@recurse/ui/components/spinner";
import { cn } from "@/lib/utils";

type DefaultSpinnerProps = {
  text?: string;
  className?: string;
  size?: number;
};

export function DefaultSpinner({ 
  text, 
  className,
  size = 32 
}: DefaultSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Spinner size={size} />
      {text && (
        <p className="mt-3 text-center text-muted-foreground text-sm">{text}</p>
      )}
    </div>
  );
}
