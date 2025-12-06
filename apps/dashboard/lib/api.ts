// Generic API service for querying the main API
import { ensureValidAccessToken } from "@recurse/auth";

// Default to localhost:8000 in development if env var is not set
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ||
	(process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");

if (!API_BASE_URL) {
	throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is not set");
}

// Use proxy in development to avoid CORS issues
// In production, the API should have proper CORS headers configured
const getApiBaseUrl = () => {
	// Check if we're in the browser and in development mode
	const isDevelopment = process.env.NODE_ENV === "development";
	const isBrowser = typeof window !== "undefined";

	if (isBrowser && isDevelopment) {
		// In browser during development, use the proxy route to avoid CORS
		return "/api/proxy";
	}

	// In production or server-side, use the direct API URL
	return API_BASE_URL;
};

// Global auth store getter (will be set when API service is initialized)
let getAccessToken: (() => string | undefined) | null = null;

export type ApiResponse<T = unknown> = {
	data: T;
	status: number;
	statusText: string;
};

export class ApiError extends Error {
	status?: number;
	details?: unknown;

	constructor(message: string, status?: number, details?: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.details = details;
	}
}

export class ApiService {
	private readonly getBaseUrl: () => string;

	constructor(baseUrlOrGetter: string | (() => string)) {
		// Support both static string and dynamic getter for base URL
		this.getBaseUrl =
			typeof baseUrlOrGetter === "function"
				? baseUrlOrGetter
				: () => baseUrlOrGetter;
	}

	/**
	 * Makes a GET request to the API
	 * @param endpoint - The API endpoint (without base URL)
	 * @param params - Query parameters as an object
	 * @returns Promise with the API response
	 */
	async get<T = unknown>(
		endpoint: string,
		params?: Record<string, string | number | boolean>,
	): Promise<ApiResponse<T>> {
		try {
			// Build query string from params
			const queryString = params
				? `?${new URLSearchParams(
						Object.entries(params).reduce(
							(acc, [key, value]) => {
								acc[key] = String(value);
								return acc;
							},
							{} as Record<string, string>,
						),
					).toString()}`
				: "";

			const url = `${this.getBaseUrl()}${endpoint}${queryString}`;

			let authToken = getAccessToken?.();
			authToken = await ensureValidAccessToken(authToken);

			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			if (authToken) {
				headers.Authorization = `Bearer ${authToken}`;
			} else {
				const authError = new ApiError(
					"No authentication token available",
					401,
				);
				authError.name = "AuthenticationError";
				throw authError;
			}

			const response = await fetch(url, {
				method: "GET",
				headers,
				// Include credentials for CORS requests
				credentials: "include",
				// Set mode to handle CORS
				mode: "cors",
			});

			const data = await response.json();

			if (!response.ok) {
				throw new ApiError(
					`API request failed: ${response.statusText}`,
					response.status,
					data,
				);
			}

			return {
				data,
				status: response.status,
				statusText: response.statusText,
			};
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}

			throw new ApiError(
				`Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
				undefined,
				error,
			);
		}
	}

	/**
	 * Makes a DELETE request to the API
	 * @param endpoint - The API endpoint (without base URL)
	 * @returns Promise with the API response
	 */
	async delete<T = unknown>(endpoint: string): Promise<ApiResponse<T>> {
		try {
			const url = `${this.getBaseUrl()}${endpoint}`;

			let authToken = getAccessToken?.();
			authToken = await ensureValidAccessToken(authToken);

			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			if (authToken) {
				headers.Authorization = `Bearer ${authToken}`;
			} else {
				const authError = new ApiError(
					"No authentication token available",
					401,
				);
				authError.name = "AuthenticationError";
				throw authError;
			}

			const response = await fetch(url, {
				method: "DELETE",
				headers,
				// Include credentials for CORS requests
				credentials: "include",
				// Set mode to handle CORS
				mode: "cors",
			});

			const data = await response.json();

			if (!response.ok) {
				throw new ApiError(
					`API request failed: ${response.statusText}`,
					response.status,
					data,
				);
			}

			return {
				data,
				status: response.status,
				statusText: response.statusText,
			};
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}

			throw new ApiError(
				`Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
				undefined,
				error,
			);
		}
	}

	/**
	 * Uploads a file to the API using multipart/form-data
	 * @param endpoint - The API endpoint (without base URL)
	 * @param file - The file to upload
	 * @param additionalFields - Optional additional form fields
	 * @returns Promise with the API response
	 */
	async uploadFile<T = unknown>(
		endpoint: string,
		file: File,
		additionalFields?: Record<string, string>,
	): Promise<ApiResponse<T>> {
		try {
			const url = `${this.getBaseUrl()}${endpoint}`;

			let authToken = getAccessToken?.();
			authToken = await ensureValidAccessToken(authToken);

			const headers: Record<string, string> = {};

			if (authToken) {
				headers.Authorization = `Bearer ${authToken}`;
			} else {
				const authError = new ApiError(
					"No authentication token available",
					401,
				);
				authError.name = "AuthenticationError";
				throw authError;
			}

			const formData = new FormData();
			formData.append("file", file);

			if (additionalFields) {
				for (const [key, value] of Object.entries(additionalFields)) {
					formData.append(key, value);
				}
			}

			const response = await fetch(url, {
				method: "POST",
				headers,
				body: formData,
				credentials: "include",
				mode: "cors",
			});

			const data = await response.json();

			if (!response.ok) {
				throw new ApiError(
					`API request failed: ${response.statusText}`,
					response.status,
					data,
				);
			}

			return {
				data,
				status: response.status,
				statusText: response.statusText,
			};
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}

			throw new ApiError(
				`Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
				undefined,
				error,
			);
		}
	}

	/**
	 * Makes a POST request to the API
	 * @param endpoint - The API endpoint (without base URL)
	 * @param payload - The request payload
	 * @returns Promise with the API response
	 */
	async post<T = unknown>(
		endpoint: string,
		payload?: unknown,
	): Promise<ApiResponse<T>> {
		try {
			const url = `${this.getBaseUrl()}${endpoint}`;

			let authToken = getAccessToken?.();
			authToken = await ensureValidAccessToken(authToken);

			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			if (authToken) {
				headers.Authorization = `Bearer ${authToken}`;
			} else {
				const authError = new ApiError(
					"No authentication token available",
					401,
				);
				authError.name = "AuthenticationError";
				throw authError;
			}

			const response = await fetch(url, {
				method: "POST",
				headers,
				body: payload ? JSON.stringify(payload) : undefined,
				// Include credentials for CORS requests
				credentials: "include",
				// Set mode to handle CORS
				mode: "cors",
			});

			const data = await response.json();

			if (!response.ok) {
				throw new ApiError(
					`API request failed: ${response.statusText}`,
					response.status,
					data,
				);
			}

			return {
				data,
				status: response.status,
				statusText: response.statusText,
			};
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}

			throw new ApiError(
				`Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
				undefined,
				error,
			);
		}
	}
}

// Function to set the auth store getter
export const setApiAuthGetter = (getter: () => string | undefined) => {
	getAccessToken = getter;
};

// Create and export a default instance
// Uses proxy in development (evaluated at request time), direct API URL in production
export const apiService = new ApiService(getApiBaseUrl);
