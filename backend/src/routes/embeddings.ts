import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateEmbedding, buildTrekEmbeddingText } from '../lib/gemini';

const router = Router();

// ─── POST /api/embeddings — Generate AI embeddings for all treks ───────────────
router.post('/', async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Not allowed in production' });
    return;
  }

  const results: { id: string; title: string; status: string }[] = [];

  try {
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "Trek" ADD COLUMN IF NOT EXISTS "embedding" double precision[];`
      );
      results.push({ id: '-', title: 'Schema', status: '✅ Column ready' });
    } catch (e: any) {
      results.push({ id: '-', title: 'Schema', status: `⚠️ ${e.message}` });
    }

    const treks: any[] = await prisma.$queryRawUnsafe(
      `SELECT id, title, description, location, "durationDays", difficulty, price, "maxAltitude", "bestSeason", highlights FROM "Trek"`
    );

    if (treks.length === 0) {
      res.json({ message: 'No treks found. Run /api/seed first.', results });
      return;
    }

    for (const trek of treks) {
      try {
        const text = buildTrekEmbeddingText(trek);
        const embedding = await generateEmbedding(text);
        const pgArray = `{${embedding.join(',')}}`;
        const updateResult = await prisma.$executeRawUnsafe(
          `UPDATE "Trek" SET "embedding" = $1::double precision[] WHERE "id" = $2`,
          pgArray, trek.id
        );
        results.push({ id: trek.id, title: trek.title, status: `✅ Generated (${embedding.length}D)` });
      } catch (err: any) {
        results.push({ id: trek.id, title: trek.title, status: `❌ ${err.message}` });
      }
    }

    res.json({ message: `Processed ${treks.length} treks`, results });
  } catch (error: any) {
    res.status(500).json({ error: error.message, results });
  }
});

export default router;
