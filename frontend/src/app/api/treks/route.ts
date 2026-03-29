import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { generateEmbedding, cosineSimilarity } from '@/lib/gemini';

export async function GET(req: NextRequest) {
  const client = await pool.connect();
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');
    const difficulty = searchParams.get('difficulty');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const minDays = searchParams.get('minDays');
    const maxDays = searchParams.get('maxDays');
    const sort = searchParams.get('sort');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const offset = (page - 1) * limit;

    // ─── Semantic AI Search ───
    if (q && q.trim().length > 0) {
      try {
        const queryEmbedding = await generateEmbedding(q);
        
        // Fetch all treks with embeddings (filtering in memory for demo simplicity)
        // In production, you would use pgvector on Supabase/Neon.
        const res = await client.query(
          'SELECT id, title, description, location, "durationDays", difficulty, price, "maxAltitude", "bestSeason", highlights, "coverImage", embedding FROM "Trek"'
        );
        let treks = res.rows;

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
          .filter(item => item.similarity > 0.6); // Reasonable threshold

        // Sort
        if (sort === 'price_asc') scored.sort((a, b) => a.trek.price - b.trek.price);
        else if (sort === 'price_desc') scored.sort((a, b) => b.trek.price - a.trek.price);
        else scored.sort((a, b) => b.similarity - a.similarity);

        const total = scored.length;
        const paged = scored.slice(offset, offset + limit);

        return NextResponse.json({
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

    const addFilter = (condition: string, value: any) => {
      pCount++;
      query += ` AND ${condition} $${pCount}`;
      dataQuery += ` AND ${condition} $${pCount}`;
      params.push(value);
    };

    if (q) {
      pCount++;
      const searchStr = `%${q}%`;
      query += ` AND (title ILIKE $${pCount} OR description ILIKE $${pCount})`;
      dataQuery += ` AND (title ILIKE $${pCount} OR description ILIKE $${pCount})`;
      params.push(searchStr);
    }
    if (difficulty) addFilter('difficulty =', difficulty);
    if (minPrice) addFilter('price >=', parseFloat(minPrice));
    if (maxPrice) addFilter('price <=', parseFloat(maxPrice));
    if (minDays) addFilter('"durationDays" >=', parseInt(minDays));
    if (maxDays) addFilter('"durationDays" <=', parseInt(maxDays));

    // Sort
    if (sort === 'price_asc') dataQuery += ' ORDER BY price ASC';
    else if (sort === 'price_desc') dataQuery += ' ORDER BY price DESC';
    else dataQuery += ' ORDER BY "createdAt" DESC';

    // Pagination
    dataQuery += ` LIMIT $${pCount + 1} OFFSET $${pCount + 2}`;
    
    const countRes = await client.query(query, params);
    const dataRes = await client.query(dataQuery, [...params, limit, offset]);

    return NextResponse.json({
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
    return NextResponse.json({ error: 'Failed to fetch treks' }, { status: 500 });
  } finally {
    client.release();
  }
}
