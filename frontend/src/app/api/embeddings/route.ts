import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { generateEmbedding, buildTrekEmbeddingText } from '@/lib/gemini';

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
  }

  const results: { id: string; title: string; status: string }[] = [];
  const client = await pool.connect();

  try {
    try {
      await client.query('ALTER TABLE "Trek" ADD COLUMN IF NOT EXISTS "embedding" double precision[];');
      results.push({ id: '-', title: 'Schema', status: '✅ Column ready' });
    } catch (e: any) {
      results.push({ id: '-', title: 'Schema', status: `⚠️ ${e.message}` });
    }

    const res = await client.query(
      `SELECT id, title, description, location, "durationDays", difficulty, price, "maxAltitude", "bestSeason", highlights FROM "Trek"`
    );
    const treks = res.rows;

    if (treks.length === 0) {
      return NextResponse.json({ message: 'No treks found. Run /api/seed first.', results });
    }

    for (const trek of treks) {
      try {
        const text = buildTrekEmbeddingText(trek);
        const embedding = await generateEmbedding(text);
        
        // Postgres array format: {0.1, 0.2, ...}
        const pgArray = `{${embedding.join(',')}}`;
        
        await client.query(
          'UPDATE "Trek" SET "embedding" = $1 WHERE "id" = $2',
          [pgArray, trek.id]
        );
        
        results.push({ id: trek.id, title: trek.title, status: `✅ Generated (${embedding.length}D)` });
      } catch (err: any) {
        results.push({ id: trek.id, title: trek.title, status: `❌ ${err.message}` });
      }
    }

    return NextResponse.json({ message: `Processed ${treks.length} treks`, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, results }, { status: 500 });
  } finally {
    client.release();
  }
}
