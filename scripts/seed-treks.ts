import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@prisma/client';

// Use DIRECT_DATABASE_URL since seed runs outside Next.js
const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

const treks = [
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
    availableSpots: 12,
    maxCapacity: 15,
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
    availableSpots: 10,
    maxCapacity: 12,
  },
  {
    title: 'Ghorepani Poon Hill Trek',
    description: 'Perfect for beginners and families. A short 5-day trek with the most famous sunrise viewpoint in Nepal — watching golden light spill over the Annapurna and Dhaulagiri ranges.',
    location: 'Annapurna Region, Nepal',
    durationDays: 5,
    difficulty: 'EASY',
    price: 400.0,
    maxAltitude: 3210,
    bestSeason: 'Year-round (except monsoon)',
    highlights: ['Poon Hill Sunrise', 'Rhododendron Forests', 'Ghandruk Village'],
    coverImage: 'https://images.unsplash.com/photo-1502092120083-d96ba0de7c68?q=80&w=800',
    availableSpots: 18,
    maxCapacity: 20,
  },
  {
    title: 'Langtang Valley Trek',
    description: 'Known as the "Valley of Glaciers", this moderately challenging 10-day trek takes you through Tamang villages, ancient gompas, and ends at the stunning Gosaikunda sacred lake.',
    location: 'Langtang, Nepal',
    durationDays: 10,
    difficulty: 'MODERATE',
    price: 750.0,
    maxAltitude: 4984,
    bestSeason: 'Spring (Mar-May) or Autumn (Oct-Nov)',
    highlights: ['Gosaikunda Lake', 'Kyanjin Gompa', 'Langtang Glacier', 'Tamang Heritage'],
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
    availableSpots: 14,
    maxCapacity: 16,
  },
  {
    title: 'Mardi Himal Trek',
    description: 'A hidden gem. This 7-day off-the-beaten-path adventure offers staggering close-up views of Machhapuchhre (Fishtail Mountain) without the crowds of the popular Annapurna trails.',
    location: 'Annapurna Region, Nepal',
    durationDays: 7,
    difficulty: 'MODERATE',
    price: 580.0,
    maxAltitude: 4500,
    bestSeason: 'Dec-Feb (winter), Mar-May, Oct-Nov',
    highlights: ['Mardi Himal Base Camp', 'Machhapuchhre Views', 'Forest Camp', 'Low Crowd'],
    coverImage: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?q=80&w=800',
    availableSpots: 15,
    maxCapacity: 18,
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
    availableSpots: 8,
    maxCapacity: 10,
  },
  {
    title: 'Upper Mustang Trek',
    description: 'Step into the forbidden kingdom. An extraordinary 12-day journey through the ancient walled city of Lo Manthang, a Tibetan Buddhist enclave virtually frozen in time, hidden behind the Himalayas.',
    location: 'Mustang, Nepal',
    durationDays: 12,
    difficulty: 'MODERATE',
    price: 2200.0,
    maxAltitude: 3840,
    bestSeason: 'Jun-Aug (monsoon shadow)',
    highlights: ['Lo Manthang Walled City', 'Ancient Cave Monasteries', 'Tibetan Culture', 'Kali Gandaki Gorge'],
    coverImage: 'https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?q=80&w=800',
    availableSpots: 6,
    maxCapacity: 8,
  },
  {
    title: 'Kanchenjunga Base Camp Trek',
    description: 'For serious mountaineers. A 21-day wilderness expedition to the base of the world\'s 3rd highest peak. No teahouses — this is pure camping-style trekking through pristine rhododendron forest and high-altitude wilderness.',
    location: 'Taplejung, Nepal',
    durationDays: 21,
    difficulty: 'EXTREME',
    price: 2800.0,
    maxAltitude: 5143,
    bestSeason: 'Spring (Apr-May)',
    highlights: ['Kanchenjunga Base Camp', 'Yalung Glacier', 'Rhododendron Forest', 'True Wilderness'],
    coverImage: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=800',
    availableSpots: 4,
    maxCapacity: 6,
  },
  {
    title: 'Pikey Peak Trek',
    description: 'The best-kept secret for panoramic Everest views without the 14-day commitment. This 5-day moderate trek to Pikey Peak (4065m) was praised by Sir Edmund Hillary as offering the finest Himalayan viewpoint.',
    location: 'Solukhumbu, Nepal',
    durationDays: 5,
    difficulty: 'MODERATE',
    price: 450.0,
    maxAltitude: 4065,
    bestSeason: 'Mar-May, Oct-Dec',
    highlights: ['360° Himalayan Panorama', 'Everest Views', 'Low Altitude Start', 'Short Duration'],
    coverImage: 'https://images.unsplash.com/photo-1585409356547-88c2e0e5e24d?q=80&w=800',
    availableSpots: 16,
    maxCapacity: 20,
  },
];

async function main() {
  console.log('\n🌱 Seeding GTM-Adventure database...\n');

  // Clear existing data first
  await prisma.booking.deleteMany({});
  await prisma.expedition.deleteMany({});
  await prisma.trek.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('  🗑  Cleared existing data (bookings, expeditions, treks, users)');

  // Create Default User
  const devUser = await prisma.user.create({
    data: {
      name: 'ubaid',
      email: 'ubaid@example.com',
      role: UserRole.TREKKER,
    }
  });
  console.log(`  ✅ Created Dev User: ${devUser.name} (${devUser.email})`);

  const createdTreks = [];
  for (const trek of treks) {
    const created = await prisma.trek.create({ data: trek });
    createdTreks.push(created);
    console.log(`  ✅ Created Trek: ${created.title}`);
  }

  // Create mock Expeditions
  const ebc = createdTreks.find(t => t.title === 'Everest Base Camp Trek');
  const annapurna = createdTreks.find(t => t.title === 'Annapurna Circuit');

  if (ebc) {
    await prisma.expedition.create({
      data: {
        trekId: ebc.id,
        status: 'ONGOING',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        currentLocationName: 'Namche Bazaar',
        currentAltitude: 3440,
        currentLat: 27.8069,
        currentLong: 86.7140,
        progressPercent: 35,
      }
    });
    console.log('  ✅ Created ONGOING Expedition for EBC');
  }

  if (annapurna) {
    await prisma.expedition.create({
      data: {
        trekId: annapurna.id,
        status: 'UPCOMING',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
        progressPercent: 0,
      }
    });
    console.log('  ✅ Created UPCOMING Expedition for Annapurna');
  }

  console.log(`\n✨ Seeding complete — ${treks.length} treks and 2 expeditions in database.\n`);
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
