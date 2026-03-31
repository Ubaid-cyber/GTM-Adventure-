import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const trekTitle = 'UPPER MUSTANG TREK';
  
  const bookings = await prisma.booking.findMany({
    where: {
      trek: {
        title: {
          contains: trekTitle,
          mode: 'insensitive'
        }
      }
    },
    include: { trek: true }
  });

  if (bookings.length === 0) {
    console.log('No bookings found for trek:', trekTitle);
  } else {
    bookings.forEach(b => {
      console.log(`ID: ${b.id}, Status: ${b.status}, ExpeditionID: ${b.expeditionId}`);
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
