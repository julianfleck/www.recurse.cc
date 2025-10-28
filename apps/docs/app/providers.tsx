"use client";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    // Disable Fumadocs internal search provider; we inject our own search components per layout
    <RootProvider search={{ enabled: false }}>
      {children}
      <Toaster />
    </RootProvider>
  );
}
