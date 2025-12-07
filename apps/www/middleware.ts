import { NextResponse, type NextRequest } from "next/server";

/**
 * Security headers to prevent ISP SSL interception and improve security.
 * Particularly important for Rogers (Canada) ISP which performs deep packet inspection.
 */
function addSecurityHeaders(response: NextResponse) {
	// HSTS: Force HTTPS for 1 year, include subdomains, preload eligible
	// This prevents downgrade attacks and ISP SSL interception
	response.headers.set(
		"Strict-Transport-Security",
		"max-age=31536000; includeSubDomains; preload",
	);

	// Prevent clickjacking attacks
	response.headers.set("X-Frame-Options", "DENY");

	// Prevent MIME type sniffing
	response.headers.set("X-Content-Type-Options", "nosniff");

	// Control referrer information
	response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

	// Content Security Policy - basic policy to prevent XSS
	// Note: This is a basic CSP. Adjust based on your app's needs.
	response.headers.set(
		"Content-Security-Policy",
		"default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;",
	);

	// Permissions Policy (formerly Feature Policy)
	response.headers.set(
		"Permissions-Policy",
		"geolocation=(), microphone=(), camera=(), payment=()",
	);

	return response;
}

export default function middleware(request: NextRequest) {
	const response = NextResponse.next();
	return addSecurityHeaders(response);
}

export const config = {
	// Apply to all routes
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};

