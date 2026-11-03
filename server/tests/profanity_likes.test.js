import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { seedDatabase } from '../db/seed.js';
import { query } from '../db/index.js';

describe('Profanity Filtering & Like-Count Synchronization Suite', () => {
  let tokenA = '';
  let tokenB = '';
  let cleanPostId = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await seedDatabase();

    // Login as Person A
    const resA = await request(app)
      .post('/api/auth/login')
      .send({ email: 'persona@clandestine.internal', password: 'password123' });
    expect(resA.status).toBe(200);
    tokenA = resA.body.token;

    // Login as Person B
    const resB = await request(app)
      .post('/api/auth/login')
      .send({ email: 'personb@clandestine.internal', password: 'password123' });
    expect(resB.status).toBe(200);
    tokenB = resB.body.token;

    // Create a clean post for testing likes and comments
    const postRes = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        title: 'Architectural Musings on Stone and Light',
        subtitle: 'A study of gothic arches and ambient illumination.',
        content: 'Light cascades through stained glass, illuminating ancient flagstones with colored brilliance.',
        category_id: 'cat-cathedral'
      });
    expect(postRes.status).toBe(201);
    cleanPostId = postRes.body.post.id;
  });

  describe('1. Profanity Filter: Posts', () => {
    it('blocks post creation when title contains profane language', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'This is fucking unacceptable',
          subtitle: 'Clean subtitle',
          content: 'Clean content about architecture and design.'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Post title contains prohibited language');
    });

    it('blocks post creation when subtitle contains profane language', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Clean Title Here',
          subtitle: 'This subtitle has bullshit in it',
          content: 'Clean content about masonry and sacred geometry.'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Post subtitle contains prohibited language');
    });

    it('blocks post creation when content contains profane language', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Philosophical Treatise',
          subtitle: 'Clean subtitle',
          content: 'Here is some text with an asshole comment in the middle.'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Post content contains prohibited language');
    });

    it('blocks post creation with obfuscated leetspeak profanity (f*ck / sh!t)', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Clean Title',
          subtitle: 'Clean subtitle',
          content: 'Trying to evade with f u c k and sh!t words.'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('prohibited language');
    });

    it('blocks post editing when update contains profanity', async () => {
      const res = await request(app)
        .put(`/api/posts/${cleanPostId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          content: 'Edited content containing bullshit.'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('prohibited language');
    });

    it('allows clean scholarly post through without false positives', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Classical Architecture and Documented Passages',
          subtitle: 'An analysis of acoustic bass resonance in the grand hall.',
          content: 'Studying classic design, masonry classification, and acoustic assets without any issues.'
        });

      expect(res.status).toBe(201);
      expect(res.body.post.title).toBe('Classical Architecture and Documented Passages');
    });
  });

  describe('2. Profanity Filter: Comments & Threaded Replies', () => {
    it('blocks root comment containing profanity', async () => {
      const res = await request(app)
        .post(`/api/comments/post/${cleanPostId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          content: 'What kind of fucking article is this?'
        });

      expect(res.status).toBe(400);
      expect(res.body.reason).toContain('profane language');
    });

    it('blocks threaded reply containing profanity', async () => {
      // First create a clean root comment
      const rootRes = await request(app)
        .post(`/api/comments/post/${cleanPostId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({
          content: 'A thoughtful inquiry regarding the vault acoustics.'
        });
      expect(rootRes.status).toBe(201);
      const rootId = rootRes.body.comment.id;

      // Reply with profanity
      const replyRes = await request(app)
        .post(`/api/comments/post/${cleanPostId}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          content: 'You are a complete bitch for asking that.',
          parent_id: rootId
        });

      expect(replyRes.status).toBe(400);
      expect(replyRes.body.reason).toContain('profane language');
    });
  });

  describe('3. PostgreSQL Like-Count Synchronization', () => {
    it('increments likes_count and returns correct count when a post is liked', async () => {
      const res = await request(app)
        .post(`/api/posts/${cleanPostId}/like`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.liked).toBe(true);
      expect(res.body.likes_count).toBe(1);

      // Verify database reflects the like count directly in posts table
      const postCheck = await query('SELECT likes_count FROM posts WHERE id = $1', [cleanPostId]);
      expect(Number(postCheck.rows[0].likes_count)).toBe(1);
    });

    it('decrements likes_count and returns correct count when like is toggled off', async () => {
      const res = await request(app)
        .post(`/api/posts/${cleanPostId}/like`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect(res.status).toBe(200);
      expect(res.body.liked).toBe(false);
      expect(res.body.likes_count).toBe(0);

      const postCheck = await query('SELECT likes_count FROM posts WHERE id = $1', [cleanPostId]);
      expect(Number(postCheck.rows[0].likes_count)).toBe(0);
    });

    it('prevents duplicate likes and accurately accumulates counts from multiple users', async () => {
      // Person A likes
      const resA = await request(app)
        .post(`/api/posts/${cleanPostId}/like`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(resA.body.liked).toBe(true);
      expect(resA.body.likes_count).toBe(1);

      // Person B likes
      const resB = await request(app)
        .post(`/api/posts/${cleanPostId}/like`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(resB.body.liked).toBe(true);
      expect(resB.body.likes_count).toBe(2);

      // Verify posts table has likes_count = 2
      const postCheck = await query('SELECT likes_count FROM posts WHERE id = $1', [cleanPostId]);
      expect(Number(postCheck.rows[0].likes_count)).toBe(2);

      // Person A unlikes -> count becomes 1
      const resA2 = await request(app)
        .post(`/api/posts/${cleanPostId}/like`)
        .set('Authorization', `Bearer ${tokenA}`);
      expect(resA2.body.liked).toBe(false);
      expect(resA2.body.likes_count).toBe(1);

      // Likes count never drops below 0
      const resB2 = await request(app)
        .post(`/api/posts/${cleanPostId}/like`)
        .set('Authorization', `Bearer ${tokenB}`);
      expect(resB2.body.liked).toBe(false);
      expect(resB2.body.likes_count).toBe(0);
    });
  });
});
