"use client";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { setApiAuthGetter } from "@/lib/api";
import { useAuthStore } from "./auth-store";

const emptyTokenGetter = (): undefined => {
  return;
};

export function AuthInit() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } =
    useAuth0();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clear = useAuthStore((s) => s.clear);
  const accessTokenFromStore = useAuthStore((s) => s.accessToken);
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;
  const scopes = "openid profile email";


  useEffect(() => {
    // Prefer SDK-based login when available; otherwise respect a client-side token set via email/password flow
    const isReady = !isLoading;
    if (isReady && isAuthenticated) {
      const options = audience
        ? { authorizationParams: { audience, scope: scopes } }
        : undefined;
      getAccessTokenSilently(options as never)
        .then((token) => {
          setAuth(token, "auth0", user);
          // Set up API auth getter to use the token from auth store
          setApiAuthGetter(() => useAuthStore.getState().accessToken);
        })
        .catch(() => {
          setAuth(undefined, "auth0", user);
          // Clear API auth getter when auth fails
          setApiAuthGetter(emptyTokenGetter);
        });
    } else if (isReady && !accessTokenFromStore) {
      clear();
      // Clear API auth getter when not authenticated
      setApiAuthGetter(emptyTokenGetter);
    } else if (isReady && accessTokenFromStore) {
      // If we have a token from store (email/password flow), set up API auth getter
      setApiAuthGetter(() => useAuthStore.getState().accessToken);
    }
  }, [
    isAuthenticated,
    isLoading,
    getAccessTokenSilently,
    user,
    setAuth,
    clear,
    accessTokenFromStore,
    audience,
  ]);

  return null;
}
