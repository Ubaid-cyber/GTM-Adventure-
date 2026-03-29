import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const connectionString = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

export const pool = new Pool({ 
  connectionString: connectionString || '',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  ssl: connectionString?.includes('supabase') || connectionString?.includes('neon') ? { rejectUnauthorized: false } : undefined
});
