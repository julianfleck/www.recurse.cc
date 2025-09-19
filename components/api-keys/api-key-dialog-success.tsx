"use client";

import { CheckIcon } from "lucide-react";

import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ApiKeyResponse = {
  id: string;
  name: string;
  key: string;
  display_key: string;
  created_at: string;
  message: string;
};

interface ApiKeyDialogSuccessProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createdKey: ApiKeyResponse;
}

export function ApiKeyDialogSuccess({
  open,
  onOpenChange,
  createdKey,
}: ApiKeyDialogSuccessProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>API Key Created Successfully!</DialogTitle>
          <DialogDescription>{createdKey.message}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* API Key Name */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="space-y-2">
              <Label className="font-medium text-sm">API Key Name</Label>
              <Input
                className="text-sm"
                readOnly
                value={createdKey.name}
              />
            </div>
          </div>

          {/* API Key ID */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-sm">API Key ID</Label>
                <CopyButton text={createdKey.id} />
              </div>
              <Input
                className="font-mono text-sm"
                readOnly
                value={createdKey.id}
              />
            </div>
          </div>

          {/* Secret Key (Masked Display) */}
          <div className="rounded-lg bg-muted/50 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium text-sm">Secret Key</Label>
                <CopyButton text={createdKey.key} />
              </div>
              <Input
                className="font-mono text-sm"
                readOnly
                value={createdKey.display_key}
              />
              <p className="text-xs text-muted-foreground">
                This is a masked version for display. Click copy to get the full key.
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex items-start gap-2">
              <CheckIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-amber-800 dark:text-amber-200">
                This is the only time you'll see this secret key. Store it
                securely and never share it publicly.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <CopyButton
            className="h-11 w-full"
            size="lg"
            text={createdKey.key}
            variant="default"
          >
            Done
          </CopyButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
