const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const medicalEmail = 'medical@gtmadventures.com';
  const rawPass = 'admin';
  const hashedPass = await bcrypt.hash(rawPass, 10);

  await prisma.user.upsert({
    where: { email: medicalEmail },
    update: {
      password: hashedPass,
      role: 'MEDICAL',
      twoFactorEnabled: false
    },
    create: {
      email: medicalEmail,
      name: 'Medical Officer',
      password: hashedPass,
      role: 'MEDICAL',
      twoFactorEnabled: false
    }
  });

  console.log('✅ Medical Account Patched/Created in Database');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
