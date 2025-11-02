"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@recurse/ui/components/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type ApiKeyResponse = {
  id: string;
  name: string;
  key: string;
  display_key: string;
  created_at: string;
  message: string;
};

type ApiKeyDialogSuccessProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createdKey: ApiKeyResponse;
};

export function ApiKeyDialogSuccess({
  open,
  onOpenChange,
  createdKey,
}: ApiKeyDialogSuccessProps) {
  // Format the display key by replacing ellipsis with round dots and padding to match key length
  const formatDisplayKey = (displayKey: string, actualKey: string): string => {
    const dot = "•";
    const ellipsisPattern = /\.\./g;

    if (ellipsisPattern.test(displayKey)) {
      // Replace ellipsis with dots and pad to match the actual key length
      const prefix = displayKey.replace(ellipsisPattern, "");
      const dotsNeeded = actualKey.length - prefix.length;
      return prefix + dot.repeat(Math.max(0, dotsNeeded));
    }

    // If no ellipsis found, return the display key as is
    return displayKey;
  };

  const COPY_SUCCESS_DURATION_MS = 2000;

  const formattedDisplayKey = formatDisplayKey(
    createdKey.display_key,
    createdKey.key
  );

  const [copied, setCopied] = useState(false);

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(createdKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_SUCCESS_DURATION_MS);
    } catch (_err) {
      // Silently fail if clipboard access fails
    }
  };

  const handleCopyAndClose = async () => {
    await handleCopyKey();
    onOpenChange(false);
  };

  return (
    <TooltipProvider>
      <Dialog onOpenChange={onOpenChange} open={open}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>API Key Created Successfully!</DialogTitle>
            {/* <DialogDescription>{createdKey.message}</DialogDescription> */}
          </DialogHeader>

          <div className="space-y-4 pt-2 pb-8">
            {/* Text */}
            <div className="mt-4 max-w-lg rounded-lg bg-muted/50 pb-8">
              Your API key has been created successfully. You can copy the key
              below to use it in your applications. This is the only time you'll
              see this secret key. Store it securely and never share it
              publicly.
            </div>

            {/* API Key Name */}
            <div className="rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label className="font-medium text-[10px] uppercase tracking-wider">
                  API Key Name
                </Label>
                <Input
                  autoFocus={false}
                  className="text-sm hover:cursor-default"
                  readOnly
                  value={createdKey.name}
                />
              </div>
            </div>

            {/* Secret Key (Masked Display) */}
            <div className="rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label className="font-medium text-[10px] uppercase tracking-wider">
                  Secret Key
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="relative w-full"
                      onClick={handleCopyKey}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCopyKey();
                        }
                      }}
                      type="button"
                    >
                      <Input
                        autoFocus={false}
                        className="hover:!bg-accent pr-10 font-mono text-sm hover:cursor-default"
                        readOnly
                        value={formattedDisplayKey}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                        <CopyButton
                          copied={copied}
                          inline
                          text={createdKey.key}
                        />
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>
                      This is a masked version for display. Click to copy the
                      full key.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Security Notice */}
            {/* <div className="mb-4 rounded-lg border border-border bg-muted/50 p-4 text-sm">
              <div className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                <p className="text-foreground">
                  This is the only time you'll see this secret key. Store it
                  securely and never share it publicly.
                </p>
              </div>
            </div> */}
          </div>

          <div className="flex justify-end">
            <Button
              className="h-11 w-full"
              onClick={handleCopyAndClose}
              size="lg"
              variant="default"
            >
              Copy and close this message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
