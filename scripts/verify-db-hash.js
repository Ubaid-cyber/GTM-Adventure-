const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const password = 'admin';
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(`Generated hash for 'admin': ${hashedPassword}`);
  
  const user = await prisma.user.findUnique({ where: { email: 'user@gtm-adventures.com' } });
  if (user) {
    console.log(`Database hash for user: ${user.password}`);
    const match = await bcrypt.compare(password, user.password);
    console.log(`Match: ${match}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
