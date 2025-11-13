"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DashboardRedirectPage() {
	const pathname = usePathname();

	useEffect(() => {
		// Get the dashboard base URL
		const dashboardBaseUrl = (() => {
			// Check env var first
			if (process.env.NEXT_PUBLIC_DASHBOARD_URL) {
				return process.env.NEXT_PUBLIC_DASHBOARD_URL;
			}

			if (typeof window !== "undefined") {
				const hostname = window.location.hostname;
				const _port = window.location.port;

				// Production: domain-based routing
				if (hostname.includes("www.recurse.cc")) {
					return "https://dashboard.recurse.cc";
				}

				// Development: port-based routing
				if (hostname === "localhost" || hostname === "127.0.0.1") {
					return `http://${hostname}:3001`;
				}

				// Fallback for other environments
				return "https://dashboard.recurse.cc";
			}

			// Server-side fallback
			return process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001";
		})();

		// Preserve the path after /dashboard
		// e.g., /dashboard/settings -> dashboard.recurse.cc/settings
		// Remove the leading /dashboard from pathname
		const remainingPath = pathname.replace(/^\/dashboard/, "") || "/";

		// Construct the full URL
		const redirectUrl = `${dashboardBaseUrl}${remainingPath}${window.location.search}`;

		// Use full page navigation for cross-origin redirect
		window.location.href = redirectUrl;
	}, [pathname]);

	return null;
}
