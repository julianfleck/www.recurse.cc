"use client";
import { Auth0Provider } from "@auth0/auth0-react";
import { RootProvider } from "fumadocs-ui/provider";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { AuthInit } from "@/components/auth/auth-init";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Auth0Provider
      authorizationParams={{
        redirect_uri:
          typeof window !== "undefined"
            ? `${window.location.origin}/`
            : "",
        ...(process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
          ? { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE }
          : {}),
        scope: 'openid profile email offline_access',
      }}
      cacheLocation="localstorage"
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? ""}
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? ""}
      onRedirectCallback={(appState?: { returnTo?: string; returnToOrigin?: string }) => {
        if (typeof window !== "undefined") {
          const returnToOrigin = appState?.returnToOrigin;
          const returnTo = appState?.returnTo ?? "/";
          
          // If user came from a different origin, redirect them back there
          if (returnToOrigin && returnToOrigin !== window.location.origin) {
            window.location.href = `${returnToOrigin}${returnTo}`;
            return;
          }
          
          // Otherwise, navigate within current app
          window.history.replaceState({}, "", returnTo);
        }
      }}
      useRefreshTokens={true}
    >
      <AuthInit />
      {/* Disable Fumadocs internal search provider; we inject our own search components per layout */}
      <RootProvider search={{ enabled: false }}>
        {children}
        <Toaster />
      </RootProvider>
    </Auth0Provider>
  );
}



