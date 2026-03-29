import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SEED_TREKS = [
  {
    title: 'Everest Base Camp Trek',
    description: 'The ultimate Himalayan pilgrimage. A classic 14-day trek to the base of the world\'s highest peak through the heart of Sherpa culture, ancient monasteries, and jaw-dropping glaciers.',
    location: 'Khumbu, Nepal',
    durationDays: 14,
    difficulty: 'HARD',
    price: 1500.0,
    maxAltitude: 5364,
    bestSeason: 'Spring (Mar-May) or Autumn (Sep-Nov)',
    highlights: ['Everest Base Camp', 'Kala Patthar', 'Namche Bazaar', 'Tengboche Monastery'],
    coverImage: 'https://images.unsplash.com/photo-1544257134-8b61c16260a9?q=80&w=800',
    availableSpots: 12, maxCapacity: 15,
  },
  {
    title: 'Annapurna Circuit',
    description: 'One of the most diverse treks on Earth. Cross the legendary Thorong La Pass at 5416m, traverse subtropical jungle, ancient temples, and barren high-altitude desert all in one journey.',
    location: 'Annapurna Region, Nepal',
    durationDays: 16,
    difficulty: 'HARD',
    price: 1200.0,
    maxAltitude: 5416,
    bestSeason: 'Spring or Autumn',
    highlights: ['Thorong La Pass', 'Tilicho Lake', 'Poon Hill', 'Muktinath Temple'],
    coverImage: 'https://images.unsplash.com/photo-1598425237699-1bd125f17dcb?q=80&w=800',
    availableSpots: 10, maxCapacity: 12,
  },
  {
    title: 'Ghorepani Poon Hill Trek',
    description: 'Perfect for beginners and families. A short 5-day trek with the most famous sunrise viewpoint in Nepal — golden light spilling over Annapurna and Dhaulagiri. No prior experience needed.',
    location: 'Annapurna Region, Nepal',
    durationDays: 5,
    difficulty: 'EASY',
    price: 400.0,
    maxAltitude: 3210,
    bestSeason: 'Year-round (except monsoon)',
    highlights: ['Poon Hill Sunrise', 'Rhododendron Forests', 'Ghandruk Village'],
    coverImage: 'https://images.unsplash.com/photo-1502092120083-d96ba0de7c68?q=80&w=800',
    availableSpots: 18, maxCapacity: 20,
  },
  {
    title: 'Langtang Valley Trek',
    description: 'Known as the Valley of Glaciers. A 10-day moderate trek through Tamang villages and ancient gompas, ending at the sacred Gosaikunda Lake. Fewer crowds than Everest or Annapurna.',
    location: 'Langtang, Nepal',
    durationDays: 10,
    difficulty: 'MODERATE',
    price: 750.0,
    maxAltitude: 4984,
    bestSeason: 'Spring (Mar-May) or Autumn (Oct-Nov)',
    highlights: ['Gosaikunda Lake', 'Kyanjin Gompa', 'Langtang Glacier', 'Tamang Heritage'],
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
    availableSpots: 14, maxCapacity: 16,
  },
  {
    title: 'Mardi Himal Trek',
    description: 'A hidden gem off the beaten path. This 7-day adventure delivers staggering close-up views of Machhapuchhre (Fishtail Mountain) with almost no crowds. Ideal for explorers who want authenticity.',
    location: 'Annapurna Region, Nepal',
    durationDays: 7,
    difficulty: 'MODERATE',
    price: 580.0,
    maxAltitude: 4500,
    bestSeason: 'Dec-Feb (winter), Mar-May, Oct-Nov',
    highlights: ['Mardi Himal Base Camp', 'Machhapuchhre Views', 'Forest Camp', 'Low Crowds'],
    coverImage: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=800',
    availableSpots: 15, maxCapacity: 18,
  },
  {
    title: 'Manaslu Circuit Trek',
    description: 'One of the last great Himalayan wilderness treks. This 14-day restricted-area circuit circumnavigates the world\'s 8th highest peak through remote villages rarely visited by outsiders.',
    location: 'Manaslu Region, Nepal',
    durationDays: 14,
    difficulty: 'HARD',
    price: 1800.0,
    maxAltitude: 5106,
    bestSeason: 'Spring or Autumn',
    highlights: ['Larkya La Pass (5106m)', 'Budhi Gandaki River', 'Remote Tibetan Villages', 'Manaslu Base Camp'],
    coverImage: 'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?q=80&w=800',
    availableSpots: 8, maxCapacity: 10,
  },
  {
    title: 'Upper Mustang Trek',
    description: 'Step into the forbidden kingdom. A 12-day journey through the walled city of Lo Manthang — an ancient Tibetan Buddhist enclave virtually frozen in time, hidden behind the Himalayas in a monsoon rain shadow.',
    location: 'Mustang, Nepal',
    durationDays: 12,
    difficulty: 'MODERATE',
    price: 2200.0,
    maxAltitude: 3840,
    bestSeason: 'Jun-Aug (monsoon shadow)',
    highlights: ['Lo Manthang Walled City', 'Ancient Cave Monasteries', 'Tibetan Culture', 'Kali Gandaki Gorge'],
    coverImage: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?q=80&w=800',
    availableSpots: 6, maxCapacity: 8,
  },
  {
    title: 'Kanchenjunga Base Camp Trek',
    description: 'For serious mountaineers only. A 21-day wilderness expedition to the base of the world\'s 3rd highest peak. Pure camping-style trekking through pristine rhododendron forest and untouched high-altitude wilderness.',
    location: 'Taplejung, Nepal',
    durationDays: 21,
    difficulty: 'EXTREME',
    price: 2800.0,
    maxAltitude: 5143,
    bestSeason: 'Spring (Apr-May)',
    highlights: ['Kanchenjunga Base Camp', 'Yalung Glacier', 'Rhododendron Forest', 'True Wilderness'],
    coverImage: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=800',
    availableSpots: 4, maxCapacity: 6,
  },
  {
    title: 'Pikey Peak Trek',
    description: 'The best-kept secret for panoramic Everest views without the 14-day commitment. Praised by Sir Edmund Hillary as offering the finest Himalayan viewpoint. Short, accessible, and absolutely stunning.',
    location: 'Solukhumbu, Nepal',
    durationDays: 5,
    difficulty: 'MODERATE',
    price: 450.0,
    maxAltitude: 4065,
    bestSeason: 'Mar-May, Oct-Dec',
    highlights: ['360° Himalayan Panorama', 'Everest Views', 'Low Altitude Start', 'Short Duration'],
    coverImage: 'https://images.unsplash.com/photo-1585409356547-88c2e0e5e24d?q=80&w=800',
    availableSpots: 16, maxCapacity: 20,
  },
];

