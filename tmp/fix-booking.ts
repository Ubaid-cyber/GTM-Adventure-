import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const partialId = 'cmneenehh000whixjdzkjbn'; 
  
  // 1. Find the booking
  const bookings = await prisma.booking.findMany({
    where: {
      id: { contains: partialId }
    },
    include: { trek: true }
  });

  if (bookings.length === 0) {
    console.log('No booking found matching ID fragment:', partialId);
    return;
  }

  const booking = bookings[0];
  console.log(`Found Booking: ${booking.id} (${booking.status})`);

  if (booking.status !== 'CONFIRMED') {
    console.log('Booking is not confirmed. Only confirmed bookings need expeditions.');
    return;
  }

  if (booking.expeditionId) {
    console.log('Booking already has an expedition linked:', booking.expeditionId);
    return;
  }

  // 2. Create the Expedition
  const durationDays = (booking.trek as any)?.durationDays || 5;
  const startDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); 
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const result = await prisma.$transaction(async (tx) => {
    const expedition = await tx.expedition.create({
      data: {
        trekId: booking.trekId,
        status: 'UPCOMING',
        startDate,
        endDate
      }
    });

    await tx.booking.update({
      where: { id: booking.id },
      data: { expeditionId: expedition.id }
    });

    return expedition;
  });

  console.log(`Successfully created and linked Expedition: ${result.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
