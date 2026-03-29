import { Router } from 'express';
import { pool } from '../lib/db.js';
import { prisma } from '../lib/prisma.js';
import { generateEmbedding, cosineSimilarity } from '../lib/gemini.js';

const router = Router();

// GET /api/treks
router.get('/', async (req, res) => {
  const client = await pool.connect();
  try {
    const q = req.query.q as string;
    const difficulty = req.query.difficulty as string;
    const minPrice = req.query.minPrice as string;
    const maxPrice = req.query.maxPrice as string;
    const minDays = req.query.minDays as string;
    const maxDays = req.query.maxDays as string;
    const sort = req.query.sort as string;
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '9');
    const offset = (page - 1) * limit;

    // ─── Semantic AI Search ───
    if (q && q.trim().length > 0) {
      try {
        const queryEmbedding = await generateEmbedding(q);
        
        const treksRes = await client.query(
          'SELECT id, title, description, location, "durationDays", difficulty, price, "maxAltitude", "bestSeason", highlights, "coverImage", embedding FROM "Trek"'
        );
        let treks = treksRes.rows;

        // Apply filters
        if (difficulty) treks = treks.filter(t => t.difficulty === difficulty);
        if (minPrice) treks = treks.filter(t => t.price >= parseFloat(minPrice));
        if (maxPrice) treks = treks.filter(t => t.price <= parseFloat(maxPrice));
        if (minDays) treks = treks.filter(t => t.durationDays >= parseInt(minDays));
        if (maxDays) treks = treks.filter(t => t.durationDays <= parseInt(maxDays));

        // Score similarity
        const scored = treks
          .map(trek => {
            const similarity = trek.embedding && trek.embedding.length > 0 ? cosineSimilarity(queryEmbedding, trek.embedding) : 0;
            return { trek, similarity };
          })
          .filter(item => item.similarity > 0.6);

        // Sort
        if (sort === 'price_asc') scored.sort((a, b) => a.trek.price - b.trek.price);
        else if (sort === 'price_desc') scored.sort((a, b) => b.trek.price - a.trek.price);
        else scored.sort((a, b) => b.similarity - a.similarity);

        const total = scored.length;
        const paged = scored.slice(offset, offset + limit);

        return res.json({
          treks: paged.map(({ trek, similarity }) => {
            const { embedding, ...rest } = trek;
            return { ...rest, _relevance: Math.round(similarity * 100) };
          }),
          pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
          searchMode: 'semantic',
        });
      } catch (e: any) {
        console.warn('Semantic search failed, falling back to keyword:', e.message);
      }
    }

    // ─── Traditional Keyword Search / Browse ───
    let query = 'SELECT COUNT(*) FROM "Trek" WHERE 1=1';
    let dataQuery = 'SELECT id, title, description, location, "durationDays", difficulty, price, "maxAltitude", "bestSeason", highlights, "coverImage" FROM "Trek" WHERE 1=1';
    const params: any[] = [];
    let pCount = 0;

    if (q) {
      pCount++;
      const searchStr = `%${q}%`;
      query += ` AND (title ILIKE $${pCount} OR description ILIKE $${pCount})`;
      dataQuery += ` AND (title ILIKE $${pCount} OR description ILIKE $${pCount})`;
      params.push(searchStr);
    }
    if (difficulty) { pCount++; query += ` AND difficulty = $${pCount}`; dataQuery += ` AND difficulty = $${pCount}`; params.push(difficulty); }
    if (minPrice) { pCount++; query += ` AND price >= $${pCount}`; dataQuery += ` AND price >= $${pCount}`; params.push(parseFloat(minPrice)); }
    if (maxPrice) { pCount++; query += ` AND price <= $${pCount}`; dataQuery += ` AND price <= $${pCount}`; params.push(parseFloat(maxPrice)); }
    if (minDays) { pCount++; query += ` AND "durationDays" >= $${pCount}`; dataQuery += ` AND "durationDays" >= $${pCount}`; params.push(parseInt(minDays)); }
    if (maxDays) { pCount++; query += ` AND "durationDays" <= $${pCount}`; dataQuery += ` AND "durationDays" <= $${pCount}`; params.push(parseInt(maxDays)); }

    // Sort
    if (sort === 'price_asc') dataQuery += ' ORDER BY price ASC';
    else if (sort === 'price_desc') dataQuery += ' ORDER BY price DESC';
    else dataQuery += ' ORDER BY "createdAt" DESC';

    // Pagination
    dataQuery += ` LIMIT $${pCount + 1} OFFSET $${pCount + 2}`;
    
    const countRes = await client.query(query, params);
    const dataRes = await client.query(dataQuery, [...params, limit, offset]);

    return res.json({
      treks: dataRes.rows,
      pagination: { 
        total: parseInt(countRes.rows[0].count), 
        page, limit, 
        totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit) 
      },
      searchMode: q ? 'keyword' : 'browse',
    });

  } catch (error: any) {
    console.error('Error fetching treks:', error);
    res.status(500).json({ error: 'Failed to fetch treks' });
  } finally {
    client.release();
  }
});

// GET /api/treks/:id
router.get('/:id', async (req, res) => {
  try {
    const trek = await prisma.trek.findUnique({
      where: { id: req.params.id }
    });
    if (!trek) return res.status(404).json({ error: 'Trek not found' });
    res.json(trek);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
