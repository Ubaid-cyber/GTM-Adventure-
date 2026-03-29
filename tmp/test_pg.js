import { Pool } from 'pg';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DIRECT_DATABASE_URL });

try {
  console.log('Testing PG query...');
  const res = await pool.query('SELECT NOW() as now');
  console.log('PG Success:', res.rows[0].now);
  process.exit(0);
} catch (e) {
  console.error('PG Failed:', e);
  process.exit(1);
}
