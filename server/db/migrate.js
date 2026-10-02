import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool, isUsingFallback } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  console.log('🏛️  [CLANDESTINE Migrations] Starting migration process...');

  const migrationFile = path.join(__dirname, 'migrations', '001_init.sql');
  const sql = fs.readFileSync(migrationFile, 'utf8');

  if (pool && !isUsingFallback()) {
    try {
      const client = await pool.connect();
      try {
        console.log('⚡ Executing 001_init.sql on PostgreSQL database...');
        await client.query(sql);
        console.log('✅ PostgreSQL database schema successfully migrated.');
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('⚠️  Could not apply migration to PostgreSQL (will use fallback store if needed):', err.message);
    }
  } else {
    console.log('ℹ️  In-memory schema initialized for local dev/testing environment.');
  }

  console.log('🎉 Migration check complete.');
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}

export default runMigrations;
