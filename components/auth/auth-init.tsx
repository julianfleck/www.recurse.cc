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

  // Set up API auth getter immediately if we have a token in store
  useEffect(() => {
    if (accessTokenFromStore) {
      console.log("[AuthInit] Setting up API auth getter with existing store token");
      setApiAuthGetter(() => useAuthStore.getState().accessToken);
    } else {
      console.log("[AuthInit] No store token, clearing API auth getter");
      setApiAuthGetter(emptyTokenGetter);
    }
  }, [accessTokenFromStore]);

  useEffect(() => {
    // Prefer SDK-based login when available; otherwise respect a client-side token set via email/password flow
    const isReady = !isLoading;
    
    console.log("[AuthInit] Auth state:", {
      isLoading,
      isAuthenticated,
      isReady,
      hasAccessTokenFromStore: !!accessTokenFromStore,
      user: user?.email || user?.name || "no user",
    });
    
    if (isReady && isAuthenticated) {
      console.log("[AuthInit] Auth0 authenticated, getting token silently...");
      const options = audience
        ? { authorizationParams: { audience, scope: scopes } }
        : undefined;
      getAccessTokenSilently(options as never)
        .then((token) => {
          console.log("[AuthInit] Got token from Auth0, setting in store");
          setAuth(token, "auth0", user);
          // API auth getter will be set up by the separate effect above
        })
        .catch((error) => {
          console.error("[AuthInit] Failed to get token from Auth0:", error);
          setAuth(undefined, "auth0", user);
          // API auth getter will be cleared by the separate effect above
        });
    } else if (isReady && !accessTokenFromStore) {
      console.log("[AuthInit] Not authenticated and no store token, clearing auth");
      clear();
      // API auth getter will be cleared by the separate effect above
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
