import { NextResponse } from "next/server";
import { ModelProviderFactory } from "@/lib/models/provider-factory";
import type { ProviderName } from "@/lib/models/types";

// Route segment config
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	try {
		console.log("[Models API] Request received");
		const body = await request.json();
		console.log("[Models API] Body parsed:", { provider: body.provider, hasApiKey: !!body.apiKey });
		
		const { provider, apiKey } = body as {
			provider?: ProviderName;
			apiKey?: string;
		};

		if (!provider || !apiKey) {
			return NextResponse.json(
				{ error: "Provider and API key are required" },
				{ status: 400 },
			);
		}

		console.log("[Models API] Creating adapter for provider:", provider);
		// Validate provider
		if (!ModelProviderFactory.getSupportedProviders().includes(provider)) {
			return NextResponse.json(
				{ error: `Unsupported provider: ${provider}` },
				{ status: 400 },
			);
		}

		// Create adapter and fetch models
		const adapter = ModelProviderFactory.create(provider);
		console.log("[Models API] Adapter created, fetching models...");
		// Note: For OpenAI, the apiKey parameter is ignored (we use our own key or static list)
		// For OpenRouter, the apiKey is used to fetch models
		const models = await adapter.fetchModels(apiKey);
		console.log("[Models API] Models fetched successfully, count:", models.length);

		// Return in the format expected by the frontend
		return NextResponse.json({ data: models });
	} catch (error) {
		console.error("[Models API] Error:", error);
		console.error("[Models API] Error stack:", error instanceof Error ? error.stack : "No stack");
		console.error("[Models API] Error name:", error instanceof Error ? error.name : "Unknown");
		const errorMessage =
			error instanceof Error ? error.message : "Failed to fetch models";
		const errorDetails = error instanceof Error ? error.stack : String(error);
		return NextResponse.json(
			{ 
				error: errorMessage,
				details: process.env.NODE_ENV === "development" ? errorDetails : undefined,
			},
			{ status: 500 },
		);
	}
}

