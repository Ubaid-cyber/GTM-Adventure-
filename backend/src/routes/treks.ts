import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { generateEmbedding, cosineSimilarity } from '../lib/gemini';

const router = Router();

// ─── GET /api/treks ───────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { q, difficulty, minPrice, maxPrice, minDays, maxDays, sort } = req.query as Record<string, string>;
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '9');
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (difficulty) whereClause.difficulty = difficulty;
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = parseFloat(minPrice);
      if (maxPrice) whereClause.price.lte = parseFloat(maxPrice);
    }
    if (minDays || maxDays) {
      whereClause.durationDays = {};
      if (minDays) whereClause.durationDays.gte = parseInt(minDays);
      if (maxDays) whereClause.durationDays.lte = parseInt(maxDays);
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'duration_asc') orderBy = { durationDays: 'asc' };
    else if (sort === 'duration_desc') orderBy = { durationDays: 'desc' };

    // ─── Semantic AI Search ───
    if (q && q.trim().length > 0) {
      try {
        const queryEmbedding = await generateEmbedding(q);
        const allTreksRaw: any[] = await prisma.$queryRawUnsafe(
          `SELECT id, title, description, location, "durationDays", difficulty, price, "maxAltitude", "bestSeason", highlights, "coverImage", embedding, "createdAt", "updatedAt" FROM "Trek"`
        );

        let filtered = allTreksRaw;
        if (difficulty) filtered = filtered.filter((t: any) => t.difficulty === difficulty);
        if (minPrice) filtered = filtered.filter((t: any) => t.price >= parseFloat(minPrice));
        if (maxPrice) filtered = filtered.filter((t: any) => t.price <= parseFloat(maxPrice));
        if (minDays) filtered = filtered.filter((t: any) => t.durationDays >= parseInt(minDays));
        if (maxDays) filtered = filtered.filter((t: any) => t.durationDays <= parseInt(maxDays));

        const scored = filtered
          .map((trek: any) => {
            const embedding = trek.embedding as number[] | null;
            const similarity = embedding && embedding.length > 0 ? cosineSimilarity(queryEmbedding, embedding) : 0;
            return { trek, similarity };
          })
          .filter((item: any) => item.similarity > 0);

        if (sort === 'price_asc') scored.sort((a: any, b: any) => a.trek.price - b.trek.price);
        else if (sort === 'price_desc') scored.sort((a: any, b: any) => b.trek.price - a.trek.price);
        else scored.sort((a: any, b: any) => b.similarity - a.similarity);

        if (scored.length > 0) {
          const total = scored.length;
          const paged = scored.slice(skip, skip + limit);
          res.json({
            treks: paged.map(({ trek, similarity }: any) => {
              const { embedding, ...rest } = trek;
              return { ...rest, _relevance: Math.round(similarity * 100) };
            }),
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
            searchMode: 'semantic',
          });
          return;
        }
      } catch (e: any) {
        console.log('Semantic search failed, falling back to keyword:', e.message);
      }

      whereClause.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [treks, total] = await Promise.all([
      prisma.trek.findMany({ where: whereClause, orderBy, skip, take: limit }),
      prisma.trek.count({ where: whereClause })
    ]);

    res.json({
      treks: treks.map((t: any) => { const { embedding, ...rest } = t; return rest; }),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      searchMode: q ? 'keyword' : 'browse',
    });
  } catch (error: any) {
    console.error('Error fetching treks:', error);
    res.status(500).json({ error: 'Failed to fetch treks' });
  }
});

// ─── GET /api/treks/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const trek = await prisma.trek.findUnique({ where: { id: req.params.id } });
    if (!trek) { res.status(404).json({ error: 'Trek not found' }); return; }
    const { embedding, ...rest } = trek as any;
    res.json(rest);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch trek' });
  }
});

export default router;
