import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Get the docs URL dynamically, works in both dev and prod.
 */
export function getDocsUrl(): string {
	if (process.env.NEXT_PUBLIC_DOCS_URL) {
		return process.env.NEXT_PUBLIC_DOCS_URL;
	}

	if (typeof window !== "undefined") {
		const origin = window.location.origin;
		const hostname = window.location.hostname;
		const port = window.location.port;

		// Production: domain-based routing
		if (hostname.includes("www.recurse.cc")) {
			return origin.replace("www.recurse.cc", "docs.recurse.cc");
		}

		if (hostname.includes("dashboard.recurse.cc")) {
			return origin.replace("dashboard.recurse.cc", "docs.recurse.cc");
		}

		// Development: port-based routing
		// docs runs on 3000, dashboard on 3001, www on 3002
		if (hostname === "localhost" || hostname === "127.0.0.1") {
			if (port === "3001" || port === "3002" || !port) {
				// If on dashboard or www (or default), docs is on 3000
				return `http://${hostname}:3000`;
			}
			// If already on docs port, return same
			return origin;
		}

		// Other dev environments - assume same origin
		return origin;
	}

	// Server-side fallback
	return process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3000";
}
