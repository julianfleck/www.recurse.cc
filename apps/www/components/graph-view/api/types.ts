// API types for the graph-standalone component
export type ApiResponse<T = any> = {
	data: T;
	success: boolean;
	message?: string;
	error?: string;
};

export type GraphApiConfig = {
	baseUrl?: string;
	timeout?: number;
	retries?: number;
};

export type GraphDataPayload = {
	nodes?: any[];
	links?: any[];
	metadata?: Record<string, any>;
};
