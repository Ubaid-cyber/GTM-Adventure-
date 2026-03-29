
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL
});

async function main() {
  try {
    const res = await pool.query('SELECT count(*) FROM "Trek"');
    console.log('Trek count:', res.rows[0].count);
    const res2 = await pool.query('SELECT count(*) FROM "Trek" WHERE "embedding" IS NOT NULL');
    console.log('Trek with embedding count:', res2.rows[0].count);
    
    if (parseInt(res2.rows[0].count) > 0) {
      const res3 = await pool.query('SELECT id, title, array_length(embedding, 1) as dim FROM "Trek" WHERE "embedding" IS NOT NULL LIMIT 5');
      console.log('Sample embeddings:', res3.rows);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

main();
