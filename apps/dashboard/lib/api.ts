// Generic API service for querying the main API
import { AuthSessionExpiredError, ensureValidAccessToken } from "@recurse/auth";

// Default to localhost:8000 in development if env var is not set
const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_BASE_URL ||
	(process.env.NODE_ENV === "development" ? "http://localhost:8000" : "");

if (!API_BASE_URL) {
	throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is not set");
}

// Debug: Log the API URL configuration on load
if (typeof window !== "undefined") {
	console.log("[API Config]", {
		API_BASE_URL,
		NODE_ENV: process.env.NODE_ENV,
		envVar: process.env.NEXT_PUBLIC_API_BASE_URL,
	});
}

// Always use proxy in browser to avoid CORS issues
// The proxy handles server-side requests which don't have CORS restrictions
const getApiBaseUrl = () => {
	const isBrowser = typeof window !== "undefined";

	if (isBrowser) {
		// In browser, always use the proxy route to avoid CORS issues
		// The proxy makes server-side requests which bypass CORS
		return "/api/proxy";
	}

	// Server-side (SSR), use the direct API URL
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
	isCorsError?: boolean;

	constructor(message: string, status?: number, details?: unknown, isCorsError = false) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.details = details;
		this.isCorsError = isCorsError;
	}
}

/**
 * Detects if an error is CORS-related
 */
function isCorsError(error: unknown): boolean {
	if (!(error instanceof Error)) {
		return false;
	}
	
	const errorMessage = error.message.toLowerCase();
	const corsIndicators = [
		"cors",
		"access-control-allow-origin",
		"preflight",
		"blocked by cors policy",
		"no 'access-control-allow-origin' header",
	];
	
	return corsIndicators.some(indicator => errorMessage.includes(indicator));
}

/**
 * Handles API errors consistently across all methods
 */
function handleApiError(error: unknown): never {
	// Re-throw session expired errors without wrapping
	if (error instanceof AuthSessionExpiredError) {
		throw error;
	}
	if (error instanceof ApiError) {
		throw error;
	}

	// Check for CORS errors
	const corsError = isCorsError(error);
	const errorMessage = error instanceof Error ? error.message : "Unknown error";
	
	// Check for network errors that might be CORS-related or unsafe URL
	const isNetworkError = errorMessage.includes("Failed to fetch") || 
		errorMessage.includes("NetworkError") ||
		errorMessage.includes("ERR_FAILED") ||
		errorMessage.includes("ERR_BLOCKED_BY_CLIENT") ||
		errorMessage.includes("Mixed Content") ||
		errorMessage.includes("unsafe") ||
		errorMessage.includes("insecure");
	
	if (corsError || isNetworkError) {
		// CORS or network errors - provide helpful message
		throw new ApiError(
			"Unable to connect to API. The API server may be unavailable or there may be a CORS configuration issue.",
			undefined,
			error,
			true,
		);
	}

	throw new ApiError(
		`Network error: ${errorMessage}`,
		undefined,
		error,
	);
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
			handleApiError(error);
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
			handleApiError(error);
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
			handleApiError(error);
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
			handleApiError(error);
		}
	}

	/**
	 * Makes a PATCH request to the API
	 * @param endpoint - The API endpoint (without base URL)
	 * @param payload - The request payload
	 * @returns Promise with the API response
	 */
	async patch<T = unknown>(
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
				method: "PATCH",
				headers,
				body: payload ? JSON.stringify(payload) : undefined,
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
			handleApiError(error);
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
