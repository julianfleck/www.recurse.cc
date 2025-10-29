"use client";
import { Auth0Provider } from "@auth0/auth0-react";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
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
      onRedirectCallback={(appState?: { returnTo?: string }) => {
        if (typeof window !== "undefined") {
          const target = appState?.returnTo ?? "/";
          window.history.replaceState({}, "", target);
        }
      }}
      useRefreshTokens={true}
    >
      <AuthInit />
      {children}
      <Toaster />
    </Auth0Provider>
  );
}

