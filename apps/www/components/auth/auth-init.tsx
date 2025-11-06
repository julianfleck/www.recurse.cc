'use client';
import { useAuth0 } from '@auth0/auth0-react';
import { isOnAuthPage, useAuthStore } from '@recurse/auth';
import { useEffect } from 'react';

export function AuthInit() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently, error } =
    useAuth0();
  const setAuth = useAuthStore((s) => s.setAuth);
  const clear = useAuthStore((s) => s.clear);
  const accessTokenFromStore = useAuthStore((s) => s.accessToken);
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;
  const scopes = 'openid profile email offline_access';

  // Don't redirect on auth pages
  const onAuthPage = isOnAuthPage();

  // Suppress Auth0 console errors globally
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Suppress Auth0 "Missing Refresh Token" errors - these are expected when requesting tokens
      // with an audience/scope that wasn't included in the initial login
      const errorMessage = args.find((arg) => typeof arg === 'string') as
        | string
        | undefined;
      if (
        errorMessage &&
        (errorMessage.includes('Missing Refresh Token') ||
          (errorMessage.includes('refresh') &&
            errorMessage.includes('token') &&
            errorMessage.includes('audience')))
      ) {
        return; // Suppress this error silently
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  useEffect(() => {
    // Prefer SDK-based login when available
    const isReady = !isLoading;

    // Debug logging for auth state
    if (process.env.NODE_ENV === 'development') {
    }

    if (isReady && isAuthenticated && !error) {
      if (process.env.NODE_ENV === 'development') {
      }
      const options = audience
        ? { authorizationParams: { audience, scope: scopes } }
        : undefined;
      getAccessTokenSilently(options as never)
        .then((token) => {
          if (process.env.NODE_ENV === 'development') {
          }
          const accessToken =
            typeof token === 'string'
              ? token
              : ((token as unknown as { access_token?: string })
                  ?.access_token ?? '');
          const normalizedUser = user
            ? ({
                sub: user.sub || '',
                name: user.name,
                email: user.email,
                picture: user.picture,
              } as const)
            : undefined;
          setAuth(accessToken, 'auth0', normalizedUser);
        })
        .catch((_tokenError) => {
          if (process.env.NODE_ENV === 'development') {
          }
          // Clear auth state on token refresh failures
          clear();
          // Redirect to login for authentication errors (but not when already on auth pages)
          if (!onAuthPage) {
            window.location.href = '/login';
          }
        });
    } else if (isReady && (!accessTokenFromStore || error)) {
      if (process.env.NODE_ENV === 'development') {
      }
      clear();
      // Redirect to login if there's an Auth0 error (but not when already on auth pages)
      if (error && !onAuthPage) {
        window.location.href = '/login';
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
