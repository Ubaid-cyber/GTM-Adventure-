import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, verifyOTP } from '@/lib/otp';
import { prisma } from '@/lib/prisma';
import { logSecurityEvent } from '@/lib/audit';

/**
 * Mobile Login API (Phone + OTP)
 * Standard flow for high-intent mobile users.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code, action } = body;
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // ACTION: SEND_OTP
    if (action === 'SEND_OTP') {
      await generateOTP(phone);
      await logSecurityEvent('OTP_REQUESTED', undefined, { phone }, ip, userAgent);
      return NextResponse.json({ success: true, message: 'Verification code sent successfully' });
    }

    // ACTION: VERIFY_OTP
    if (action === 'VERIFY_OTP') {
      const fs = await import('fs');
      try {
        fs.appendFileSync('debug_otp.log', `[${new Date().toISOString()}] VERIFY: ${phone}, CODE: ${code}\n`);
      } catch(e) {}

      if (!code) {
        return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
      }

      const isValid = await verifyOTP(phone, code);
      
      try {
        fs.appendFileSync('debug_otp.log', `[${new Date().toISOString()}] RESULT: ${isValid}\n`);
      } catch(e) {}

      if (!isValid) {
        await logSecurityEvent('OTP_VERIFICATION_FAILED', undefined, { phone }, ip, userAgent);
        return NextResponse.json({ error: 'Invalid or expired code' }, { status: 401 });
      }

      // 1. Session-based Verification (Update existing user)
      const { auth } = await import('@/lib/auth');
      const session = await auth();

      if (session?.user?.id) {
        // Check if phone already taken by ANOTHER user using Raw SQL
        const existingUsers: any[] = await prisma.$queryRawUnsafe(
          `SELECT id FROM "User" WHERE "phone" = $1 LIMIT 1`,
          phone
        );

        if (existingUsers.length > 0 && existingUsers[0].id !== session.user.id) {
           return NextResponse.json({ error: 'This phone number is already linked to another account.' }, { status: 400 });
        }

        try {
          await prisma.$executeRawUnsafe(
            `UPDATE "User" SET "phone" = $1 WHERE "id" = $2`,
            phone,
            session.user.id
          );
          await logSecurityEvent('USER_PHONE_VERIFIED', session.user.id, { phone }, ip, userAgent);
          return NextResponse.json({ success: true, message: 'Phone verified and linked to your account' });
        } catch (err) {
          console.error('[API Phone Auth] SQL Update Trace:', err);
          return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
        }
      }

      // 2. Public-based Verification (Login/Signup) - Raw SQL Only
      let users: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM "User" WHERE "phone" = $1 LIMIT 1`,
        phone
      );
      
      let user = users.length > 0 ? users[0] : null;

      if (!user) {
        // Fallback to email mock search
        users = await prisma.$queryRawUnsafe(
          `SELECT * FROM "User" WHERE "email" = $1 LIMIT 1`,
          `${phone}@gtm-adventure.mobile`
        );
        user = users.length > 0 ? users[0] : null;

        if (user) {
           // Upgrade user
           await prisma.$executeRawUnsafe(
             `UPDATE "User" SET "phone" = $1 WHERE "id" = $2`,
             phone,
             user.id
           );
        }
      }

      if (!user) {
        // Create new user via Raw SQL
        const userId = `u-${Math.random().toString(36).slice(2, 11)}`;
        await prisma.$executeRawUnsafe(
          `INSERT INTO "User" ("id", "name", "email", "phone", "role") VALUES ($1, $2, $3, $4, 'TREKKER')`,
          userId,
          `User-${phone.slice(-4)}`,
          `${phone}@gtm-adventure.mobile`,
          phone
        );
        
        users = await prisma.$queryRawUnsafe(
          `SELECT * FROM "User" WHERE "id" = $1 LIMIT 1`,
          userId
        );
        user = users[0];
      }

      await logSecurityEvent('LOGIN_SUCCESS_PHONE', user.id, { phone }, ip, userAgent);
      
      return NextResponse.json({ 
        success: true, 
        user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone } 
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[API Phone Auth] Error:', error.message);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
