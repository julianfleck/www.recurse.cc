/**
 * Validates an API key by making a test request to the provider
 */

export type ValidationStatus = "idle" | "validating" | "valid" | "invalid";

export interface ValidationResult {
	status: ValidationStatus;
	message?: string;
}

/**
 * Validates an API key by making a test request through our API route
 * Uses a dedicated validation endpoint that makes minimal requests
 */
async function validateKeyViaApi(
	provider: string,
	apiKey: string,
): Promise<{ valid: boolean; message?: string }> {
	try {
		const response = await fetch("/api/validate-api-key", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				provider,
				apiKey,
			}),
		});

		const data = await response.json();
		return {
			valid: data.valid === true,
			message: data.message,
		};
	} catch (error) {
		return {
			valid: false,
			message: "Failed to validate API key. Please check your connection.",
		};
	}
}

/**
 * Validates an API key for the given provider
 * @param provider - The provider name (openai, openrouter)
 * @param apiKey - The API key to validate
 * @returns Promise resolving to validation result
 */
export async function validateApiKey(
	provider: string,
	apiKey: string,
): Promise<ValidationResult> {
	if (!apiKey || apiKey.length < 10) {
		return {
			status: "invalid",
			message: "API key is too short",
		};
	}

	// Don't validate keys that are too short (including preview keys from the backend)
	if (apiKey.length < 20) {
		return {
			status: "idle",
			message: "Enter a full API key to validate",
		};
	}

	try {
		if (provider !== "openai" && provider !== "openrouter") {
			return {
				status: "invalid",
				message: "Unknown provider",
			};
		}

		const result = await validateKeyViaApi(provider, apiKey);

		return {
			status: result.valid ? "valid" : "invalid",
			message: result.message || (result.valid
				? "API key is valid"
				: "API key is invalid. Please check your key and try again."),
		};
	} catch (error) {
		return {
			status: "invalid",
			message: "Failed to validate API key. Please check your connection.",
		};
	}
}

