"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { Button, buttonVariants } from "@recurse/ui/components/button";
import { cn } from "@/lib/cn";

const COPY_SUCCESS_DURATION_MS = 2000;

type CopyButtonProps = {
  text: string;
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  children?: React.ReactNode;
  copied?: boolean;
  onCopy?: () => void;
  label?: string;
  inline?: boolean;
  disabled?: boolean;
  tooltip?: string;
};

export function CopyButton({
  text,
  className,
  size = "sm",
  variant = "outline",
  children,
  copied: externalCopied,
  onCopy,
  label,
  inline = false,
  disabled = false,
  tooltip,
}: CopyButtonProps) {
  const [internalCopied, setInternalCopied] = useState(false);

  // Use external copied state if provided, otherwise use internal state
  const isCopied =
    externalCopied !== undefined ? externalCopied : internalCopied;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      if (externalCopied === undefined) {
        // Only manage internal state if no external state is provided
        setInternalCopied(true);
        setTimeout(() => setInternalCopied(false), COPY_SUCCESS_DURATION_MS);
      }
      onCopy?.();
    } catch (_err) {
      // Silently fail if clipboard access fails
    }
  };

  // Inline mode - render minimal button for input fields without border/background
  if (inline) {
    return (
      <button
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          className
        )}
        disabled={disabled || isCopied}
        onClick={handleCopy}
        type="button"
      >
        {isCopied ? <CheckIcon /> : <CopyIcon />}
        {label && <span>{label}</span>}
        <span className="sr-only">{isCopied ? "Copied!" : "Copy"}</span>
      </button>
    );
  }

  // Regular mode - use Button wrapper
  return (
    <Button
      className={className}
      disabled={disabled || isCopied}
      onClick={handleCopy}
      size={size}
      tooltip={tooltip || (isCopied ? "Copied!" : "Copy")}
      variant={variant}
    >
      {isCopied ? (
        <CheckIcon className="h-4 w-4" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
      {children && <span className="ml-2">{children}</span>}
      {label && !children && <span className="ml-1">{label}</span>}
      <span className="sr-only">{isCopied ? "Copied!" : "Copy"}</span>
    </Button>
  );
}
