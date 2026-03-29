import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createOldBooking() {
  console.log('\n🕰️  Simulating a 15-minute old PENDING booking...\n');

  try {
    // 1. Get an existing Trek and User (we'll just take the first ones)
    const trek = await prisma.trek.findFirst();
    const user = await prisma.user.findFirst();

    if (!trek || !user) {
      console.log('❌ Error: Need at least one Trek and User in the database.');
      process.exit(1);
    }

    const initialSpots = trek.availableSpots;
    const pastDate = new Date(Date.now() - 15 * 60 * 1000); // 15 mins ago

    // 2. Create the old booking
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        trekId: trek.id,
        participants: 2, // Reserving 2 spots
        totalPrice: trek.price * 2,
        status: 'PENDING',
        createdAt: pastDate,
        updatedAt: pastDate
      }
    });

    // 3. Decrement spots manually to simulate what the UI does
    await prisma.trek.update({
      where: { id: trek.id },
      data: { availableSpots: { decrement: 2 } }
    });

    console.log(`✅ Created old PENDING booking (ID: ${booking.id})`);
    console.log(`📉 Trek "${trek.title}" spots went from ${initialSpots} ➡️  ${initialSpots - 2}`);
    console.log(`\n👉 Now run: npx tsx scripts/trigger-timeout.ts to watch those 2 spots come back!\n`);

  } catch (err: any) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

createOldBooking();
