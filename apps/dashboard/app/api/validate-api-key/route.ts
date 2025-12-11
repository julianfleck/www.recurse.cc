import { NextResponse } from "next/server";

// Route segment config
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const { provider, apiKey } = body as {
			provider?: string;
			apiKey?: string;
		};

		if (!provider || !apiKey) {
			return NextResponse.json(
				{ error: "Provider and API key are required" },
				{ status: 400 },
			);
		}

		let isValid = false;
		let errorMessage = "";

		if (provider === "openai") {
			// Test OpenAI key by making a minimal completion request
			// This is faster than listing models and actually validates the key works
			try {
				const response = await fetch(
					"https://api.openai.com/v1/chat/completions",
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${apiKey}`,
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							model: "gpt-3.5-turbo",
							messages: [{ role: "user", content: "Hi" }],
							max_tokens: 1,
						}),
					},
				);

				if (response.ok) {
					isValid = true;
				} else {
					const errorData = await response.json().catch(() => ({}));
					errorMessage =
						errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
				}
			} catch (error) {
				errorMessage =
					error instanceof Error ? error.message : "Failed to connect to OpenAI API";
			}
		} else if (provider === "openrouter") {
			// Test OpenRouter key by making a minimal completion request
			// OpenRouter API is compatible with OpenAI's API structure
			// Optional headers HTTP-Referer and X-Title are recommended for app attribution
			try {
				const response = await fetch(
					"https://openrouter.ai/api/v1/chat/completions",
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${apiKey}`,
							"Content-Type": "application/json",
							"HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
							"X-Title": "Recurse.cc",
						},
						body: JSON.stringify({
							model: "openai/gpt-3.5-turbo",
							messages: [{ role: "user", content: "Hi" }],
							max_tokens: 1,
							stream: false,
						}),
					},
				);

				if (response.ok) {
					isValid = true;
				} else {
					const errorData = await response.json().catch(() => ({}));
					errorMessage =
						errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
				}
			} catch (error) {
				errorMessage =
					error instanceof Error
						? error.message
						: "Failed to connect to OpenRouter API";
			}
		} else {
			return NextResponse.json(
				{ error: `Unsupported provider: ${provider}` },
				{ status: 400 },
			);
		}

		return NextResponse.json({
			valid: isValid,
			message: isValid
				? "API key is valid"
				: errorMessage || "API key validation failed",
		});
	} catch (error) {
		console.error("[Validate API Key] Error:", error);
		return NextResponse.json(
			{
				valid: false,
				message:
					error instanceof Error
						? error.message
						: "Failed to validate API key",
			},
			{ status: 500 },
		);
	}
}

