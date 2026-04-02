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
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@gtm-adventures.com';
    const adminPass = process.env.INITIAL_ADMIN_PASSWORD || 'admin1';
    const adminHashed = await bcrypt.hash(adminPass, 10);
    // Use a provided secret or generate a random one for dev
    const adminSecret = process.env.INITIAL_ADMIN_2FA_SECRET || 'GAXGS33TOBXGIJBK'; 

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
    console.log('  🔐 2FA: ENABLED\n');

    // 2. Default Leader Account
    const leaderEmail = process.env.INITIAL_LEADER_EMAIL || 'leader@gtm-adventures.com';
    const leaderPass = process.env.INITIAL_LEADER_PASSWORD || 'leader123';
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

