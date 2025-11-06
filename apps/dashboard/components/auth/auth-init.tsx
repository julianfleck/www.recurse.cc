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
  const scopes = "openid profile email offline_access";

  // Don't redirect on auth pages
  const onAuthPage = isOnAuthPage();

  // Suppress Auth0 console errors globally
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Suppress Auth0 "Missing Refresh Token" errors - these are expected when requesting tokens
      // with an audience/scope that wasn't included in the initial login
      const errorMessage = args.find((arg) => typeof arg === "string") as
        | string
        | undefined;
      if (
        errorMessage &&
        (errorMessage.includes("Missing Refresh Token") ||
          (errorMessage.includes("refresh") &&
            errorMessage.includes("token") &&
            errorMessage.includes("audience")))
      ) {
        return; // Suppress this error silently
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
      }
      setApiAuthGetter(() => useAuthStore.getState().accessToken);
    } else {
      if (process.env.NODE_ENV === "development") {
      }
      setApiAuthGetter(emptyTokenGetter);
    }
  }, [accessTokenFromStore]);

  useEffect(() => {
    // Prefer SDK-based login when available; otherwise respect a client-side token set via email/password flow
    const isReady = !isLoading;

    // Debug logging for auth state
    if (process.env.NODE_ENV === "development") {
    }

    if (isReady && isAuthenticated && !error) {
      if (process.env.NODE_ENV === "development") {
      }
      const options = audience
        ? { authorizationParams: { audience, scope: scopes } }
        : undefined;
      getAccessTokenSilently(options as never)
        .then((token) => {
          if (process.env.NODE_ENV === "development") {
          }
          const accessToken =
            typeof token === "string"
              ? token
              : ((token as unknown as { access_token?: string })
                  ?.access_token ?? "");
          const normalizedUser = user
            ? ({
                sub: user.sub || "",
                name: user.name,
                email: user.email,
                picture: user.picture,
              } as const)
            : undefined;
          setAuth(accessToken, "auth0", normalizedUser);
          // API auth getter will be set up by the separate effect above
        })
        .catch((tokenError) => {
          // Check if this is a "Missing Refresh Token" error - these are expected and should be handled gracefully
          const errorMessage =
            tokenError instanceof Error
              ? tokenError.message
              : String(tokenError);
          const isMissingRefreshToken =
            errorMessage.includes("Missing Refresh Token") ||
            (errorMessage.includes("refresh") &&
              errorMessage.includes("token") &&
              errorMessage.includes("audience"));

          if (isMissingRefreshToken) {
            // Missing refresh token is expected when requesting tokens with audience/scope not in initial login
            // Auth0 will handle this by triggering a new login flow if needed
            // Don't clear auth or redirect - let Auth0 handle it or use existing token if available
            if (process.env.NODE_ENV === "development") {
            }
            // If we have a token in store, keep using it - don't clear auth
            if (!(accessTokenFromStore || onAuthPage)) {
              // Only redirect if we truly have no token at all
              window.location.href = "/login";
            }
            return;
          }

          if (process.env.NODE_ENV === "development") {
          }
          // Clear auth state and redirect to login on other token refresh failures
          clear();
          // API auth getter will be cleared by the separate effect above
          // Redirect to login for authentication errors (but not when already on auth pages)
          if (!onAuthPage) {
            window.location.href = "/login";
          }
        });
    } else if (isReady && (!accessTokenFromStore || error)) {
      if (process.env.NODE_ENV === "development") {
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
