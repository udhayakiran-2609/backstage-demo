import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';

export type FeedbackType = 'general' | 'entity';
export type FeedbackStatus = 'open' | 'acknowledged' | 'resolved' | 'wontfix';

export interface FeedbackRecord {
  id: string;
  type: FeedbackType;
  entityRef: string | null;
  rating: number | null;
  category: string;
  comment: string | null;
  createdBy: string | null;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackInput {
  type: FeedbackType;
  entityRef?: string | null;
  rating?: number | null;
  category?: string;
  comment?: string | null;
}

export interface ListFeedbackQuery {
  type?: FeedbackType;
  entityRef?: string;
  status?: FeedbackStatus;
  limit?: number;
  offset?: number;
}

export interface ListFeedbackResponse {
  items: FeedbackRecord[];
  totalCount: number;
}

export interface FeedbackApi {
  createFeedback(input: CreateFeedbackInput): Promise<FeedbackRecord>;
  listFeedback(query?: ListFeedbackQuery): Promise<ListFeedbackResponse>;
  updateFeedback(
    id: string,
    input: { status?: FeedbackStatus; comment?: string | null },
  ): Promise<FeedbackRecord>;
  deleteFeedback(id: string): Promise<void>;
}

export const feedbackApiRef = createApiRef<FeedbackApi>({
  id: 'plugin.feedback.api',
});

export class FeedbackApiClient implements FeedbackApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  private async getBaseUrl(): Promise<string> {
    return this.discoveryApi.getBaseUrl('feedback');
  }

  async createFeedback(input: CreateFeedbackInput): Promise<FeedbackRecord> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(`Failed to submit feedback: ${response.status} ${await response.text()}`);
    }
    return response.json();
  }

  async listFeedback(query: ListFeedbackQuery = {}): Promise<ListFeedbackResponse> {
    const baseUrl = await this.getBaseUrl();
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    });
    const response = await this.fetchApi.fetch(`${baseUrl}/feedback?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Failed to list feedback: ${response.status} ${await response.text()}`);
    }
    return response.json();
  }

  async updateFeedback(
    id: string,
    input: { status?: FeedbackStatus; comment?: string | null },
  ): Promise<FeedbackRecord> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      throw new Error(`Failed to update feedback: ${response.status} ${await response.text()}`);
    }
    return response.json();
  }

  async deleteFeedback(id: string): Promise<void> {
    const baseUrl = await this.getBaseUrl();
    const response = await this.fetchApi.fetch(`${baseUrl}/feedback/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      throw new Error(`Failed to delete feedback: ${response.status} ${await response.text()}`);
    }
  }
}
