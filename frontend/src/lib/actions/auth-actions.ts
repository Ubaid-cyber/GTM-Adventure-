'use server';

import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { headers } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/audit';
import { generateOTP } from '@/lib/otp';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

/**
 * Registers a new user.
 * Replaces /api/auth/register
 */
export async function registerUserAction(formData: any) {
  try {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = headerList.get('user-agent') || 'unknown';

    const { success } = await rateLimit(`register:${ip}`, 3, 3600);
    if (!success) {
      return { success: false, error: 'Too many registration attempts from this IP' };
    }

    const { email, password, name } = registerSchema.parse(formData);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'User already exists' };
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

    await logSecurityEvent('USER_REGISTRATION', user.id, { email }, ip, userAgent);

    return { 
      success: true, 
      user: { id: user.id, email: user.email, name: user.name } 
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Validation failed', details: error.format() };
    }
    console.error('Registration Action Error:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Sends a phone OTP.
 * Replaces /api/auth/phone (SEND_OTP action)
 */
export async function sendPhoneOtpAction(phone: string) {
  try {
    const headerList = await headers();
    const ip = headerList.get('x-forwarded-for') || 'unknown';
    const userAgent = headerList.get('user-agent') || 'unknown';

    if (!phone) {
      return { success: false, error: 'Phone number is required' };
    }

    const { success: limitSuccess } = await rateLimit(`otp:${phone}`, 5, 300);
    if (!limitSuccess) {
      return { success: false, error: 'Too many OTP requests. Please wait.' };
    }

    await generateOTP(phone);
    await logSecurityEvent('OTP_REQUESTED', undefined, { phone }, ip, userAgent);

    return { success: true, message: 'Verification code sent successfully' };
  } catch (error: any) {
    console.error('sendPhoneOtpAction Error:', error);
    return { success: false, error: error.message || 'Failed to send OTP' };
  }
}
