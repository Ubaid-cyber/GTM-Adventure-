import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gtm-adventures.com';
  const secret = 'GAXGS33TOBXGIJBK';
  
  await (prisma.user as any).update({
    where: { email },
    data: { 
      twoFactorSecret: secret, 
      twoFactorEnabled: true 
    }
  });
  
  console.log(`--- [SUCCESS] ADMIN RE-SYNCED ---`);
  console.log(`Email: ${email}`);
  console.log(`Secret: ${secret}`);
}

main().finally(() => prisma.$disconnect());
