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
  const email = 'admin@gtm-adventures.com';
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`❌ User not found: ${email}`);
    process.exit(1);
  }

  console.log(`✅ Found User: ${user.name} (${user.email})`);
  console.log(`Role: ${user.role}`);
  console.log(`2FA Enabled: ${user.twoFactorEnabled}`);

  const match = await bcrypt.compare('admin1', user.password || '');
  console.log(`Password Match ('admin1'): ${match}`);
}

main().catch(console.error).finally(async () => {
  await prisma.$disconnect();
  if (pool) await (pool as any).end();
});
