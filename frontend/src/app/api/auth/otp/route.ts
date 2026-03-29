import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { generateOTP } from '@/lib/otp';

const otpRequestSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await req.json();
    const { phone } = otpRequestSchema.parse(body);

    const { success } = await rateLimit(`otp:${ip}`, 5, 600);
    if (!success) {
      return NextResponse.json({ error: 'Too many OTP requests' }, { status: 429 });
    }

    await generateOTP(phone);
    
    return NextResponse.json({ message: 'OTP sent successfully (check console in dev)' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 });
    }
    console.error('OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
