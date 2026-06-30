import { Knex } from 'knex';
import {resolvePackagePath} from '@backstage/backend-plugin-api'

const { randomUUID } = require('crypto');

import {
  CreateFeedbackInput,
  FeedbackRecord,
  FeedbackStatus,
  FeedbackStore,
  FeedbackType,
  ListFeedbackOptions,
  ListFeedbackResult,
  UpdateFeedbackInput,
} from './types';

interface FeedbackRow {
  id: string;
  type: string;
  entity_ref: string | null;
  rating: number | null;
  category: string;
  comment: string | null;
  created_by: string | null;
  status: string;
  created_at: string | Date;
  updated_at: string | Date;
}

function toRecord(row: FeedbackRow): FeedbackRecord {
  return {
    id: row.id,
    type: row.type as FeedbackType,
    entityRef: row.entity_ref,
    rating: row.rating,
    category: row.category,
    comment: row.comment,
    createdBy: row.created_by,
    status: row.status as FeedbackStatus,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

/**
 * Knex-backed implementation of FeedbackStore. The same code works
 * against SQLite (e.g. better-sqlite3, in-memory or file) in development
 * and Postgres in production — Backstage's DatabaseService hands us an
 * already-configured, already-migrated Knex client for whichever backend
 * is configured in app-config.yaml.
 */
export class DatabaseFeedbackStore implements FeedbackStore {
  static async create(knex: Knex): Promise<DatabaseFeedbackStore> {
    await knex.migrate.latest({
          directory: resolvePackagePath('@internal/backstage-plugin-feedback-backend', 'migrations'),
      });
    return new DatabaseFeedbackStore(knex);
  }

  private constructor(private readonly db: Knex) {}

  async create(input: CreateFeedbackInput): Promise<FeedbackRecord> {
    const now = new Date().toISOString();
    const row = {
      id: randomUUID(),
      type: input.type,
      entity_ref: input.entityRef ?? null,
      rating: input.rating ?? null,
      category: input.category ?? 'general',
      comment: input.comment ?? null,
      created_by: input.createdBy ?? null,
      status: 'open',
      created_at: now,
      updated_at: now,
    };
    await this.db('feedback').insert(row);
    const created = await this.get(row.id);
    return created!;
  }

  async get(id: string): Promise<FeedbackRecord | undefined> {
    const row = await this.db<FeedbackRow>('feedback').where({ id }).first();
    return row ? toRecord(row) : undefined;
  }

  async list(options: ListFeedbackOptions): Promise<ListFeedbackResult> {
    const baseQuery = this.db<FeedbackRow>('feedback');

    if (options.type) {
      baseQuery.where({ type: options.type });
    }
    if (options.entityRef) {
      baseQuery.where({ entity_ref: options.entityRef });
    }
    if (options.status) {
      baseQuery.where({ status: options.status });
    }

    const countResult = await baseQuery.clone().count<{ count: string }[]>({ count: '*' });
    const totalCount = Number(countResult[0]?.count ?? 0);

    const limit = options.limit ?? 50;
    const offset = options.offset ?? 0;

    const rows = await baseQuery
      .clone()
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    return { items: rows.map(toRecord), totalCount };
  }

  async update(id: string, input: UpdateFeedbackInput): Promise<FeedbackRecord | undefined> {
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (input.status !== undefined) {
      patch.status = input.status;
    }
    if (input.comment !== undefined) {
      patch.comment = input.comment;
    }

    const updatedCount = await this.db('feedback').where({ id }).update(patch);
    if (updatedCount === 0) {
      return undefined;
    }
    return this.get(id);
  }

  async delete(id: string): Promise<boolean> {
    const deletedCount = await this.db('feedback').where({ id }).delete();
    return deletedCount > 0;
  }
}
