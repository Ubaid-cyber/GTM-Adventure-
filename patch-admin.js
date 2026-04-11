const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: {
      name: 'HQ Commander'
    },
    data: {
      name: 'System Administrator'
    }
  });
  console.log('Admin names patched!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
