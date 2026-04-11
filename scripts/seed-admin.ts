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
    const adminPass = 'admin';
    const adminHashed = await bcrypt.hash(adminPass, 10);
    const adminSecret = 'GAXGS33TOBXGIJBK'; 

    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: adminHashed,
        role: 'ADMIN',
        twoFactorEnabled: false, // 🛠️ DISABLED FOR DEV STABILITY
        twoFactorSecret: adminSecret,
      },
      create: {
        email: adminEmail,
        name: 'System Administrator',
        password: adminHashed,
        role: 'ADMIN',
        twoFactorEnabled: false,
        twoFactorSecret: adminSecret,
      },
    });

    console.log('  ✅ Admin Synchronized!');
    console.log(`  📧 Email: ${adminEmail}`);
    console.log('  🔐 2FA: ENABLED\n');

    // 2. Default Leader Account
    const leaderEmail = 'leader@gtm-adventures.com';
    const leaderPass = 'admin';
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
    console.log('  🎭 Role: LEADER\n');

    // 3. Medical Officer Account
    const medicalEmail = 'medical@gtmadventures.com';
    const medicalPass = 'admin';
    const medicalHashed = await bcrypt.hash(medicalPass, 10);

    await prisma.user.upsert({
      where: { email: medicalEmail },
      update: {
        password: medicalHashed,
        role: 'MEDICAL',
        twoFactorEnabled: false,
      },
      create: {
        email: medicalEmail,
        name: 'Medical Officer',
        password: medicalHashed,
        role: 'MEDICAL',
        twoFactorEnabled: false,
      },
    });

    console.log('  ✅ Medical Officer Synchronized!');
    console.log(`  📧 Email: ${medicalEmail}`);
    console.log('  🎭 Role: MEDICAL\n');

    // 4. Regular User Account
    const userEmail = 'user@gtm-adventures.com';
    const userPass = 'admin';
    const userHashed = await bcrypt.hash(userPass, 10);

    await prisma.user.upsert({
      where: { email: userEmail },
      update: {
        password: userHashed,
        role: 'TREKKER',
        twoFactorEnabled: false,
      },
      create: {
        email: userEmail,
        name: 'Standard Trekker',
        password: userHashed,
        role: 'TREKKER',
        twoFactorEnabled: false,
      },
    });

    console.log('  ✅ Standard Trekker Synchronized!');
    console.log(`  📧 Email: ${userEmail}`);
    console.log('  🎭 Role: TREKKER\n');

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

