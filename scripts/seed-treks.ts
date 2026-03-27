import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const initialTreks = [
  {
    title: 'Everest Base Camp Trek',
    description: 'A classic 14-day trek to the base of the world\'s highest peak. Enjoy breathtaking views of the Himalayas and Sherpa culture.',
    location: 'Khumbu, Nepal',
    durationDays: 14,
    difficulty: 'HARD',
    price: 1500.0,
    maxAltitude: 5364,
    bestSeason: 'Spring (Mar-May) or Autumn (Sep-Nov)',
    highlights: ['Everest Base Camp', 'Kala Patthar', 'Namche Bazaar'],
    coverImage: 'https://images.unsplash.com/photo-1544257134-8b61c16260a9?q=80&w=800',
  },
  {
    title: 'Annapurna Circuit',
    description: 'One of the most diverse and beautiful treks in the world, crossing the Thorong La Pass.',
    location: 'Annapurna Region, Nepal',
    durationDays: 16,
    difficulty: 'HARD',
    price: 1200.0,
    maxAltitude: 5416,
    bestSeason: 'Spring or Autumn',
    highlights: ['Thorong La Pass', 'Tilicho Lake', 'Poon Hill'],
    coverImage: 'https://images.unsplash.com/photo-1598425237699-1bd125f17dcb?q=80&w=800',
  },
  {
    title: 'Ghorepani Poon Hill Trek',
    description: 'A relatively easy and short trek with stunning sunrise views over the Annapurna and Dhaulagiri mountain ranges.',
    location: 'Annapurna Region, Nepal',
    durationDays: 5,
    difficulty: 'EASY',
    price: 400.0,
    maxAltitude: 3210,
    bestSeason: 'Year-round (except monsoon)',
    highlights: ['Poon Hill Sunrise', 'Rhododendron Forests', 'Ghandruk Village'],
    coverImage: 'https://images.unsplash.com/photo-1502092120083-d96ba0de7c68?q=80&w=800',
  }
]

async function main() {
  console.log('Start seeding...')
  for (const trek of initialTreks) {
    const createdTrek = await prisma.trek.create({
      data: trek,
    })
    console.log(`Created Trek with id: ${createdTrek.id}`)
  }
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
