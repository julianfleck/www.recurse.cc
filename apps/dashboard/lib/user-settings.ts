/**
 * Service for managing user settings via the unified settings API
 */

import { apiService } from "./api";

export interface UserSettings {
	models: {
		writing: string;
		extraction: string;
	};
	api_keys: {
		openrouter?: { configured: boolean; preview: string | null };
		openai?: { configured: boolean; preview: string | null };
		anthropic?: { configured: boolean; preview: string | null };
		google?: { configured: boolean; preview: string | null };
	};
	preferences?: {
		theme?: string;
		language?: string;
		notifications_enabled?: boolean;
	};
}

export interface UpdateUserSettingsRequest {
	models?: {
		writing?: string;
		extraction?: string;
	};
	api_keys?: {
		openrouter?: string;
		openai?: string;
		anthropic?: string;
		google?: string;
	};
	preferences?: {
		theme?: string;
		language?: string;
		notifications_enabled?: boolean;
	};
}

/**
 * Get all user settings
 */
export async function getUserSettings(): Promise<UserSettings> {
	const response = await apiService.get<UserSettings>("/users/me/settings");
	return response.data;
}

/**
 * Update user settings
 */
export async function updateUserSettings(
	request: UpdateUserSettingsRequest,
): Promise<UserSettings> {
	const response = await apiService.patch<UserSettings>(
		"/users/me/settings",
		request,
	);
	return response.data;
}

