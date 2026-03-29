import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function verifyCredentials(email: string, password: string, ip: string = '127.0.0.1', userAgent: string = 'unknown') {
  const lockKey = `lockout:${email}`;
  
  if (redis) {
    const failedAttempts = await redis.get(lockKey);
    if (failedAttempts && parseInt(failedAttempts) >= 5) {
      throw new Error('ACCOUNT_LOCKED');
    }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.password) {
    if (redis) {
      await redis.incr(lockKey);
      await redis.expire(lockKey, 1800);
    }
    throw new Error('INVALID_CREDENTIALS');
  }

  const isValid = await compare(password, user.password);
  if (!isValid) {
    if (redis) {
      await redis.incr(lockKey);
      await redis.expire(lockKey, 1800);
    }
    throw new Error('INVALID_CREDENTIALS');
  }

  if (redis) {
    await redis.del(lockKey);
  }

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'SIGN_IN_SUCCESS',
      ip,
      userAgent,
      metadata: { provider: 'credentials' },
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
