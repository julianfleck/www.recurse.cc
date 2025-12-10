import type { Model, ModelProviderAdapter } from "../types";

/**
 * OpenRouter API adapter for fetching models
 * 
 * OpenRouter API endpoint: GET https://openrouter.ai/api/v1/models
 * Response format: { data: [{ id: string, name: string, ... }] }
 */
export class OpenRouterAdapter implements ModelProviderAdapter {
	private readonly apiUrl = "https://openrouter.ai/api/v1/models";

	async fetchModels(apiKey: string): Promise<Model[]> {
		const response = await fetch(this.apiUrl, {
			headers: {
				Authorization: `Bearer ${apiKey}`,
			},
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`OpenRouter API error: ${response.status} ${response.statusText}. ${errorText}`,
			);
		}

		const data = await response.json();

		// OpenRouter returns: { data: [{ id: string, name: string, ... }] }
		if (!data.data || !Array.isArray(data.data)) {
			throw new Error("Invalid response format from OpenRouter API");
		}

		return data.data.map((model: { id: string; name?: string }) => ({
			value: model.id,
			label: model.name || model.id,
		}));
	}
}

