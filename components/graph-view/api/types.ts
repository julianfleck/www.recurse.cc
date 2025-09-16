// API types for the graph-standalone component
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface GraphApiConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface GraphDataPayload {
  nodes?: any[];
  links?: any[];
  metadata?: Record<string, any>;
}
