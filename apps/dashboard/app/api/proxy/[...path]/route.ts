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

	// Build the target URL - ensure trailing slash to avoid redirects
	let targetPath = pathString;
	if (!targetPath.endsWith("/") && !queryString) {
		targetPath += "/";
	}
	const targetUrl = `${API_BASE_URL}/${targetPath}${queryString}`;
	
	// Debug logging in development
	if (process.env.NODE_ENV === "development") {
		console.log("[Proxy] Request:", {
			method: request.method,
			path: pathString,
			targetUrl,
			apiBaseUrl: API_BASE_URL,
		});
	}

	// Forward headers, excluding host
	const headers = new Headers();
	for (const [key, value] of request.headers.entries()) {
		if (key.toLowerCase() !== "host") {
			headers.set(key, value);
		}
	}

	try {
		// Handle different request methods
		let body: BodyInit | null = null;
		const contentType = request.headers.get("content-type") || "";

		if (request.method !== "GET" && request.method !== "HEAD") {
			if (contentType.includes("multipart/form-data")) {
				// For file uploads, pass the body as-is
				body = await request.blob();
			} else if (contentType.includes("application/json")) {
				body = await request.text();
			} else {
				body = await request.text();
			}
		}

		const response = await fetch(targetUrl, {
			method: request.method,
			headers,
			body,
			// Follow redirects internally
			redirect: "follow",
		});

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

		return new NextResponse(responseBody, {
			status: response.status,
			statusText: response.statusText,
			headers: responseHeaders,
		});
	} catch (error) {
		console.error("Proxy error:", error);
		return NextResponse.json(
			{ error: "Proxy request failed", details: String(error) },
			{ status: 502 },
		);
	}
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

