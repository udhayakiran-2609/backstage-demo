import { InputError, NotFoundError } from '@backstage/errors';
import express from 'express';
import Router from 'express-promise-router';
import { z } from 'zod';
import { FeedbackStatus, FeedbackStore, FeedbackType } from './types';

export interface RouterOptions {
  store: FeedbackStore;
  // Resolves a user identity (e.g. user entity ref) from the request,
  // or undefined if the request couldn't be authenticated / is anonymous.
  getUserRef: (req: express.Request) => Promise<string | undefined>;
}

const createFeedbackSchema = z.object({
  type: z.enum(['general', 'entity']),
  entityRef: z.string().optional().nullable(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  category: z.string().min(1).max(64).optional(),
  comment: z.string().max(4000).optional().nullable(),
});

const updateFeedbackSchema = z.object({
  status: z.enum(['open', 'acknowledged', 'resolved', 'wontfix']).optional(),
  comment: z.string().max(4000).optional().nullable(),
});

export async function createRouter(options: RouterOptions): Promise<express.Router> {
  const { store, getUserRef } = options;
  const router = Router();
  router.use(express.json());

  // Create feedback (general or entity-scoped)
  router.post('/feedback', async (req, res) => {
    const parsed = createFeedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new InputError(parsed.error.message);
    }
    const input = parsed.data;

    if (input.type === 'entity' && !input.entityRef) {
      throw new InputError('entityRef is required when type is "entity"');
    }
    if (!input.rating && !input.comment) {
      throw new InputError('At least one of rating or comment must be provided');
    }

    const createdBy = await getUserRef(req);

    const record = await store.create({
      type: input.type,
      entityRef: input.entityRef ?? null,
      rating: input.rating ?? null,
      category: input.category ?? 'general',
      comment: input.comment ?? null,
      createdBy: createdBy ?? null,
    });

    res.status(201).json(record);
  });

  // List feedback, with optional filters. Used by both the entity card
  // (filtered by entityRef) and the admin feedback page (unfiltered or
  // filtered by status).
  router.get('/feedback', async (req, res) => {
    const { type, entityRef, status, limit, offset } = req.query;

    const result = await store.list({
      type: type as FeedbackType | undefined,
      entityRef: entityRef as string | undefined,
      status: status as FeedbackStatus | undefined,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });

    res.json(result);
  });

  // Get a single feedback record
  router.get('/feedback/:id', async (req, res) => {
    const record = await store.get(req.params.id);
    if (!record) {
      throw new NotFoundError(`No feedback found with id ${req.params.id}`);
    }
    res.json(record);
  });

  // Update status / triage a feedback record (intended for maintainers)
  router.patch('/feedback/:id', async (req, res) => {
    const parsed = updateFeedbackSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new InputError(parsed.error.message);
    }

    const updated = await store.update(req.params.id, parsed.data);
    if (!updated) {
      throw new NotFoundError(`No feedback found with id ${req.params.id}`);
    }
    res.json(updated);
  });

  // Delete a feedback record
  router.delete('/feedback/:id', async (req, res) => {
    const deleted = await store.delete(req.params.id);
    if (!deleted) {
      throw new NotFoundError(`No feedback found with id ${req.params.id}`);
    }
    res.status(204).end();
  });

  return router;
}
