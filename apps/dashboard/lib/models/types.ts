/**
 * Common types for model providers
 */

export interface Model {
	value: string;
	label: string;
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

