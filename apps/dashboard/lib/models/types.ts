/**
 * Common types for model providers
 */

export interface Model {
	value: string;
	label: string;
}

/**
 * Extended model info from the backend API
 */
export interface AvailableModel {
	id: string;
	name: string;
	description?: string;
	context_length?: number;
	pricing?: {
		prompt?: string;
		completion?: string;
		request?: string;
		image?: string;
		web_search?: string;
		internal_reasoning?: string;
		input_cache_read?: string;
		[key: string]: string | undefined;
	};
	is_free?: boolean;
	supports_structured_output?: boolean;
}

export interface ModelProviderAdapter {
	/**
	 * Fetches the list of available models from the provider
	 * @param apiKey - The API key for authentication
	 * @returns Promise resolving to an array of models
	 */
	fetchModels(apiKey: string): Promise<Model[]>;
}

export type ProviderName = "openai" | "openrouter";

