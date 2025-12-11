import { type NextRequest, NextResponse } from "next/server";

// Get API base URL and ensure HTTPS in production
let API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// In production, ensure we always use HTTPS
if (process.env.NODE_ENV === "production" && API_BASE_URL.startsWith("http://")) {
	console.warn(
		"[Proxy] API_BASE_URL is HTTP in production, forcing HTTPS. Please update NEXT_PUBLIC_API_BASE_URL to use HTTPS.",
	);
	API_BASE_URL = API_BASE_URL.replace("http://", "https://");
}

/**
 * Proxy handler for API requests.
 * This properly handles redirects and CORS by proxying requests server-side.
 */
async function proxyRequest(
	request: NextRequest,
	params: Promise<{ path: string[] }>,
) {
	const { path } = await params;
	const pathString = path.join("/");
	const url = new URL(request.url);
	const queryString = url.search;

	// Build the target URL
	// Only add trailing slash for GET requests to avoid redirects
	// For POST/PUT/PATCH/DELETE, keep the path as-is because:
	// 1. Redirects may strip Authorization headers (causing 401 errors)
	// 2. These methods often have specific path requirements
	let targetPath = pathString;
	if (request.method === "GET" && !targetPath.endsWith("/") && !queryString) {
		targetPath += "/";
	}
	const targetUrl = `${API_BASE_URL}/${targetPath}${queryString}`;
	
	// Forward headers, excluding host
	const headers = new Headers();
	for (const [key, value] of request.headers.entries()) {
		if (key.toLowerCase() !== "host") {
			headers.set(key, value);
		}
	}

	try {
		// Handle different request methods
		// Store body as Uint8Array so it can be reused for redirects
		let bodyBytes: Uint8Array | null = null;

		if (request.method !== "GET" && request.method !== "HEAD") {
			const buffer = await request.arrayBuffer();
			bodyBytes = new Uint8Array(buffer);
		}

		// Helper to get a fresh copy of the body for each fetch
		const getBody = (): BodyInit | null => {
			if (!bodyBytes) return null;
			// Create a new Uint8Array view for each fetch to avoid "body already used" errors
			return new Uint8Array(bodyBytes);
		};

		// Use manual redirect handling to preserve Authorization header
		// When fetch follows redirects automatically, it may strip auth headers
		const response = await fetch(targetUrl, {
			method: request.method,
			headers,
			body: getBody(),
			redirect: "manual",
		});

		// Handle redirects manually to preserve Authorization header
		if (response.status >= 300 && response.status < 400) {
			const location = response.headers.get("location");
			if (location) {
				console.log("[Proxy] Handling redirect:", {
					from: targetUrl,
					to: location,
					status: response.status,
				});

				// Follow the redirect with the same headers (including Authorization)
				const redirectResponse = await fetch(location, {
					method: request.method,
					headers,
					body: getBody(),
					redirect: "manual",
				});
				
				// If we get another redirect, follow it once more (max 2 redirects)
				if (redirectResponse.status >= 300 && redirectResponse.status < 400) {
					const location2 = redirectResponse.headers.get("location");
					if (location2) {
						const finalResponse = await fetch(location2, {
							method: request.method,
							headers,
							body: getBody(),
							redirect: "follow",
						});
						return createProxyResponse(finalResponse);
					}
				}
				
				return createProxyResponse(redirectResponse);
			}
		}

		return createProxyResponse(response);
	} catch (error) {
		console.error("[Proxy] Error:", error);
		return NextResponse.json(
			{ error: "Proxy request failed", details: String(error) },
			{ status: 502 },
		);
	}
}

/**
 * Helper to create a NextResponse from a fetch Response
 */
async function createProxyResponse(response: Response): Promise<NextResponse> {
	// Get response body
	const responseBody = await response.arrayBuffer();

	// Create response with proper headers
	const responseHeaders = new Headers();
	for (const [key, value] of response.headers.entries()) {
		// Skip headers that shouldn't be forwarded
		if (
			!["transfer-encoding", "content-encoding", "connection"].includes(
				key.toLowerCase(),
			)
		) {
			responseHeaders.set(key, value);
		}
	}

	// Log if we got an auth error
	if (response.status === 401) {
		console.error("[Proxy] Got 401 Unauthorized from API:", {
			url: response.url,
			status: response.status,
		});
	}

	return new NextResponse(responseBody, {
		status: response.status,
		statusText: response.statusText,
		headers: responseHeaders,
	});
}

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	return proxyRequest(request, context.params);
}

export async function POST(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	return proxyRequest(request, context.params);
}

export async function PUT(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	return proxyRequest(request, context.params);
}

export async function DELETE(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	return proxyRequest(request, context.params);
}

export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ path: string[] }> },
) {
	return proxyRequest(request, context.params);
}

