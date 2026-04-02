import { PrismaClient } from '@prisma/client';
import { authenticator } from 'otplib';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@gtm-adventures.com';
  const user = await (prisma.user as any).findUnique({ where: { email } });

  if (!user) {
    console.log(`--- [RESULT] USER_NOT_FOUND ---`);
  } else {
    console.log(`--- [2FA DEBUG] ---`);
    console.log(`User: ${user.email}`);
    console.log(`Stored Secret: ${user.twoFactorSecret}`);
    
    if (user.twoFactorSecret) {
      const currentToken = authenticator.generate(user.twoFactorSecret);
      console.log(`\n>>> CURRENT VALID CODE: ${currentToken} <<<\n`);
      console.log(`(This code is valid for the next 30 seconds on your server's clock)`);
    } else {
      console.log(`[Error] No 2FA Secret found for this user.`);
    }
    console.log(`-------------------`);
  }
}

main().finally(() => prisma.$disconnect());
