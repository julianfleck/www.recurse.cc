// API client for the graph-standalone component
import type { ApiResponse, GraphApiConfig, GraphDataPayload } from './types';

export class GraphApiClient {
  private config: Required<GraphApiConfig>;

  constructor(config: GraphApiConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || '',
      timeout: config.timeout || 10_000,
      retries: config.retries || 3,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        data,
        success: true,
      };
    } catch (error) {
      return {
        data: null as T,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async fetchGraphData(url: string): Promise<ApiResponse<GraphDataPayload>> {
    return this.request<GraphDataPayload>(url, {
      method: 'GET',
    });
  }

  async postGraphData(
    endpoint: string,
    payload: GraphDataPayload
  ): Promise<ApiResponse<any>> {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }
}

// Default instance for standalone usage
export const graphApiClient = new GraphApiClient();
