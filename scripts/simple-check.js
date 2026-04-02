const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true }
  });
  console.log('USERS FOUND:', users.length);
  users.forEach(u => console.log(`- ${u.email} (${u.role})`));

  const bookings = await prisma.booking.findMany({
    include: { user: { select: { email: true } } }
  });
  console.log('BOOKINGS FOUND:', bookings.length);
  bookings.forEach(b => console.log(`- User: ${b.user.email} | Status: ${b.status} | Expedition: ${b.expeditionId}`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
