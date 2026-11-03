import client from 'prom-client';

// Create a dedicated Registry
const register = new client.Registry();

// Add default recommended metrics (CPU, Memory, Event Loop, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'clandestine_'
});

// HTTP Request Total Counter
export const httpRequestCounter = new client.Counter({
  name: 'clandestine_http_requests_total',
  help: 'Total number of HTTP requests processed by CLANDESTINE API',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// HTTP Request Duration Histogram
export const httpRequestDuration = new client.Histogram({
  name: 'clandestine_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register]
});

// Post Creation Activity Counter
export const postCreatedCounter = new client.Counter({
  name: 'clandestine_posts_created_total',
  help: 'Total number of posts created on CLANDESTINE',
  labelNames: ['category'],
  registers: [register]
});

// Comment Creation Activity Counter
export const commentCreatedCounter = new client.Counter({
  name: 'clandestine_comments_created_total',
  help: 'Total number of comments submitted on CLANDESTINE',
  labelNames: ['type'], // 'root' or 'reply'
  registers: [register]
});

/**
 * Normalizes request paths to avoid high-cardinality label pollution
 */
export function normalizePath(req) {
  if (req.baseUrl || req.route) {
    const base = req.baseUrl || '';
    const sub = req.route ? req.route.path : '';
    const combined = `${base}${sub}`;
    if (combined && combined !== '/') return combined;
  }
  
  // Fallback regex normalization for dynamic parameter IDs
  return (req.originalUrl || req.path || '/')
    .split('?')[0]
    .replace(/\/api\/comments\/post\/[a-zA-Z0-9_-]+/g, '/api/comments/post/:postId')
    .replace(/\/api\/posts\/[a-zA-Z0-9_-]+/g, '/api/posts/:id')
    .replace(/\/api\/users\/[a-zA-Z0-9_-]+/g, '/api/users/:id');
}

/**
 * Express middleware to record Prometheus metrics for incoming requests
 */
export function metricsMiddleware(req, res, next) {
  // Skip metrics endpoint itself to avoid self-scrape skew
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    const route = normalizePath(req);
    const statusCode = res.statusCode ? res.statusCode.toString() : '500';

    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: statusCode
    });

    httpRequestDuration.observe({
      method: req.method,
      route,
      status_code: statusCode
    }, durationInSeconds);
  });

  next();
}

/**
 * Helper to record post creation
 */
export function recordPostCreated(category = 'general') {
  postCreatedCounter.inc({ category });
}

/**
 * Helper to record comment creation
 */
export function recordCommentCreated(isReply = false) {
  commentCreatedCounter.inc({ type: isReply ? 'reply' : 'root' });
}

export { register };
export default register;
