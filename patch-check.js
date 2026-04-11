const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'medical@gtmadventures.com' }
  });
  
  if (!user) {
    console.log('❌ Medical user not found in DB!');
  } else {
    console.log('✅ Found user:', user.email, user.role);
    const isMatch = await bcrypt.compare('admin', user.password);
    console.log('✅ Password matches "admin":', isMatch);
  }

  const leader = await prisma.user.findUnique({
    where: { email: 'leader@gtm-adventures.com' }
  });

  if (!leader) {
    console.log('❌ Leader user not found in DB!');
  } else {
    console.log('✅ Found leader:', leader.email, leader.role);
    const isMatch = await bcrypt.compare('admin', leader.password);
    console.log('✅ Leader Password matches "admin":', isMatch);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
