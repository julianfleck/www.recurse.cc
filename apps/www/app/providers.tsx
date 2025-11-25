"use client";
import { Auth0Provider } from "@auth0/auth0-react";
import type { ReactNode } from "react";
import { AuthInit } from "@/components/auth/auth-init";
import { Toaster } from "@/components/ui/sonner";

// Suppress Auth0 errors globally that are expected in development:
// - "Missing Refresh Token" - expected when requesting tokens with an audience/scope that wasn't included in initial login
if (typeof window !== "undefined") {
	const originalConsoleError = console.error;
	console.error = (...args) => {
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
}

/**
 * Check if the current origin is considered secure by Auth0
 * Auth0 requires HTTPS or localhost/127.0.0.1 (any port)
 */
function isSecureOrigin(): boolean {
	if (typeof window === "undefined") {
		return true; // Server-side, assume secure
	}

	const { protocol, hostname } = window.location;

	// HTTPS is always secure
	if (protocol === "https:") {
		return true;
	}

	// HTTP is only secure if on localhost or 127.0.0.1
	if (protocol === "http:") {
		return (
			hostname === "localhost" ||
			hostname === "127.0.0.1" ||
			hostname === "[::1]"
		);
	}

	return false;
}

export function Providers({ children }: { children: ReactNode }) {
	const isSecure = isSecureOrigin();

	// In development, allow app to work without Auth0 when on non-secure origin
	// (e.g., accessing via network IP like 10.0.0.x)
	if (!isSecure && process.env.NODE_ENV === "development") {
		return (
			<>
				{children}
				<Toaster />
			</>
		);
	}

	return (
		<Auth0Provider
			authorizationParams={{
				redirect_uri:
					typeof window !== "undefined" ? `${window.location.origin}/` : "",
				...(process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
					? { audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE }
					: {}),
				scope: "openid profile email offline_access",
			}}
			cacheLocation="localstorage"
			clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID ?? ""}
			domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN ?? ""}
			onRedirectCallback={(appState?: {
				returnTo?: string;
				returnToOrigin?: string;
			}) => {
				if (typeof window !== "undefined") {
					const returnToOrigin = appState?.returnToOrigin;
					const returnTo = appState?.returnTo ?? "/";

					// Cross-origin redirect: If user came from a different app (docs/dashboard), redirect back there
					// This works in both dev (different ports) and prod (different domains)
					if (returnToOrigin && returnToOrigin !== window.location.origin) {
						window.location.href = `${returnToOrigin}${returnTo}`;
						return;
					}

					// Same origin: Navigate within www app to preserve the exact path
					window.history.replaceState({}, "", returnTo);
				}
			}}
			useRefreshTokens={true}
		>
			<AuthInit />
			{children}
			<Toaster />
		</Auth0Provider>
	);
}
