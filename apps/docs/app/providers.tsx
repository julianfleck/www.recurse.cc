"use client";
import { Auth0Provider } from "@auth0/auth0-react";
import { AuthInit } from "@recurse/auth";
import { ThemeProvider } from "@recurse/ui/components";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

// Suppress Auth0 "Missing Refresh Token" errors globally - these are expected when
// requesting tokens with an audience/scope that wasn't included in the initial login
if (typeof window !== "undefined") {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMessage = args.find((arg) => typeof arg === "string") as
      | string
      | undefined;
    if (
      errorMessage &&
      (errorMessage.includes("Missing Refresh Token") ||
        (errorMessage.includes("refresh") &&
          errorMessage.includes("token") &&
          errorMessage.includes("audience")))
    ) {
      return; // Suppress this error silently
    }
    originalConsoleError.apply(console, args);
  };
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      storageKey="theme"
    >
      <Auth0Provider
        authorizationParams={{
          redirect_uri:
            typeof window !== "undefined" ? `${window.location.origin}/` : "",
          ...(process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
            ? { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE }
            : {}),
          scope: "openid profile email offline_access",
        }}
        cacheLocation="localstorage"
        clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? ""}
        domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? ""}
        // Docs app doesn't require auth, so don't redirect to login on errors
        // Just silently handle auth state
        onRedirectCallback={(appState?: {
          returnTo?: string;
          returnToOrigin?: string;
        }) => {
          if (typeof window !== "undefined") {
            const returnToOrigin = appState?.returnToOrigin;
            const returnTo = appState?.returnTo ?? "/";

            // Cross-origin redirect: If user came from a different app, redirect back there
            if (returnToOrigin && returnToOrigin !== window.location.origin) {
              window.location.href = `${returnToOrigin}${returnTo}`;
              return;
            }

            // Same origin: Navigate within docs app
            window.history.replaceState({}, "", returnTo);
          }
        }}
        skipRedirectCallback={false}
        // SkipRedirectCallback: don't auto-redirect to login on auth errors (docs is read-only)
        useRefreshTokens={true}
      >
        <AuthInit skipRedirect={true} />
        {/* Disable Fumadocs internal search provider; we inject our own search components per layout */}
        <RootProvider search={{ enabled: false }}>
          {children}
          <Toaster />
        </RootProvider>
      </Auth0Provider>
    </ThemeProvider>
  );
}
