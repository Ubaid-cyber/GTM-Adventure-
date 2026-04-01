import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
});

async function main() {
  console.log('\n--- 🛡️ GTM-Adventure: AI Vector Schema Migration ---\n');
  try {
    const client = await (pool as any).connect();
    await client.query(`
      ALTER TABLE "Trek" 
      ADD COLUMN IF NOT EXISTS "embedding" DOUBLE PRECISION[]
    `);
    console.log('  ✅ Trek embeddings column verified/created.');
    client.release();
  } catch (err: any) {
    console.error('  ❌ Migration Error:', err.message);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await (pool as any).end();
    console.log('\n--- 🚀 Migration Completed ---\n');
  });
