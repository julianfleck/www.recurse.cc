"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { AUTH0_CONNECTIONS } from "./auth-store";

export function useSocialLogin() {
  const { loginWithRedirect, isLoading } = useAuth0();

  const go = (connection: string) => {
    // Check for returnTo query param (from external apps like docs/www)
    const urlParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const returnToParam = urlParams?.get("returnTo");

    // Capture where to return after auth
    // Default to current location within dashboard
    let returnToOrigin =
      typeof window !== "undefined" ? window.location.origin : "";
    let returnToPath =
      typeof window !== "undefined"
        ? window.location.pathname + window.location.search
        : "/";

    // If returnTo param is provided, it means user came from another app
    if (returnToParam) {
      try {
        const decoded = decodeURIComponent(returnToParam);
        // If returnTo is a full URL, extract origin and path
        if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
          const url = new URL(decoded);
          returnToOrigin = url.origin;
          returnToPath = url.pathname + url.search;
        } else {
          // Relative path, keep current origin (dashboard)
          returnToPath = decoded;
        }
      } catch {
        // Invalid returnTo, use current location
      }
    }

    // Each app uses its own origin for redirect_uri (must be registered in Auth0)
    // Dashboard callback URL: dashboard.recurse.cc/ (or localhost:3001/ in dev)
    loginWithRedirect({
      authorizationParams: {
        connection,
        redirect_uri:
          typeof window !== "undefined"
            ? `${window.location.origin}/`
            : undefined,
        scope: "openid profile email offline_access",
      },
      appState: {
        returnTo: returnToPath,
        returnToOrigin,
      },
    });
  };

  return {
    isLoading,
    loginWithGoogle: () => go(AUTH0_CONNECTIONS.google),
    loginWithGithub: () => go(AUTH0_CONNECTIONS.github),
  };
}
