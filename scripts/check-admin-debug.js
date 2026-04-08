const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gtm-adventures.com';
  console.log(`Checking user: ${email}`);
  
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    console.error('❌ User not found');
    return;
  }

  console.log('✅ User found');
  console.log(`Name: ${user.name}`);
  console.log(`Role: ${user.role}`);
  console.log(`2FA Enabled: ${user.twoFactorEnabled}`);
  
  const passwordsToTest = ['admin', 'admin1'];
  for (const pass of passwordsToTest) {
    const match = await bcrypt.compare(pass, user.password || '');
    console.log(`Password match for '${pass}': ${match}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
