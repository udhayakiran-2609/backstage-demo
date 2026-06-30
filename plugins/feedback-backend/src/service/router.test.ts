import express from 'express';
import request from 'supertest';
import { createRouter } from '../service/router';
import { InMemoryFeedbackStore } from '../service/InMemoryFeedbackStore';

describe('createRouter', () => {
  let app: express.Express;

  beforeEach(async () => {
    const store = new InMemoryFeedbackStore();
    const router = await createRouter({
      store,
      getUserRef: async () => 'user:default/test-user',
    });
    app = express().use(router);
  });

  it('creates and fetches general feedback', async () => {
    const createRes = await request(app)
      .post('/feedback')
      .send({ type: 'general', rating: 5, comment: 'Loving Backstage!' });

    expect(createRes.status).toBe(201);
    expect(createRes.body).toMatchObject({
      type: 'general',
      rating: 5,
      comment: 'Loving Backstage!',
      status: 'open',
      createdBy: 'user:default/test-user',
    });

    const getRes = await request(app).get(`/feedback/${createRes.body.id}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(createRes.body.id);
  });

  it('requires entityRef for entity-type feedback', async () => {
    const res = await request(app)
      .post('/feedback')
      .send({ type: 'entity', rating: 3 });
    expect(res.status).toBe(400);
  });

  it('rejects feedback with neither rating nor comment', async () => {
    const res = await request(app).post('/feedback').send({ type: 'general' });
    expect(res.status).toBe(400);
  });

  it('lists feedback filtered by entityRef', async () => {
    await request(app)
      .post('/feedback')
      .send({ type: 'entity', entityRef: 'component:default/foo', rating: 4 });
    await request(app)
      .post('/feedback')
      .send({ type: 'entity', entityRef: 'component:default/bar', rating: 2 });

    const res = await request(app).get('/feedback').query({ entityRef: 'component:default/foo' });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].entityRef).toBe('component:default/foo');
  });

  it('updates feedback status', async () => {
    const created = await request(app)
      .post('/feedback')
      .send({ type: 'general', comment: 'Bug: sidebar flickers' });

    const updated = await request(app)
      .patch(`/feedback/${created.body.id}`)
      .send({ status: 'resolved' });

    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe('resolved');
  });

  it('returns 404 for unknown feedback id', async () => {
    const res = await request(app).get('/feedback/does-not-exist');
    expect(res.status).toBe(404);
  });

  it('deletes feedback', async () => {
    const created = await request(app)
      .post('/feedback')
      .send({ type: 'general', rating: 1 });

    const del = await request(app).delete(`/feedback/${created.body.id}`);
    expect(del.status).toBe(204);

    const get = await request(app).get(`/feedback/${created.body.id}`);
    expect(get.status).toBe(404);
  });
});
