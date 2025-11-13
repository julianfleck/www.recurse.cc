"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useAuthStore } from "@/components/auth/auth-store";

function LogoutPageClient() {
	const { logout, isLoading } = useAuth0();
	const clear = useAuthStore((s) => s.clear);
	const router = useRouter();
	const searchParams = useSearchParams();

	useEffect(() => {
		// Check for returnTo query param (from external apps like docs/www)
		const returnTo = searchParams.get("returnTo");

		// Determine where to redirect after logout
		let logoutReturnTo: string;
		if (returnTo) {
			try {
				const decoded = decodeURIComponent(returnTo);
				// If returnTo is a full URL (from another origin), use it
				if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
					logoutReturnTo = decoded;
				} else {
					// Relative path, use current origin
					logoutReturnTo =
						typeof window !== "undefined"
							? `${window.location.origin}${decoded}`
							: decoded;
				}
			} catch {
				// Invalid returnTo, fall back to dashboard root
				logoutReturnTo =
					typeof window !== "undefined" ? window.location.origin : "/";
			}
		} else {
			// No returnTo: redirect to dashboard root
			logoutReturnTo =
				typeof window !== "undefined" ? window.location.origin : "/";
		}

		// Clear client store first
		clear();

		// Then call Auth0 logout with returnTo
		logout({
			logoutParams: {
				returnTo: logoutReturnTo,
			},
		});

		// Fallback navigate in case SDK doesn't redirect
		// This handles cases where Auth0 logout doesn't redirect
		const LOGOUT_REDIRECT_DELAY_MS = 150;
		const t = setTimeout(() => {
			if (
				returnTo &&
				(returnTo.startsWith("http://") || returnTo.startsWith("https://"))
			) {
				// Cross-origin redirect: use window.location
				try {
					window.location.href = decodeURIComponent(returnTo);
				} catch {
					router.replace("/login");
				}
			} else {
				// Same origin: use router
				router.replace("/login");
			}
		}, LOGOUT_REDIRECT_DELAY_MS);

		return () => clearTimeout(t);
	}, [logout, clear, router, searchParams]);

	return isLoading ? null : null;
}

export default function LogoutPage() {
	return (
		<Suspense fallback={null}>
			<LogoutPageClient />
		</Suspense>
	);
}
