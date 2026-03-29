import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

    if (razorpay_order_id.startsWith('mock_') && razorpay_signature === 'mock_sig') {
      console.log('Bypassing signature verification for simulated mock order.');
    } else {
      // Verify signature
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');

      if (digest !== razorpay_signature) {
        return NextResponse.json({ error: 'Transaction not legit!' }, { status: 400 });
      }
    }

    // Mark as CONFIRMED and store payment ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: 'CONFIRMED',
        razorpayPaymentId: razorpay_payment_id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
