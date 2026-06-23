import Router from 'express-promise-router';
import express, { Request, Response, NextFunction } from 'express';
import { BannerDatabase, BannerInput } from './BannerDatabase';

export function createBannersRouter(db: BannerDatabase) {
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
      res.status(404).json({ error: 'Banner not found' });
      return;
    }
    res.json({ banner });
  });
  router.post('/', async (req: Request, res: Response) => {
    const input = req.body as BannerInput;
    if (!input?.title || !input?.message || !input?.activeFrom || !input?.activeTo) {
      res.status(400).json({ error: 'title, message, activeFrom, activeTo are required' });
      return;
    }
    const banner = await db.create(input);
    res.status(201).json({ banner });
  });
  router.put('/:id', async (req: Request, res: Response) => {
    const existing = await db.getById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Banner not found' });
      return;
    }
    const banner = await db.update(req.params.id, req.body as Partial<BannerInput>);
    res.json({ banner });
  });
  router.patch('/:id/toggle', async (req: Request, res: Response) => {
    const existing = await db.getById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Banner not found' });
      return;
    }
    const banner = await db.update(req.params.id, { enabled: !existing.enabled });
    res.json({ banner });
  });
  router.delete('/:id', async (req: Request, res: Response) => {
    const existing = await db.getById(req.params.id);
    if (!existing) {
      res.status(404).json({ error: 'Banner not found' });
      return;
    }
    await db.delete(req.params.id);
    res.status(204).send();
  });
  router.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({ error: err.message });
  });
  return router;
}