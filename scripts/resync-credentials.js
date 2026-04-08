const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: 'admin@gtm-adventures.com', name: 'HQ Commander', role: 'ADMIN', password: 'admin' },
    { email: 'bhatubaid341@gmail.com', name: 'Expedition Lead Alpha', role: 'LEADER', password: 'admin' },
    { email: 'user@gtm-adventures.com', name: 'Regular Trekker', role: 'TREKKER', password: 'admin' }
  ];

  console.log('--- 🛡️ GTM-Adventure: Resyncing Credentials to match README ---');

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        password: hashedPassword,
        role: u.role,
        twoFactorEnabled: false // Disable 2FA for now to allow initial access
      },
      create: {
        email: u.email,
        name: u.name,
        password: hashedPassword,
        role: u.role,
        twoFactorEnabled: false
      }
    });
    console.log(`✅ Synchronized: ${u.email} (Password: ${u.password}, Role: ${u.role})`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
