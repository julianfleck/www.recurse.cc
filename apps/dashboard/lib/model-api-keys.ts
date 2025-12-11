/**
 * Service for managing user model API keys (BYOK)
 */

import { apiService } from "./api";

export interface UserModelApiKey {
	id: string;
	provider: string;
	model_pattern: string | null;
	created_at: string;
	updated_at: string;
	is_active: boolean;
	key_preview: string;
}

export interface CreateModelApiKeyRequest {
	provider: string;
	model_pattern?: string | null;
	api_key: string;
	is_active?: boolean;
}

export interface UpdateModelApiKeyRequest {
	api_key?: string;
	model_pattern?: string | null;
	is_active?: boolean;
}

/**
 * Get all model API keys for the current user
 */
export async function getModelApiKeys(): Promise<UserModelApiKey[]> {
	const response = await apiService.get<UserModelApiKey[]>(
		"/users/me/model-api-keys",
	);
	return response.data;
}

/**
 * Create a new model API key
 */
export async function createModelApiKey(
	request: CreateModelApiKeyRequest,
): Promise<UserModelApiKey> {
	const response = await apiService.post<UserModelApiKey>(
		"/users/me/model-api-keys",
		request,
	);
	return response.data;
}

/**
 * Get a specific model API key by ID
 */
export async function getModelApiKey(keyId: string): Promise<UserModelApiKey> {
	const response = await apiService.get<UserModelApiKey>(
		`/users/me/model-api-keys/${keyId}`,
	);
	return response.data;
}

/**
 * Update a model API key
 */
export async function updateModelApiKey(
	keyId: string,
	request: UpdateModelApiKeyRequest,
): Promise<UserModelApiKey> {
	const response = await apiService.patch<UserModelApiKey>(
		`/users/me/model-api-keys/${keyId}`,
		request,
	);
	return response.data;
}

/**
 * Delete a model API key
 */
export async function deleteModelApiKey(keyId: string): Promise<void> {
	await apiService.delete(`/users/me/model-api-keys/${keyId}`);
}

/**
 * Find or create a model API key for a provider
 * Returns the key ID if found/created, null if creation failed
 */
export async function upsertModelApiKey(
	provider: string,
	apiKey: string,
	modelPattern?: string | null,
): Promise<string | null> {
	try {
		const keys = await getModelApiKeys();
		const targetModelPattern = modelPattern || null;
		
		// First, try to find existing key for this provider + model_pattern combination
		// This ensures we update the correct key when multiple keys exist for the same provider
		let existingKey = keys.find(
			(k) =>
				k.provider === provider &&
				k.model_pattern === targetModelPattern &&
				k.is_active,
		);

		// If no exact match, try to find any key with this provider (for backwards compatibility)
		// But only if there's exactly one active key for this provider
		if (!existingKey) {
			const providerKeys = keys.filter(
				(k) => k.provider === provider && k.is_active,
			);
			if (providerKeys.length === 1) {
				existingKey = providerKeys[0];
			}
		}

		if (existingKey) {
			// Update existing key with both api_key and model_pattern
			await updateModelApiKey(existingKey.id, {
				api_key: apiKey,
				model_pattern: targetModelPattern,
			});
			return existingKey.id;
		}

		// Create new key
		const newKey = await createModelApiKey({
			provider,
			model_pattern: targetModelPattern,
			api_key: apiKey,
			is_active: true,
		});
		return newKey.id;
	} catch (error) {
		console.error("[Model API Keys] Failed to upsert key:", error);
		return null;
	}
}

