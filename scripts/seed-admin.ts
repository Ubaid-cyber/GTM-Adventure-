import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL
});
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('\n--- 🛡️ GTM-Adventure: Secure HQ Personnel Seeding ---\n');

  try {
    // 1. Core Admin Account
    const adminEmail = 'admin@gtm-adventures.com';
    const adminPass = 'admin123';
    const adminHashed = await bcrypt.hash(adminPass, 10);
    const adminSecret = 'GAXG S33T OBXG IJBK'.replace(/ /g, ''); // Fixed manual secret for testing

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: adminHashed,
        role: 'ADMIN',
        twoFactorEnabled: true,
        twoFactorSecret: adminSecret,
      },
      create: {
        email: adminEmail,
        name: 'HQ Commander',
        password: adminHashed,
        role: 'ADMIN',
        twoFactorEnabled: true,
        twoFactorSecret: adminSecret,
      },
    });

    console.log('  ✅ Admin HQ Commander Synchronized!');
    console.log(`  📧 Email: ${adminEmail}`);
    console.log(`  🔑 Password: ${adminPass}`);
    console.log('  🔐 2FA: ENABLED (Manual Key: GAXG S33T OBXG IJBK)\n');

    // 2. Default Leader Account
    const leaderEmail = 'leader@gtm-adventures.com';
    const leaderPass = 'leader123';
    const leaderHashed = await bcrypt.hash(leaderPass, 10);

    await prisma.user.upsert({
      where: { email: leaderEmail },
      update: {
        password: leaderHashed,
        role: 'LEADER',
        twoFactorEnabled: false,
      },
      create: {
        email: leaderEmail,
        name: 'Expedition Lead Alpha',
        password: leaderHashed,
        role: 'LEADER',
        twoFactorEnabled: false,
      },
    });

    console.log('  ✅ Expedition Leader Synchronized!');
    console.log(`  📧 Email: ${leaderEmail}`);
    console.log(`  🔑 Password: ${leaderPass}`);
    console.log('  🎭 Role: LEADER\n');

  } catch (err: any) {
    console.error('  ❌ Seeding Mission Failed:', err.message);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    if (pool) await (pool as any).end();
    console.log('--- 🚀 Seeding Operations Completed ---\n');
  });

