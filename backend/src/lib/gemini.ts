import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generates a 768-dimensional embedding vector using Google Gemini.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Builds a rich descriptive string for high-quality trek embeddings.
 */
export function buildTrekEmbeddingText(trek: {
  title: string;
  description: string;
  difficulty: string;
  location: string;
  durationDays: number;
  maxAltitude?: number | null;
  highlights?: string[];
  bestSeason?: string | null;
}): string {
  const parts = [
    trek.title,
    trek.description,
    `Difficulty: ${trek.difficulty}`,
    `Location: ${trek.location}`,
    `Duration: ${trek.durationDays} days`,
  ];
  if (trek.maxAltitude) parts.push(`Max Altitude: ${trek.maxAltitude}m`);
  if (trek.bestSeason) parts.push(`Best Season: ${trek.bestSeason}`);
  if (trek.highlights?.length) parts.push(`Highlights: ${trek.highlights.join(', ')}`);
  return parts.join('. ');
}

/**
 * Computes cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}
