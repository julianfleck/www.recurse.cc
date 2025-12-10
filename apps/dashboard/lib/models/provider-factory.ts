import type { ModelProviderAdapter, ProviderName } from "./types";
import { OpenAIAdapter } from "./adapters/openai-adapter";
import { OpenRouterAdapter } from "./adapters/openrouter-adapter";

/**
 * Factory for creating model provider adapters
 */
export class ModelProviderFactory {
	/**
	 * Creates an adapter instance for the specified provider
	 * @param provider - The provider name
	 * @returns An adapter instance implementing ModelProviderAdapter
	 * @throws Error if the provider is not supported
	 */
	static create(provider: ProviderName): ModelProviderAdapter {
		switch (provider) {
			case "openai":
				return new OpenAIAdapter();
			case "openrouter":
				return new OpenRouterAdapter();
			default:
				throw new Error(`Unsupported provider: ${provider}`);
		}
	}

	/**
	 * Gets all supported provider names
	 */
	static getSupportedProviders(): ProviderName[] {
		return ["openai", "openrouter"];
	}
}

