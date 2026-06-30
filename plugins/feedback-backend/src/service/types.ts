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
  createdBy?: string | null;
}

export interface UpdateFeedbackInput {
  status?: FeedbackStatus;
  comment?: string | null;
}

export interface ListFeedbackOptions {
  type?: FeedbackType;
  entityRef?: string;
  status?: FeedbackStatus;
  limit?: number;
  offset?: number;
}

export interface ListFeedbackResult {
  items: FeedbackRecord[];
  totalCount: number;
}

/**
 * Storage abstraction for feedback records. Two implementations are
 * provided: an in-memory store (handy for local dev / tests without a DB)
 * and a knex-backed store that works against both SQLite and Postgres.
 */
export interface FeedbackStore {
  create(input: CreateFeedbackInput): Promise<FeedbackRecord>;
  get(id: string): Promise<FeedbackRecord | undefined>;
  list(options: ListFeedbackOptions): Promise<ListFeedbackResult>;
  update(id: string, input: UpdateFeedbackInput): Promise<FeedbackRecord | undefined>;
  delete(id: string): Promise<boolean>;
}
