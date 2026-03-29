import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const { success } = await rateLimit(`register:${ip}`, 3, 3600);

    if (!success) {
      return NextResponse.json({ error: 'Too many registration attempts from this IP' }, { status: 429 });
    }

    const body = await req.json();
    const { email, password, name } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'TREKKER',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTRATION',
        ip,
        userAgent: req.headers.get('user-agent') || 'unknown',
        metadata: { email },
      },
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.format() }, { status: 400 });
    }
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
