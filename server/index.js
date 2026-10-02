import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import postRoutes from './routes/postRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import runMigrations from './db/migrate.js';
import { seedDatabase } from './db/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json());

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'CLANDESTINE Archive Core API',
    time: new Date().toISOString(),
    canaryEnabled: true
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal server error in the archives.',
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
        console.log(`🏰 [CLANDESTINE API] Realm listening at http://localhost:${PORT}`);
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
