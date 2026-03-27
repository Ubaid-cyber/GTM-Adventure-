import { Router, Request, Response } from 'express';
import { hash, compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';
import { rateLimit } from '../lib/rate-limit';
import { generateOTP, verifyOTP } from '../lib/otp';

const router = Router();

// ─── Schemas ──────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const otpRequestSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
});

// ─── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req: Request, res: Response) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const { success } = await rateLimit(`register:${ip}`, 3, 3600);

    if (!success) {
      res.status(429).json({ error: 'Too many attempts' });
      return;
    }

    const { email, password, name } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword, role: 'TREKKER' }
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTRATION',
        ip,
        userAgent: req.headers['user-agent'] || 'unknown',
        metadata: { email }
      }
    });

    res.json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.format() });
      return;
    }
    console.error('Registration Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req: Request, res: Response) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const { email, password } = loginSchema.parse(req.body);

    const lockKey = `lockout:${email}`;
    if (redis) {
      const failedAttempts = await redis.get(lockKey);
      if (failedAttempts && parseInt(failedAttempts) >= 5) {
        res.status(423).json({ error: 'Account locked. Try again in 30 minutes.' });
        return;
      }
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      if (redis) { await redis.incr(lockKey); await redis.expire(lockKey, 1800); }
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      if (redis) { await redis.incr(lockKey); await redis.expire(lockKey, 1800); }
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (redis) await redis.del(lockKey);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SIGN_IN_SUCCESS',
        ip,
        userAgent: req.headers['user-agent'] || 'unknown',
        metadata: { provider: 'credentials' }
      }
    });

    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.format() });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── POST /api/auth/otp ───────────────────────────────────────────────────────
router.post('/otp', async (req: Request, res: Response) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1';
    const { phone } = otpRequestSchema.parse(req.body);
    const { success } = await rateLimit(`otp:${ip}`, 5, 600);

    if (!success) {
      res.status(429).json({ error: 'Too many requests' });
      return;
    }

    await generateOTP(phone);
    res.json({ message: 'OTP sent successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid phone number' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
