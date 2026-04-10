import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-');    // Replace multiple - with single -
}

async function main() {
  console.log('\n🚀 Backfilling Trek Slugs...\n');

  const treks = await prisma.trek.findMany({
    where: {
      OR: [
        { slug: null },
        { slug: '' }
      ]
    }
  });

  console.log(`  Found ${treks.length} treks needing slugs.`);

  for (const trek of treks) {
    let slug = slugify(trek.title);
    
    // Check for uniqueness (very basic handling)
    const exists = await prisma.trek.findFirst({ 
      where: { 
        slug,
        id: { not: trek.id }
      } 
    });

    if (exists) {
      slug = `${slug}-${trek.id.substring(treks.length - 4)}`;
    }

    await prisma.trek.update({
      where: { id: trek.id },
      data: { slug }
    });
    
    console.log(`  ✅ Updated: "${trek.title}" -> /treks/${slug}`);
  }

  console.log('\n✨ Backfill complete!\n');
}

main()
  .then(async () => { await pool.end(); await prisma.$disconnect(); })
  .catch(async (e) => { 
    console.error(e); 
    await pool.end();
    await prisma.$disconnect(); 
    process.exit(1); 
  });
