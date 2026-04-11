const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const rawPass = 'admin';
  const hashedPass = await bcrypt.hash(rawPass, 10);

  // Sync Leader
  await prisma.user.upsert({
    where: { email: 'leader@gtm-adventures.com' },
    update: { password: hashedPass, role: 'LEADER', twoFactorEnabled: false },
    create: { email: 'leader@gtm-adventures.com', name: 'Expedition Lead Alpha', password: hashedPass, role: 'LEADER', twoFactorEnabled: false }
  });

  // Sync Medical
  await prisma.user.upsert({
    where: { email: 'medical@gtmadventures.com' },
    update: { password: hashedPass, role: 'MEDICAL', twoFactorEnabled: false },
    create: { email: 'medical@gtmadventures.com', name: 'Medical Officer', password: hashedPass, role: 'MEDICAL', twoFactorEnabled: false }
  });

  // Ensure Admin
  await prisma.user.upsert({
    where: { email: 'admin@gtm-adventures.com' },
    update: { password: hashedPass, role: 'ADMIN', twoFactorEnabled: false },
    create: { email: 'admin@gtm-adventures.com', name: 'System Administrator', password: hashedPass, role: 'ADMIN', twoFactorEnabled: false, twoFactorSecret: 'GAXGS33TOBXGIJBK' }
  });

  console.log('✅ Accounts Synced to match README.md');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
