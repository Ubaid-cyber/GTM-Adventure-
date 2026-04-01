import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('\n--- 🛡️ GTM-Adventure: Elite Personnel Audit ---\n');

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        twoFactorEnabled: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (users.length === 0) {
      console.log('  ⚠️ No personnel found in the active database.');
    } else {
      console.log(`  🔍 Found ${users.length} registered personnel:`);
      console.table(users.map(u => ({
        Name: u.name || 'Anonymous',
        Email: u.email,
        Role: u.role,
        '2FA': u.twoFactorEnabled ? '✅' : '❌',
        Joined: u.createdAt.toLocaleDateString()
      })));
    }

  } catch (err: any) {
    console.error('  ❌ Audit Failed:', err.message);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    if (pool) await (pool as any).end();
    console.log('\n--- 🚀 Audit Mission Completed ---\n');
  });
