import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n--- 🛡️ GTM-Adventure: Expedition Booking Reseed ---\n');
  try {
    const user = await prisma.user.findFirst({
      where: { name: { contains: 'ubaid', mode: 'insensitive' } }
    });

    const trek = await prisma.trek.findFirst({
      where: { title: { contains: 'Everest', mode: 'insensitive' } }
    });

    if (!user || !trek) {
      console.log(`  ⚠️ Required records missing (User: ${!!user}, Trek: ${!!trek})`);
      return;
    }

    const booking = await prisma.booking.upsert({
      where: { id: 'test-booking-id-123' },
      update: { status: 'CONFIRMED' },
      create: {
        id: 'test-booking-id-123',
        userId: user.id,
        trekId: trek.id,
        participants: 2,
        totalPrice: trek.price * 2,
        status: 'CONFIRMED',
      }
    });

    console.log(`  ✅ Confirmed booking synchronized for ${user.name} on ${trek.title}.`);
  } catch (err: any) {
    console.error('  ❌ Reseed Error:', err.message);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    console.log('\n--- 🚀 Reseed Completed ---\n');
  });
