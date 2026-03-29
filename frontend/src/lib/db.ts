import { Pool } from 'pg';

const getPgConnectionString = () => {
  if (process.env.DIRECT_DATABASE_URL) return process.env.DIRECT_DATABASE_URL;
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  return null;
}

const connectionString = getPgConnectionString();

if (!connectionString) {
  console.error('[DB] CRITICAL: No connection string found in .env');
}

// Global pool to prevent connection leaks during hot reloading in Next.js
const globalForPool = global as unknown as { pool: Pool | undefined };

export const pool = globalForPool.pool ?? new Pool({ 
  connectionString: connectionString || '',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: connectionString?.includes('supabase') || connectionString?.includes('neon') ? { rejectUnauthorized: false } : undefined
});

if (process.env.NODE_ENV !== 'production') {
  globalForPool.pool = pool;
}
