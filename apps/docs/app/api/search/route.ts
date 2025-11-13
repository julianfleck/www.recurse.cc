import { createFromSource } from "fumadocs-core/search/server";
import { type NextRequest, NextResponse } from "next/server";
import { source } from "@/lib/source";

// Handle both Fumadocs search and document search
export async function GET(request: NextRequest) {
	const url = new URL(request.url);
	const fieldSet = url.searchParams.get("field_set");
	const depth = url.searchParams.get("depth");

	// If this is a document search request, proxy to external API
	if (fieldSet || depth !== null) {
		try {
			const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

			if (!apiBaseUrl) {
				return NextResponse.json(
					{ error: "API base URL not configured" },
					{ status: 500 },
				);
			}

			// Build the external API URL
			const externalUrl = new URL("/search", apiBaseUrl);
			url.searchParams.forEach((value, key) => {
				externalUrl.searchParams.set(key, value);
			});

			// Forward authentication headers from the original request
			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			const authHeader = request.headers.get("authorization");
			if (authHeader) {
				headers.Authorization = authHeader;
			}

			const response = await fetch(externalUrl.toString(), {
				method: "GET",
				headers,
			});

			if (!response.ok) {
				throw new Error(`External API error: ${response.status}`);
			}

			const data = await response.json();
			return NextResponse.json(data);
		} catch {
			return NextResponse.json(
				{ error: "Search service unavailable" },
				{ status: 503 },
			);
		}
	}

	// Default to Fumadocs search for documentation
	const { GET: fumadocsGet } = createFromSource(source, {
		language: "english",
	});

	return fumadocsGet(request);
}
