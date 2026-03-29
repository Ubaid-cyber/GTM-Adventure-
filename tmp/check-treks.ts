import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const count = await (prisma as any).trek.count();
    const treks = await (prisma as any).trek.findMany({ 
      select: { title: true, embedding: true } 
    });
    console.log(`Trek count: ${count}`);
    for (const t of treks) {
      console.log(`${t.title}: Embedding ${t.embedding ? 'present' : 'MISSING'}`);
    }
  } catch (err: any) {
    console.error('Error checking treks:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
