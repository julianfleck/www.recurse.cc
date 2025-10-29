"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAuthStore } from "./auth-store";

export function ProtectedContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0();
  const router = useRouter();
  const storeToken = useAuthStore((s) => s.accessToken);
  const [isClient, setIsClient] = useState(false);
  
  const isClientAuthenticated = Boolean(storeToken);

  // Ensure we only check auth on the client to avoid hydration mismatches
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only redirect if we're on client and have no token AND Auth0 has finished loading AND Auth0 says not authenticated
    if (isClient && !(isClientAuthenticated || isLoading || isAuthenticated)) {
      console.log("[ProtectedContent] Redirecting to login...", {
        isClient,
        isClientAuthenticated,
        isLoading,
        isAuthenticated
      });
      // Use window.location for immediate redirect to avoid router issues
      window.location.href = "/login";
    }
  }, [isClient, isAuthenticated, isClientAuthenticated, isLoading]);

  // Don't render anything until we're on the client
  if (!isClient) {
    return null;
  }

  // If we have a store token, we're authenticated
  if (isClientAuthenticated) {
    return <>{children}</>;
  }

  // Show loading if Auth0 is loading or we're not on client yet
  if (!isClient || isLoading) {
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
          <span>Loading authentication...</span>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect will happen via useEffect
  // Return null to prevent flashing
  return null;
}

