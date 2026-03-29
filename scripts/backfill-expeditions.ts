import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Backfilling missing expeditions for CONFIRMED bookings...');

  const missingExpeditionsBookings = await prisma.booking.findMany({
    where: {
      status: 'CONFIRMED',
      expeditionId: null,
    },
    include: {
      trek: true
    }
  });

  if (missingExpeditionsBookings.length === 0) {
    console.log('✅ All confirmed bookings already have expeditions.');
    return;
  }

  console.log(`Found ${missingExpeditionsBookings.length} confirmed bookings without expeditions.`);

  for (const booking of missingExpeditionsBookings) {
    const startDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + (booking.trek.durationDays * 24 * 60 * 60 * 1000));

    const expedition = await prisma.expedition.create({
      data: {
        trekId: booking.trekId,
        status: 'UPCOMING',
        startDate,
        endDate
      }
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        expeditionId: expedition.id
      }
    });

    console.log(`✅ Backfilled expedition ${expedition.id} for booking ${booking.id}`);
  }

  console.log('🎉 Done backfilling expeditions.');
}

main()
  .catch(e => {
    console.error('Fatal Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
