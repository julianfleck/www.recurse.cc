"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { AUTH0_CONNECTIONS } from "./auth-store";

export function useSocialLogin() {
  const { loginWithRedirect, isLoading } = useAuth0();

  const go = (connection: string) =>
    loginWithRedirect({
      authorizationParams: { connection },
      appState: { returnTo: "/dashboard" },
      // Force callback to /dashboard to avoid landing on '/'
      redirectUri:
        typeof window !== "undefined"
          ? `${window.location.origin}/dashboard`
          : undefined,
    });

  return {
    isLoading,
    loginWithGoogle: () => go(AUTH0_CONNECTIONS.google),
    loginWithGithub: () => go(AUTH0_CONNECTIONS.github),
  };
}
