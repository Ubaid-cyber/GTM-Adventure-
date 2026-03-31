import 'dotenv/config';
import { PrismaClient, BookingStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { name: 'ubaid' }
  });

  if (!user) {
    console.error('User ubaid not found. Seed the treks first!');
    return;
  }

  const trek = await prisma.trek.findFirst({
    where: { title: 'Everest Base Camp Trek' }
  });

  if (!trek) {
    console.error('Trek not found. Seed the treks first!');
    return;
  }

  const booking = await prisma.booking.create({
    data: {
      userId: user.id,
      trekId: trek.id,
      participants: 2,
      totalPrice: trek.price * 2,
      status: BookingStatus.CONFIRMED,
    }
  });

  console.log(`✅ Success! Created a confirmed booking for ${user.name} on ${trek.title}.`);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
