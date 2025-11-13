import { ApiService } from "./api";
import { type MockApiService, mockApi } from "./mockApi";

// Configuration for API service
export type ApiMode = "mock" | "real";

interface ApiConfig {
	mode: ApiMode;
	baseUrl: string;
}

class ApiConfigService {
	private config: ApiConfig = {
		mode: "mock", // Default to mock for development
		baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
	};

	getMode(): ApiMode {
		return this.config.mode;
	}

	setMode(mode: ApiMode): void {
		this.config.mode = mode;
		// Store in localStorage for persistence
		if (typeof window !== "undefined") {
			localStorage.setItem("apiMode", mode);
		}
	}

	getBaseUrl(): string {
		return this.config.baseUrl;
	}

	setBaseUrl(url: string): void {
		this.config.baseUrl = url;
		if (typeof window !== "undefined") {
			localStorage.setItem("apiBaseUrl", url);
		}
	}

	// Initialize from localStorage
	initialize(): void {
		if (typeof window !== "undefined") {
			const savedMode = localStorage.getItem("apiMode") as ApiMode;
			const savedUrl = localStorage.getItem("apiBaseUrl");

			if (savedMode && ["mock", "real"].includes(savedMode)) {
				this.config.mode = savedMode;
			}

			if (savedUrl) {
				this.config.baseUrl = savedUrl;
			}
		}
	}

	// Get the appropriate API service based on current mode
	getApiService(): MockApiService | ApiService {
		if (this.config.mode === "real") {
			return new ApiService(this.config.baseUrl);
		}
		return mockApi;
	}
}

export const apiConfig = new ApiConfigService();

// Initialize on module load
apiConfig.initialize();

// Export a dynamic API service that switches based on configuration
export const api = {
	getDocuments: () => apiConfig.getApiService().getDocuments(),
	getDocument: (id: string) => apiConfig.getApiService().getDocument(id),
	getSection: (id: string) => apiConfig.getApiService().getSection(id),
	getFrame: (id: string) => apiConfig.getApiService().getFrame(id),
	getSessions: () => apiConfig.getApiService().getSessions(),
	getRelatedItems: (
		itemId: string,
		itemType: "document" | "section" | "frame" | "query",
	) => apiConfig.getApiService().getRelatedItems(itemId, itemType),
	getMarkdownContent: (itemId: string) =>
		apiConfig.getApiService().getMarkdownContent(itemId),
	getDocumentsWithChildren: () => {
		const service = apiConfig.getApiService() as MockApiService & {
			getDocumentsWithChildren?: () => Promise<Document[]>;
		};
		if (typeof service.getDocumentsWithChildren === "function") {
			return service.getDocumentsWithChildren();
		}
		// fallback: just getDocuments (mock)
		return service.getDocuments();
	},
};
