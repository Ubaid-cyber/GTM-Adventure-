const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: 'Test Explorer',
        password: hashedPassword,
        role: 'TREKKER',
      },
    });
    console.log('--- TEST ACCOUNT CREATED ---');
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${password}`);
    console.log('----------------------------');
  } catch (err) {
    console.error('Error creating test account:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
