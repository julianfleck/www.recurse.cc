"use client";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { setApiAuthGetter } from "@/lib/api";
import { isOnAuthPage } from "@/lib/auth-utils";
import { useAuthStore } from "./auth-store";

const emptyTokenGetter = (): undefined => {
  return;
};

export function AuthInit() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently, error } =
    useAuth0();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clear = useAuthStore((s) => s.clear);
  const accessTokenFromStore = useAuthStore((s) => s.accessToken);
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;
  const scopes = "openid profile email";

  // Don't redirect on auth pages
  const onAuthPage = isOnAuthPage();

  // Suppress Auth0 console errors globally
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Suppress Auth0 token refresh errors
      if (args.some(arg =>
        typeof arg === 'string' &&
        arg.includes('Missing Refresh Token') &&
        arg.includes('audience')
      )) {
        return;
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Set up API auth getter immediately if we have a token in store
  useEffect(() => {
    if (accessTokenFromStore) {
      if (process.env.NODE_ENV === "development") {
        console.log("[AuthInit] Setting up API auth getter with existing store token");
      }
      setApiAuthGetter(() => useAuthStore.getState().accessToken);
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log("[AuthInit] No store token, clearing API auth getter");
      }
      setApiAuthGetter(emptyTokenGetter);
    }
  }, [accessTokenFromStore]);

  useEffect(() => {
    // Prefer SDK-based login when available; otherwise respect a client-side token set via email/password flow
    const isReady = !isLoading;
    
    // Debug logging for auth state
    if (process.env.NODE_ENV === "development") {
      console.log("[AuthInit] Auth state:", {
        isLoading,
        isAuthenticated,
        isReady,
        hasAccessTokenFromStore: !!accessTokenFromStore,
        user: user?.email || user?.name || "no user",
        error: error?.message,
      });
    }
    
    if (isReady && isAuthenticated && !error) {
      if (process.env.NODE_ENV === "development") {
        console.log("[AuthInit] Auth0 authenticated, getting token silently...");
      }
      const options = audience
        ? { authorizationParams: { audience, scope: scopes } }
        : undefined;
      getAccessTokenSilently(options as never)
        .then((token) => {
          if (process.env.NODE_ENV === "development") {
            console.log("[AuthInit] Got token from Auth0, setting in store");
          }
          setAuth(token, "auth0", user);
          // API auth getter will be set up by the separate effect above
        })
        .catch((tokenError) => {
          if (process.env.NODE_ENV === "development") {
            console.error("[AuthInit] Failed to get token from Auth0:", tokenError);
          }
          // Clear auth state and redirect to login on token refresh failures
          clear();
          // API auth getter will be cleared by the separate effect above
          // Redirect to login for authentication errors (but not when already on auth pages)
          if (!onAuthPage) {
            window.location.href = "/login";
          }
        });
    } else if (isReady && (!accessTokenFromStore || error)) {
      if (process.env.NODE_ENV === "development") {
        console.log("[AuthInit] Not authenticated, has Auth0 error, or no store token, clearing auth");
      }
      clear();
      // API auth getter will be cleared by the separate effect above
      // Redirect to login if there's an Auth0 error (but not when already on auth pages)
      if (error && !onAuthPage) {
        window.location.href = "/login";
      }
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
    error,
    onAuthPage,
  ]);

  return null;
}
