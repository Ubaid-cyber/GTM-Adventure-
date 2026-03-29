import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyCredentials } from '@/lib/auth-service';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await verifyCredentials(email, password, ip, userAgent);

    return NextResponse.json({ user });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.format() }, { status: 400 });
    }
    if (error.message === 'ACCOUNT_LOCKED') {
      return NextResponse.json({ error: 'Account locked. Try again in 30 minutes.' }, { status: 423 });
    }
    if (error.message === 'INVALID_CREDENTIALS') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
