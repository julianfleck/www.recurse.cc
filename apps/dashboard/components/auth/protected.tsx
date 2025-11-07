"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAuthStore } from "./auth-store";

export function ProtectedContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth0();
  const _router = useRouter();
  const storeToken = useAuthStore((s) => s.accessToken);
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const isClientAuthenticated = Boolean(storeToken);

  // Track when client-side hydration is complete
  useEffect(() => {
    setIsClient(true);
    // Small delay to ensure auth store has loaded from localStorage
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only redirect if we're on client and have no token AND Auth0 has finished loading AND Auth0 says not authenticated
    if (isClient && !(isClientAuthenticated || isLoading || isAuthenticated)) {
      // Use window.location for immediate redirect to avoid router issues
      window.location.href = "/login";
    }
  }, [isClient, isAuthenticated, isClientAuthenticated, isLoading]);

  // Render children on server side so they're included in HTML
  // On client, we'll check auth and show loading/redirect if needed
  // Keep content visible until we're certain user is not authenticated
  
  // On server, always render children
  if (!isClient) {
    return <>{children}</>;
  }

  // During initial hydration, show content to prevent flash
  // This gives time for auth store to load from localStorage
  if (!isHydrated) {
    return <>{children}</>;
  }

  // If we have a store token, we're authenticated - show content
  if (isClientAuthenticated) {
    return <>{children}</>;
  }

  // If Auth0 says we're authenticated, show content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // If Auth0 is still loading, show content (don't hide it yet)
  // The redirect will happen via useEffect if needed
  if (isLoading) {
    return <>{children}</>;
  }

  // Auth0 has finished loading and user is not authenticated
  // Show loading overlay while redirect happens
  // The useEffect will trigger the redirect
  return (
    <>
      {children}
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div
          aria-live="polite"
          className="flex items-center gap-3 text-fd-muted-foreground text-sm"
        >
          <span
            aria-hidden="true"
            className="inline-block size-4 animate-spin rounded-full border-2 border-fd-muted-foreground border-t-transparent"
          />
          <span>Redirecting to login...</span>
        </div>
      </div>
    </>
  );
}
