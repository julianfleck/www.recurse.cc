"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";

export function ProtectedContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
        <div
          aria-live="polite"
          className="flex items-center gap-3 text-fd-muted-foreground text-sm"
        >
          <span
            aria-hidden="true"
            className="inline-block size-4 animate-spin rounded-full border-2 border-fd-muted-foreground border-t-transparent"
          />
          <span>Redirecting to login…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
