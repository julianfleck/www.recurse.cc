"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuthStore } from "./auth-store";

export function ProtectedContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const storeUser = useAuthStore((s) => s.user);
  const storeToken = useAuthStore((s) => s.accessToken);
  const isClientAuthenticated = Boolean(storeToken || storeUser);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const unauthenticated = !(isAuthenticated || isClientAuthenticated);
    if (unauthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isClientAuthenticated, isLoading, router]);

  const shouldBlock = isLoading || !(isAuthenticated || isClientAuthenticated);
  if (shouldBlock) {
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
