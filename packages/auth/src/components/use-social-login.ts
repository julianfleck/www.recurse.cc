"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { AUTH0_CONNECTIONS } from "../lib/auth-store";

export function useSocialLogin() {
  const { loginWithRedirect, isLoading } = useAuth0();

  const go = (connection: string) => {
    // Check for returnTo query param (when redirected from another app like docs/www)
    const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const returnToParam = urlParams?.get("returnTo");
    
    // Capture where to return after auth
    // Default to current location within this app
    let returnToOrigin = typeof window !== "undefined" ? window.location.origin : "";
    let returnToPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/";
    
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
          // Relative path, keep current origin (this app)
          returnToPath = decoded;
        }
      } catch {
        // Invalid returnTo, use current location
      }
    }
    
    // Each app uses its own origin for redirect_uri (must be registered in Auth0)
    // This ensures the callback goes to the correct app's registered callback URL
    // Production examples:
    //   - Dashboard: dashboard.recurse.cc/
    //   - WWW: www.recurse.cc/
    //   - Docs: docs.recurse.cc/ (if docs had auth)
    // Dev examples:
    //   - Dashboard: localhost:3001/
    //   - WWW: localhost:3002/
    //   - Docs: localhost:3000/
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
