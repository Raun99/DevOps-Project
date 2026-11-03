import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { recordPostCreated, recordCommentCreated } from '../services/metrics.js';

describe('Prometheus Metrics Service & /metrics Endpoint', () => {
  beforeAll(async () => {
    // Generate some traffic to exercise metrics
    await request(app).get('/api/health');
  });

  it('GET /metrics returns 200 with Prometheus text format', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toContain('clandestine_http_requests_total');
    expect(res.text).toContain('clandestine_http_request_duration_seconds');
  });

  it('records HTTP request metrics with method, route, and status_code', async () => {
    await request(app).get('/api/health');
    const res = await request(app).get('/metrics');
    expect(res.text).toMatch(/clandestine_http_requests_total\{method="GET",route="\/api\/health",status_code="200"\}/);
  });

  it('records post and comment creation activity counters', async () => {
    recordPostCreated('cat-observatory');
    recordCommentCreated(false);
    recordCommentCreated(true);

    const res = await request(app).get('/metrics');
    expect(res.text).toContain('clandestine_posts_created_total{category="cat-observatory"}');
    expect(res.text).toContain('clandestine_comments_created_total{type="root"}');
    expect(res.text).toContain('clandestine_comments_created_total{type="reply"}');
  });
});
