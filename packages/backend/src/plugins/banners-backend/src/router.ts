import express, { Request, Response, NextFunction } from 'express';
import Router from 'express-promise-router';
import { LoggerService } from '@backstage/backend-plugin-api';
import { BannerDatabase, BannerInput } from './BannerDatabase';

export async function createRouter(options: {
  db: BannerDatabase;
  logger: LoggerService;
}): Promise<express.Router> {
  const { db, logger } = options;

  const router = Router();
  router.use(express.json());

  router.get('/', async (_req: Request, res: Response) => {
    const banners = await db.getAll();
    res.json({ banners });
  });

  router.get('/active', async (_req: Request, res: Response) => {
    const banners = await db.getActive();
    res.json({ banners });
  });

  router.get('/:id', async (req: Request, res: Response) => {
    const banner = await db.getById(req.params.id);

    if (!banner) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({ banner });
  });

  router.post('/', async (req: Request, res: Response) => {
    const input = req.body as BannerInput;

    if (
      !input?.title ||
      !input?.message ||
      !input?.activeFrom ||
      !input?.activeTo
    ) {
      return res.status(400).json({
        error: 'title, message, activeFrom, activeTo are required',
      });
    }

    const banner = await db.create(input);
    res.status(201).json({ banner });
  });

  router.put('/:id', async (req: Request, res: Response) => {
    const existing = await db.getById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    const banner = await db.update(
      req.params.id,
      req.body as Partial<BannerInput>,
    );

    res.json({ banner });
  });

  router.patch('/:id/toggle', async (req: Request, res: Response) => {
    const existing = await db.getById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    const banner = await db.update(req.params.id, {
      enabled: !existing.enabled,
    });

    res.json({ banner });
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    const existing = await db.getById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    await db.delete(req.params.id);

    res.status(204).send();
  });

  router.use(
    (
      err: Error,
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      logger.error(err.message);
      res.status(500).json({ error: err.message });
    },
  );

  return router;
}