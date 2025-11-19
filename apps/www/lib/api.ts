// Generic API service for querying the main API
// Simplified version for www app - GraphView component compatibility

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

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
	private readonly baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
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

			const url = `${this.baseUrl}${endpoint}${queryString}`;

			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};

			const response = await fetch(url, {
				method: "GET",
				headers,
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
}

// Create and export a default instance
export const apiService = new ApiService(API_BASE_URL);


