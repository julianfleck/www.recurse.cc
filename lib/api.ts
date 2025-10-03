// Generic API service for querying the main API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is not set");
}

// Global auth store getter (will be set when API service is initialized)
let getAccessToken: (() => string | undefined) | null = null;

// JWT token constants
const JWT_PARTS_COUNT = 3;
const MILLISECONDS_PER_SECOND = 1000;

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
    options: { requireAuth?: boolean } = { requireAuth: true }
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
              {} as Record<string, string>
            )
          ).toString()}`
        : "";

      const url = `${this.baseUrl}${endpoint}${queryString}`;

      console.log(`[API] GET ${url}`, { params, endpoint });

      const authToken = getAccessToken?.();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      let hasAuth = false;

      if (authToken) {
        // Validate that it's a JWT token (3 parts separated by dots)
        const tokenParts = authToken.split(".");
        if (tokenParts.length === JWT_PARTS_COUNT) {
          // Check if token is expired (basic check)
          try {
            const jwtPayload = JSON.parse(atob(tokenParts[1]));
            const nowInSeconds = Math.floor(
              Date.now() / MILLISECONDS_PER_SECOND
            );

            if (jwtPayload.exp && jwtPayload.exp < nowInSeconds) {
              throw new ApiError("Token expired", 401);
            }

            headers.Authorization = `Bearer ${authToken}`;
            hasAuth = true;
          } catch (_error) {
            headers.Authorization = `Bearer ${authToken}`;
            hasAuth = true;
          }
        } else {
          throw new ApiError("Invalid token format", 401);
        }
      } else if (options.requireAuth) {
        const authError = new ApiError(
          "No authentication token available",
          401
        );
        authError.name = "AuthenticationError";
        throw authError;
      }

      console.log(`[API] GET ${url} - Headers:`, headers);

      const response = await fetch(url, {
        method: "GET",
        headers,
        credentials: hasAuth ? "include" : "omit",
        mode: "cors",
      });

      console.log(`[API] GET ${url} - Response:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`[API] GET ${url} - Error:`, {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        throw new ApiError(
          `API request failed: ${response.statusText}`,
          response.status,
          data
        );
      }

      console.log(`[API] GET ${url} - Success:`, {
        status: response.status,
        dataKeys:
          typeof data === "object" && data ? Object.keys(data) : "non-object",
        dataLength: Array.isArray(data) ? data.length : "not-array",
      });

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      console.error("[API] GET request - Exception:", error);
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error
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
      const url = `${this.baseUrl}${endpoint}`;

      const authToken = getAccessToken?.();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        // Validate that it's a JWT token (3 parts separated by dots)
        const tokenParts = authToken.split(".");
        if (tokenParts.length === JWT_PARTS_COUNT) {
          // Check if token is expired (basic check)
          try {
            const jwtPayload = JSON.parse(atob(tokenParts[1]));
            const nowInSeconds = Math.floor(
              Date.now() / MILLISECONDS_PER_SECOND
            );

            if (jwtPayload.exp && jwtPayload.exp < nowInSeconds) {
              throw new ApiError("Token expired", 401);
            }

            headers.Authorization = `Bearer ${authToken}`;
          } catch (_error) {
            headers.Authorization = `Bearer ${authToken}`;
          }
        } else {
          throw new ApiError("Invalid token format", 401);
        }
      } else {
        const authError = new ApiError(
          "No authentication token available",
          401
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
          data
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
        error
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
    payload?: unknown
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      console.log(`[API] POST ${url}`, { payload });

      const authToken = getAccessToken?.();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authToken) {
        // Validate that it's a JWT token (3 parts separated by dots)
        const tokenParts = authToken.split(".");
        if (tokenParts.length === JWT_PARTS_COUNT) {
          // Check if token is expired (basic check)
          try {
            const jwtPayload = JSON.parse(atob(tokenParts[1]));
            const nowInSeconds = Math.floor(
              Date.now() / MILLISECONDS_PER_SECOND
            );

            if (jwtPayload.exp && jwtPayload.exp < nowInSeconds) {
              throw new ApiError("Token expired", 401);
            }

            headers.Authorization = `Bearer ${authToken}`;
          } catch (_error) {
            headers.Authorization = `Bearer ${authToken}`;
          }
        } else {
          throw new ApiError("Invalid token format", 401);
        }
      } else {
        const authError = new ApiError(
          "No authentication token available",
          401
        );
        authError.name = "AuthenticationError";
        throw authError;
      }

      console.log(`[API] POST ${url} - Headers:`, headers);

      const response = await fetch(url, {
        method: "POST",
        headers,
        body: payload ? JSON.stringify(payload) : undefined,
        // Include credentials for CORS requests
        credentials: "include",
        // Set mode to handle CORS
        mode: "cors",
      });

      console.log(`[API] POST ${url} - Response:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`[API] POST ${url} - Error:`, {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        throw new ApiError(
          `API request failed: ${response.statusText}`,
          response.status,
          data
        );
      }

      console.log(`[API] POST ${url} - Success:`, {
        status: response.status,
        dataKeys:
          typeof data === "object" && data ? Object.keys(data) : "non-object",
        dataLength: Array.isArray(data) ? data.length : "not-array",
      });

      return {
        data,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      console.error("[API] POST request - Exception:", error);
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        error
      );
    }
  }
}

// Function to set the auth store getter
export const setApiAuthGetter = (getter: () => string | undefined) => {
  getAccessToken = getter;
};

// Create and export a default instance
export const apiService = new ApiService(API_BASE_URL);
