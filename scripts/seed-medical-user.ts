/**
 * seed-medical-user.ts
 * Creates the dedicated medical@gtmadventures.com doctor account with MEDICAL role.
 * Run: npx tsx scripts/seed-medical-user.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'medical@gtmadventures.com';
  const password = 'MedicalHQ@GTM2025'; // Change after first login

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Update role if already exists
    await prisma.user.update({
      where: { email },
      data: { role: 'MEDICAL' as any },
    });
    console.log(`✅ Updated existing user ${email} to MEDICAL role`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      name: 'Medical HQ',
      email,
      password: hashed,
      role: 'MEDICAL' as any,
    },
  });

  console.log(`✅ Created medical@gtmadventures.com with MEDICAL role`);
  console.log(`   Temporary password: ${password}`);
  console.log(`   Change this password immediately after first login.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
