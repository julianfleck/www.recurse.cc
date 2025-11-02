"use client";

import { useState } from "react";
import { Button } from "@recurse/ui/components/button";
import { 
  Alert, 
  AlertContent, 
  AlertDescription, 
  AlertIcon, 
  AlertTitle 
} from "@recurse/ui/components/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@recurse/ui/components/dialog";
import { Info, Bell } from "lucide-react";

export function TestAlertButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon"
        className={className}
        onClick={() => setOpen(true)}
        aria-label="Test Alert Component"
      >
        <Bell className="h-[1.2rem] w-[1.2rem]" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ReUI Alert Component Test</DialogTitle>
            <DialogDescription>
              Testing the alert component installed from ReUI
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert 
              variant="info" 
              appearance="light" 
              size="md"
              close
              onClose={() => {}}
            >
              <AlertIcon>
                <Info />
              </AlertIcon>
              <AlertContent>
                <AlertTitle>Installation Successful!</AlertTitle>
                <AlertDescription>
                  This alert component was installed directly into packages/ui using:
                  <code className="block mt-2 p-2 bg-muted rounded text-xs">
                    cd packages/ui && pnpm dlx shadcn@latest add @reui/alert --yes
                  </code>
                </AlertDescription>
              </AlertContent>
            </Alert>

            <Alert 
              variant="success" 
              appearance="solid" 
              size="sm"
            >
              <AlertIcon>
                <Info />
              </AlertIcon>
              <AlertContent>
                <AlertTitle>Success Variant</AlertTitle>
                <AlertDescription>
                  Solid appearance with success variant
                </AlertDescription>
              </AlertContent>
            </Alert>

            <Alert 
              variant="warning" 
              appearance="outline" 
              size="lg"
            >
              <AlertIcon>
                <Info />
              </AlertIcon>
              <AlertContent>
                <AlertTitle>Warning Variant</AlertTitle>
                <AlertDescription>
                  Outline appearance with warning variant
                </AlertDescription>
              </AlertContent>
            </Alert>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
