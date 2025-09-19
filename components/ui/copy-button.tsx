"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

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
};

export function CopyButton({
  text,
  className,
  size = "sm",
  variant = "ghost",
  children,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_err) {}
  };

  return (
    <Button
      className={className}
      disabled={copied}
      onClick={handleCopy}
      size={size}
      variant={variant}
    >
      {copied ? (
        <CheckIcon className="h-4 w-4" />
      ) : (
        <CopyIcon className="h-4 w-4" />
      )}
      {children && <span className="ml-2">{children}</span>}
      <span className="sr-only">{copied ? "Copied!" : "Copy"}</span>
    </Button>
  );
}
