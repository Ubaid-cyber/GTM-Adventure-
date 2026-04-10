'use server';

import { prisma } from '@/lib/prisma';
import { generateEmbedding, cosineSimilarity } from '@/lib/gemini';

export async function getTreksAction(params: {
  q?: string;
  difficulty?: string;
  minPrice?: string;
  maxPrice?: string;
  minDays?: string;
  maxDays?: string;
  sort?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const { 
      q, difficulty, minPrice, maxPrice, minDays, maxDays, 
      sort, page = 1, limit = 9 
    } = params;
    const offset = (page - 1) * limit;

    // ─── Semantic AI Search ───
    if (q && q.trim().length > 0) {
      try {
        const queryEmbedding = await generateEmbedding(q);
        
        // Fetch all treks with embeddings
        const treks = await prisma.trek.findMany({
          where: {
            AND: [
              difficulty ? { difficulty } : {},
              minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
              maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
              minDays ? { durationDays: { gte: parseInt(minDays) } } : {},
              maxDays ? { durationDays: { lte: parseInt(maxDays) } } : {},
            ]
          }
        });

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

        return {
          treks: paged.map(({ trek, similarity }) => {
            const { embedding, ...rest } = trek;
            return { ...rest, _relevance: Math.round(similarity * 100) };
          }),
          pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
          searchMode: 'semantic',
        };
      } catch (e: any) {
        console.warn('Semantic search failed, falling back to keyword:', e.message);
      }
    }

    // ─── Traditional Filtered Browse ───
    const where: any = {
      AND: [
        q ? {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
          ]
        } : {},
        difficulty ? { difficulty } : {},
        minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
        maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
        minDays ? { durationDays: { gte: parseInt(minDays) } } : {},
        maxDays ? { durationDays: { lte: parseInt(maxDays) } } : {},
      ]
    };

    const orderBy: any = {};
    if (sort === 'price_asc') orderBy.price = 'asc';
    else if (sort === 'price_desc') orderBy.price = 'desc';
    else orderBy.createdAt = 'desc';

    const [total, treks] = await Promise.all([
      prisma.trek.count({ where }),
      prisma.trek.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          durationDays: true,
          difficulty: true,
          price: true,
          maxAltitude: true,
          bestSeason: true,
          highlights: true,
          coverImage: true,
          slug: true
        }
      })
    ]);

    return {
      treks,
      pagination: { 
        total, 
        page, 
        limit, 
        totalPages: Math.ceil(total / limit) 
      },
      searchMode: q ? 'keyword' : 'browse',
    };

  } catch (error: any) {
    console.error('getTreksAction Error:', error);
    throw new Error('Failed to fetch treks');
  }
}

export async function getTrekAction(slugOrId: string) {
  try {
    // Single query: match by slug OR id for backward compatibility
    const trek = await prisma.trek.findFirst({
      where: {
        OR: [
          { slug: slugOrId },
          { id: slugOrId }
        ]
      }
    });
    
    if (!trek) return { success: false, error: 'Trek not found' };
    
    return { success: true, trek };
  } catch (error: any) {
    console.error('getTrekAction Error:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}
