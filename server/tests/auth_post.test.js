import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { seedDatabase } from '../db/seed.js';

describe('CLANDESTINE API Suite: Auth, Posts, Authorization & Comments', () => {
  let tokenA = '';
  let tokenB = '';
  let testPostId = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedDatabase();

    // Login as Person A (seeded user)
    const resA = await request(app)
      .post('/api/auth/login')
      .send({ email: 'persona@clandestine.internal', password: 'password123' });
    expect(resA.status).toBe(200);
    tokenA = resA.body.token;

    // Login as Person B (seeded user)
    const resB = await request(app)
      .post('/api/auth/login')
      .send({ email: 'personb@clandestine.internal', password: 'password123' });
    expect(resB.status).toBe(200);
    tokenB = resB.body.token;
  });

  describe('Authentication & Profile', () => {
    it('registers a new author successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'Person C',
          email: 'personc@clandestine.internal',
          password: 'secretPassword456',
          bio: 'Contributing researcher and writer.'
        });
      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.username).toBe('Person C');
    });

    it('rejects registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'Person C Duplicate',
          email: 'persona@clandestine.internal',
          password: 'password123'
        });
      expect(res.status).toBe(409);
    });

    it('retrieves authenticated profile via /api/auth/me', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe('persona@clandestine.internal');
    });
  });

  describe('Post CRUD & Backend Authorization Enforcement', () => {
    it('prevents unauthenticated manuscript publication', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({
          title: 'Unauthorized Treatise',
          content: 'This should fail without token.'
        });
      expect(res.status).toBe(401);
    });

    it('allows authenticated scholar to publish a post', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Chronicles of the High Spire',
          subtitle: 'A meditation on architectural vantage points.',
          content: 'The heights of the castle afford a view of the floating islands rarely seen by lower ground dwellers.',
          category_id: 'cat-astronomy',
          tags: ['Architecture', 'Observatory']
        });
      expect(res.status).toBe(201);
      expect(res.body.post.id).toBeDefined();
      expect(res.body.post.title).toBe('Chronicles of the High Spire');
      testPostId = res.body.post.id;
    });

    it('enforces backend authorization: Person B CANNOT edit Person A’s post', async () => {
      const res = await request(app)
        .put(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          title: 'Malicious Overwrite Attempt',
          content: 'Person B should not be permitted to modify Person A’s post.'
        });
      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Forbidden');
    });

    it('allows author (Person A) to edit their own post', async () => {
      const res = await request(app)
        .put(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Chronicles of the High Spire (Revised Edition)',
          subtitle: 'An expanded study on celestial acoustics.'
        });
      expect(res.status).toBe(200);
      expect(res.body.post.title).toBe('Chronicles of the High Spire (Revised Edition)');
    });

    it('enforces backend authorization: Person B CANNOT delete Person A’s post', async () => {
      const res = await request(app)
        .delete(`/api/posts/${testPostId}`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(res.status).toBe(403);
    });
  });

  describe('Comment Moderation & Canary Delivery', () => {
    it('blocks comment containing prohibited words via Moderation Service', async () => {
      const res = await request(app)
        .post(`/api/comments/post/${testPostId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          content: 'This post is pure spam and should be expunged.'
        });
      expect(res.status).toBe(400);
      expect(res.body.reason).toContain('prohibited term: "spam"');
    });

    it('allows clean scholarly comment to be inscribed', async () => {
      const res = await request(app)
        .post(`/api/comments/post/${testPostId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          content: 'A thoughtful perspective on the northern parapets. Have you accounted for wind velocity?'
        });
      expect(res.status).toBe(201);
      expect(res.body.comment.content).toContain('wind velocity');
    });

    it('serves v2 Canary hierarchical comments when header is requested', async () => {
      const res = await request(app)
        .get(`/api/comments/post/${testPostId}`)
        .set('x-canary-channel', 'v2');
      expect(res.status).toBe(200);
      expect(res.body.canary.active).toBe(true);
      expect(res.body.version).toBe('v2-canary');
      expect(Array.isArray(res.body.comments)).toBe(true);
    });
  });
});
