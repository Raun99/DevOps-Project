import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import runMigrations from './db/migrate.js';
import { seedDatabase } from './db/seed.js';
import register, { metricsMiddleware } from './services/metrics.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());
app.use(metricsMiddleware);

// Serve static frontend assets from Vite build in Docker / production
app.use(express.static(distPath));

// Prometheus Metrics Endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err.message);
  }
});

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CLANDESTINE API Service',
    time: new Date().toISOString(),
    canaryEnabled: true
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// SPA client-side routing fallback: serve index.html for any non-API GET routes
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && req.path !== '/metrics') {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  next();
});

// Error Handling Middleware
app.use((err, req, res, _next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal server error.',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Boot and listen
let serverInstance = null;
async function startServer() {
  try {
    await runMigrations();
    await seedDatabase();

    if (process.env.NODE_ENV !== 'test') {
      serverInstance = app.listen(PORT, () => {
        console.log(`[CLANDESTINE API] Server listening at http://localhost:${PORT}`);
      });
    }
  } catch (err) {
    console.error('❌ Failed to boot Clandestine server:', err);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer, serverInstance };
export default app;
