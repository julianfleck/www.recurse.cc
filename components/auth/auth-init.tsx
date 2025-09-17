"use client";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useAuthStore } from "./auth-store";

export function AuthInit() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    // Prefer SDK-based login only; email login will set the store directly

    if (isAuthenticated && !isLoading) {
      // Get access token silently
      getAccessTokenSilently()
        .then((token) => {
          setAuth(token, "auth0", user);
        })
        .catch(() => {
          // Still authenticated; set user without access token
          setAuth(undefined, "auth0", user);
        });
    } else if (!isLoading) {
      clear();
    }
  }, [isAuthenticated, isLoading, getAccessTokenSilently, user, setAuth, clear]);

  return null;
}
