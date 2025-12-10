import type { Model, ModelProviderAdapter } from "../types";

/**
 * OpenAI API adapter for fetching models
 * 
 * Note: OpenAI's /v1/models endpoint requires authentication with a valid API key.
 * Since we can't use the user's API key just to list models (it would require
 * authentication), we provide a static list of common OpenAI chat models.
 * The user's API key will be validated when they actually use the selected model.
 */
export class OpenAIAdapter implements ModelProviderAdapter {
	/**
	 * Static list of common OpenAI chat models
	 * This list is maintained manually and includes the most commonly used models.
	 * The user's API key will be validated when they actually make requests with the selected model.
	 */
	private static readonly COMMON_MODELS: Model[] = [
		{ value: "gpt-4o", label: "GPT-4o" },
		{ value: "gpt-4o-mini", label: "GPT-4o Mini" },
		{ value: "gpt-4-turbo", label: "GPT-4 Turbo" },
		{ value: "gpt-4", label: "GPT-4" },
		{ value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
		{ value: "o1-preview", label: "O1 Preview" },
		{ value: "o1-mini", label: "O1 Mini" },
		{ value: "o3-mini", label: "O3 Mini" },
		{ value: "o3", label: "O3" },
	];

	async fetchModels(_apiKey: string): Promise<Model[]> {
		// OpenAI's /v1/models endpoint requires authentication, so we can't use
		// the user's API key just to list models. Instead, we return a static
		// list of common models. The user's API key will be validated when they
		// actually use the selected model.
		return OpenAIAdapter.COMMON_MODELS;
	}
}

