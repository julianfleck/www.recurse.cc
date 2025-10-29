"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { AUTH0_CONNECTIONS } from "./auth-store";

export function useSocialLogin() {
  const { loginWithRedirect, isLoading } = useAuth0();

  const go = (connection: string) => {
    // Check for returnTo query param (from external apps like docs/www)
    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const returnToParam = urlParams?.get("returnTo");
    
    // If returnTo is provided, use it; otherwise use current location
    let returnToOrigin = typeof window !== "undefined" ? window.location.origin : "";
    let returnToPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
    
    if (returnToParam) {
      try {
        const decoded = decodeURIComponent(returnToParam);
        // If returnTo is a full URL, extract origin and path
        if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
          const url = new URL(decoded);
          returnToOrigin = url.origin;
          returnToPath = url.pathname + url.search;
        } else {
          // Relative path, keep current origin
          returnToPath = decoded;
        }
      } catch {
        // Invalid returnTo, use current location
      }
    }
    
    // Use current origin for redirect_uri (must be registered in Auth0)
    // Store where user came from in appState so we can redirect back after auth
    loginWithRedirect({
      authorizationParams: {
        connection,
        redirect_uri:
          typeof window !== "undefined"
            ? `${window.location.origin}/`
            : undefined,
        scope: 'openid profile email offline_access',
      },
      appState: { 
        returnTo: returnToPath,
        returnToOrigin: returnToOrigin,
      },
    });
  };

  return {
    isLoading,
    loginWithGoogle: () => go(AUTH0_CONNECTIONS.google),
    loginWithGithub: () => go(AUTH0_CONNECTIONS.github),
  };
}
