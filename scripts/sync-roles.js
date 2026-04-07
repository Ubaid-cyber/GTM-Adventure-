const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin', 10);
  
  const usersToSync = [
    {
      email: 'bhatubaid341@gmail.com',
      role: 'LEADER',
      name: 'Ubaid'
    },
    {
      email: 'admin@gtm-adventures.com',
      role: 'ADMIN',
      name: 'Admin'
    },
    {
      email: 'user@gtm-adventures.com',
      role: 'TREKKER',
      name: 'User'
    }
  ];

  for (const userData of usersToSync) {
    console.log(`Syncing ${userData.email}...`);
    await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        role: userData.role,
        password: hashedPassword,
        name: userData.name
      },
      create: {
        email: userData.email,
        role: userData.role,
        password: hashedPassword,
        name: userData.name
      }
    });
  }

  console.log('✅ All roles and passwords synchronized successfully.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
