import { prisma } from '../src/lib/prisma';

async function main() {
  try {
    console.log('Adding embedding column to Trek table...');
    // We use executeRawUnsafe to safely bypass prisma schema validation for this DDL command
    await prisma.$executeRawUnsafe(`ALTER TABLE "Trek" ADD COLUMN IF NOT EXISTS "embedding" FLOAT[];`);
    console.log('Successfully added embedding column.');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
