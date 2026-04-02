import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true }
  });
  console.log('--- USERS ---');
  for (const user of users) {
    console.log(`${user.id} | ${user.role} | ${user.email} | ${user.name}`);
  }

  const bookings = await prisma.booking.findMany({
    include: { user: { select: { email: true } }, expedition: { select: { id: true } } }
  });
  console.log('--- BOOKINGS ---');
  for (const b of bookings) {
    console.log(`${b.user.email} | ${b.expeditionId} | ${b.status}`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
