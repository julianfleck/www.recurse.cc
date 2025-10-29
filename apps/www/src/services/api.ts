import type {
  Document,
  FetchConfig,
  Frame,
  KBNode,
  Post,
  RelatedItem,
  Section,
  Session,
} from '@/models/api/types';

export class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  async fetch<T>(endpoint: string, config: FetchConfig = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: config.method || 'GET',
      headers: { ...this.defaultHeaders, ...config.headers },
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Example endpoint
  async getTestPost(id = 1): Promise<Post> {
    return this.fetch<Post>(`/posts/${id}`);
  }

  // Additional example endpoints
  async getAllPosts(): Promise<Post[]> {
    return this.fetch<Post[]>('/posts');
  }

  async createPost(post: Omit<Post, 'id'>): Promise<Post> {
    return this.fetch<Post>('/posts', {
      method: 'POST',
      body: post,
    });
  }

  async updatePost(id: number, post: Partial<Post>): Promise<Post> {
    return this.fetch<Post>(`/posts/${id}`, {
      method: 'PUT',
      body: post,
    });
  }

  async deletePost(id: number): Promise<void> {
    await this.fetch<void>(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async getDocumentsWithChildren(): Promise<KBNode[]> {
    const data = await this.fetch<{ items: KBNode[] }>(
      '/get/documents?include_sections=true'
    );
    return data.items;
  }

  // Add stubs for all methods expected by apiConfig
  async getDocuments(): Promise<Document[]> {
    throw new Error(
      'getDocuments not implemented in ApiService. Use getDocumentsWithChildren instead.'
    );
  }

  async getDocument(): Promise<Document | null> {
    throw new Error(
      'getDocument not implemented in ApiService. Use getDocumentsWithChildren instead.'
    );
  }

  async getSection(): Promise<Section | null> {
    throw new Error(
      'getSection not implemented in ApiService. Use getDocumentsWithChildren instead.'
    );
  }

  async getFrame(): Promise<Frame | null> {
    throw new Error(
      'getFrame not implemented in ApiService. Use getDocumentsWithChildren instead.'
    );
  }

  async getSessions(): Promise<Session[]> {
    throw new Error('getSessions not implemented in ApiService.');
  }

  async getRelatedItems(): Promise<RelatedItem[]> {
    throw new Error('getRelatedItems not implemented in ApiService.');
  }

  async getMarkdownContent(): Promise<string | null> {
    throw new Error('getMarkdownContent not implemented in ApiService.');
  }
}
