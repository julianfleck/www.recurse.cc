"use client";
import { useAuth0 } from "@auth0/auth0-react";
import {
	isMissingRefreshTokenError,
	registerTokenRefresher,
} from "@recurse/auth";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { setApiAuthGetter } from "@/lib/api";
import { isOnAuthPage } from "@/lib/auth-utils";
import { useAuthStore } from "./auth-store";

const emptyTokenGetter = (): undefined => {
	return;
};

export function AuthInit() {
	const { user, isAuthenticated, isLoading, getAccessTokenSilently, logout, error } =
		useAuth0();
	const setAuth = useAuthStore((s) => s.setAuth);
	const clear = useAuthStore((s) => s.clear);
	const accessTokenFromStore = useAuthStore((s) => s.accessToken);
	const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE;
	const scopes = "openid profile email offline_access";

	// Track if we've already shown the session expired toast to prevent duplicates
	const hasShownSessionExpiredToast = useRef(false);

	// Don't redirect on auth pages
	const onAuthPage = isOnAuthPage();

	/**
	 * Handle session expiration by clearing auth state and logging out.
	 * Shows a toast notification and redirects to login.
	 */
	const handleSessionExpired = useCallback(
		(showToast = true) => {
			if (hasShownSessionExpiredToast.current) {
				return; // Prevent duplicate handling
			}
			hasShownSessionExpiredToast.current = true;

			// Clear local auth state
			clear();
			setApiAuthGetter(emptyTokenGetter);

			// Show user-friendly toast
			if (showToast && !onAuthPage) {
				toast.error("Session expired", {
					description: "Please log in again to continue.",
					duration: 5000,
				});
			}

			// Log out via Auth0 and redirect to login
			if (!onAuthPage) {
				logout({
					logoutParams: {
						returnTo: `${window.location.origin}/login`,
					},
				});
			}
		},
		[clear, logout, onAuthPage],
	);

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

	// Wire the dashboard's auth store into the shared API service
	// so API calls always read the latest token from Zustand.
	useEffect(() => {
		if (accessTokenFromStore) {
			setApiAuthGetter(() => useAuthStore.getState().accessToken);
		} else {
			setApiAuthGetter(emptyTokenGetter);
		}
	}, [accessTokenFromStore]);

	// Register a shared token refresher so the API layer can refresh tokens
	// when it detects that a JWT has expired.
	useEffect(() => {
		const options = audience
			? { authorizationParams: { audience, scope: scopes } }
			: undefined;

		registerTokenRefresher(async () => {
			try {
				const token = await getAccessTokenSilently(options as never);
				const accessToken =
					typeof token === "string"
						? token
						: ((token as unknown as { access_token?: string })?.access_token ??
								"");
				const normalizedUser = user
					? ({
							sub: user.sub || "",
							name: user.name,
							email: user.email,
							picture: user.picture,
						} as const)
					: undefined;
				setAuth(accessToken, "auth0", normalizedUser);
				return accessToken;
			} catch (refreshError) {
				// If we get a Missing Refresh Token error, the user needs to log in again
				if (isMissingRefreshTokenError(refreshError)) {
					handleSessionExpired();
				}
				throw refreshError;
			}
		});
	}, [audience, scopes, getAccessTokenSilently, setAuth, user, handleSessionExpired]);

	useEffect(() => {
		// Prefer SDK-based login when available; otherwise respect a client-side token set via email/password flow
		const isReady = !isLoading;

		if (isReady && isAuthenticated && !error) {
			const options = audience
				? { authorizationParams: { audience, scope: scopes } }
				: undefined;
			getAccessTokenSilently(options as never)
				.then((token) => {
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
					// Check if this is a "Missing Refresh Token" error
					if (isMissingRefreshTokenError(tokenError)) {
						// Session expired - log user out and redirect to login
						handleSessionExpired();
						return;
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
		scopes,
		handleSessionExpired,
	]);

	return null;
}
