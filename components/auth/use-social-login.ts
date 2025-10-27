"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { AUTH0_CONNECTIONS } from "./auth-store";

export function useSocialLogin() {
  const { loginWithRedirect, isLoading } = useAuth0();

  const go = (connection: string) =>
    loginWithRedirect({
      authorizationParams: {
        connection,
        // Force callback to /dashboard to avoid landing on '/'
        redirect_uri:
          typeof window !== "undefined"
            ? `${window.location.origin}/dashboard`
            : undefined,
      },
      appState: { returnTo: "/dashboard" },
    });

  return {
    isLoading,
    loginWithGoogle: () => go(AUTH0_CONNECTIONS.google),
    loginWithGithub: () => go(AUTH0_CONNECTIONS.github),
  };
}
