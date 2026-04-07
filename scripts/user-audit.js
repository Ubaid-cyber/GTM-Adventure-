const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      role: true
    }
  });
  fs.writeFileSync('tmp/user-audit.json', JSON.stringify(users, null, 2));
  console.log('User audit written to tmp/user-audit.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());
