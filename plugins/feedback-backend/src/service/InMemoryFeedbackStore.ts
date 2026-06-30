const { randomUUID } = require('crypto');

import {
  CreateFeedbackInput,
  FeedbackRecord,
  FeedbackStore,
  ListFeedbackOptions,
  ListFeedbackResult,
  UpdateFeedbackInput,
} from './types';

/**
 * Simple in-memory implementation of FeedbackStore. Data is lost on
 * restart — intended only for local development or unit tests where
 * spinning up a database is unnecessary friction.
 */
export class InMemoryFeedbackStore implements FeedbackStore {
  private records = new Map<string, FeedbackRecord>();

  async create(input: CreateFeedbackInput): Promise<FeedbackRecord> {
    const now = new Date().toISOString();
    const record: FeedbackRecord = {
      id: randomUUID,
      type: input.type,
      entityRef: input.entityRef ?? null,
      rating: input.rating ?? null,
      category: input.category ?? 'general',
      comment: input.comment ?? null,
      createdBy: input.createdBy ?? null,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(record.id, record);
    return record;
  }

  async get(id: string): Promise<FeedbackRecord | undefined> {
    return this.records.get(id);
  }

  async list(options: ListFeedbackOptions): Promise<ListFeedbackResult> {
    let items = Array.from(this.records.values());

    if (options.type) {
      items = items.filter(i => i.type === options.type);
    }
    if (options.entityRef) {
      items = items.filter(i => i.entityRef === options.entityRef);
    }
    if (options.status) {
      items = items.filter(i => i.status === options.status);
    }

    items = items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const totalCount = items.length;
    const offset = options.offset ?? 0;
    const limit = options.limit ?? 50;
    items = items.slice(offset, offset + limit);

    return { items, totalCount };
  }

  async update(id: string, input: UpdateFeedbackInput): Promise<FeedbackRecord | undefined> {
    const existing = this.records.get(id);
    if (!existing) {
      return undefined;
    }
    const updated: FeedbackRecord = {
      ...existing,
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.comment !== undefined ? { comment: input.comment } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.records.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.records.delete(id);
  }
}