async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

function buildTrekEmbeddingText(trek: any): string {
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

async function main() {
  console.log('🌱 Starting trek seeding and AI embedding generation...');

  try {
    // 1. Clear Treks
    console.log('  🗑  Clearing old treks via Prisma...');
    await (prisma as any).trek.deleteMany();

    console.log('  🚀 Seeding 9 treks and generating AI embeddings...');
    for (const trek of SEED_TREKS) {
      console.log(`     - Processing: ${trek.title}`);
      
      // Generate Embedding
      const text = buildTrekEmbeddingText(trek);
      let embedding: number[] | null = null;
      try {
        embedding = await generateEmbedding(text);
        console.log(`       ✅ Embedding generated (${embedding.length}D)`);
      } catch (err: any) {
        console.error(`       ❌ Embedding failed: ${err.message}`);
      }

      await (prisma as any).trek.create({
        data: {
          id: crypto.randomUUID(),
          title: trek.title,
          description: trek.description,
          location: trek.location,
          durationDays: trek.durationDays,
          difficulty: trek.difficulty,
          price: trek.price,
          maxAltitude: trek.maxAltitude,
          bestSeason: trek.bestSeason,
          highlights: trek.highlights,
          coverImage: trek.coverImage,
          availableSpots: trek.availableSpots,
          maxCapacity: trek.maxCapacity,
          embedding: embedding || undefined,
        }
      });
    }

    console.log('\n✨ Seeding complete! Your AI-powered adventure discovery is ready.');
  } catch (err: any) {
    console.error('💥 ERROR during seeding:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
