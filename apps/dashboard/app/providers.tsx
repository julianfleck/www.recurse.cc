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
            ? `${window.location.origin}/dashboard`
            : "",
        ...(process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
          ? { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE }
          : {}),
      }}
      cacheLocation="localstorage"
      clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? ""}
      domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? ""}
      onRedirectCallback={(appState?: { returnTo?: string }) => {
        if (typeof window !== "undefined") {
          const target = appState?.returnTo ?? "/dashboard";
          window.history.replaceState({}, "", target);
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



