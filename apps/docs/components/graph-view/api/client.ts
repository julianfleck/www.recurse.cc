// API client for the graph-standalone component
import { type ApiService, apiService } from "@/lib/api";
import type { ApiResponse, GraphDataPayload } from "./types";

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

export class GraphApiClient {
  private readonly apiService: ApiService;

  constructor(apiServiceInstance?: ApiService) {
    this.apiService = apiServiceInstance || apiService;
  }

  async get(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): Promise<ApiResponse<unknown>> {
    console.log(
      `[GraphApiClient] Starting GET ${endpoint} with params:`,
      params
    );
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(
          `[GraphApiClient] Attempt ${attempt + 1}/${MAX_RETRIES} - calling apiService.get`
        );
        const response = await this.apiService.get(endpoint, params);
        console.log(
          `[GraphApiClient] GET successful on attempt ${attempt + 1}:`,
          {
            status: response.status,
            hasData: !!response.data,
          }
        );
        return {
          data: response.data,
          success: true,
        };
      } catch (error) {
        console.error(`[GraphApiClient] Attempt ${attempt + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // If it's an auth error (401/403), don't retry
        if (
          error instanceof Error &&
          (("status" in error &&
            (error.status === 401 || error.status === 403)) ||
            error.message.includes("No authentication token") ||
            error.message.includes("Token expired") ||
            error.message.includes("Invalid token format"))
        ) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, 2 ** attempt * RETRY_BASE_DELAY_MS)
          );
        }
      }
    }

    console.error(
      `[GraphApiClient] All ${MAX_RETRIES} attempts failed. Last error:`,
      lastError
    );
    return {
      data: null,
      success: false,
      error: lastError?.message || "Failed after retries",
    };
  }

  async search(params: {
    query?: string;
    depth?: number;
    field_set?: string;
    page?: number;
    limit?: number;
    id?: string;
    direction?: string;
  }): Promise<ApiResponse<unknown>> {
    console.log("[GraphApiClient] Starting search with params:", params);
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        console.log(
          `[GraphApiClient] Attempt ${attempt + 1}/${MAX_RETRIES} - calling apiService.get`
        );
        const response = await this.apiService.get("/search", params);
        console.log(
          `[GraphApiClient] Search successful on attempt ${attempt + 1}:`,
          {
            status: response.status,
            hasData: !!response.data,
          }
        );
        return {
          data: response.data,
          success: true,
        };
      } catch (error) {
        console.error(`[GraphApiClient] Attempt ${attempt + 1} failed:`, error);
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // If it's an auth error (401/403), don't retry
        if (
          error instanceof Error &&
          (("status" in error &&
            (error.status === 401 || error.status === 403)) ||
            error.message.includes("No authentication token") ||
            error.message.includes("Token expired") ||
            error.message.includes("Invalid token format"))
        ) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, 2 ** attempt * RETRY_BASE_DELAY_MS)
          );
        }
      }
    }

    console.error(
      `[GraphApiClient] All ${MAX_RETRIES} attempts failed. Last error:`,
      lastError
    );
    return {
      data: null,
      success: false,
      error: lastError?.message || "Failed after retries",
    };
  }

  // Legacy methods for backward compatibility
  async fetchGraphData(url: string): Promise<ApiResponse<GraphDataPayload>> {
    // Extract params from URL for legacy compatibility
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    const res = await this.search(params);
    return res as ApiResponse<GraphDataPayload>;
  }

  async postGraphData(
    endpoint: string,
    payload: GraphDataPayload
  ): Promise<ApiResponse<unknown>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await this.apiService.post(endpoint, payload);
        return {
          data: response.data,
          success: true,
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error("Unknown error");

        // If it's an auth error (401/403), don't retry
        if (
          error instanceof Error &&
          (("status" in error &&
            (error.status === 401 || error.status === 403)) ||
            error.message.includes("No authentication token") ||
            error.message.includes("Token expired") ||
            error.message.includes("Invalid token format"))
        ) {
          break;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < MAX_RETRIES - 1) {
          await new Promise((resolve) =>
            setTimeout(resolve, 2 ** attempt * RETRY_BASE_DELAY_MS)
          );
        }
      }
    }

    return {
      data: null,
      success: false,
      error: lastError?.message || "Failed after retries",
    };
  }
}

// Default instance using the main API service
export const graphApiClient = new GraphApiClient(apiService);
