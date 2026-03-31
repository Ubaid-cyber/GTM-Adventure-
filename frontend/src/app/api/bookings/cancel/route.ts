import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logSecurityEvent } from '@/lib/audit';

/**
 * Tactical Service: Booking Cancellation Perimeter
 * Enforces tiered refund logic and high-fidelity audit logging.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Signal lost. Re-authentication required.' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId } = body;
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    if (!bookingId) {
      return NextResponse.json({ error: 'Valid booking identifier required.' }, { status: 400 });
    }

    // 1. Fetch booking with expedition details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        trek: true,
        expedition: true
      }
    });

    if (!booking || booking.userId !== (session.user as any).id) {
      await logSecurityEvent('UNAUTHORIZED_CANCELLATION_ATTEMPT', (session.user as any).id, { bookingId }, ip, userAgent);
      return NextResponse.json({ error: 'Access Denied: Booking not found or unauthorized.' }, { status: 403 });
    }

    if (booking.status === 'CANCELLED') {
      return NextResponse.json({ error: 'Mission already aborted.' }, { status: 400 });
    }

    // 2. Tiered Refund Logic Calculation
    const today = new Date();
    // If no expedition is assigned, we assume a flexible date and 90% refund
    const trekStart = booking.expedition?.startDate || new Date(today.getTime() + 40 * 24 * 60 * 60 * 1000); 
    const diffTime = trekStart.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    let refundContext = "No refund (Less than 7 days left)";

    if (diffDays > 30) {
      refundPercentage = 90;
      refundContext = "90% Refund (Standard 10% fee)";
    } else if (diffDays >= 7) {
      refundPercentage = 50;
      refundContext = "50% Partial Refund";
    } else {
      refundPercentage = 0;
      refundContext = "Non-refundable (Less than 7 days left)";
    }

    const refundAmount = Math.round((booking.totalPrice * refundPercentage) / 100);
    let refundId = null;

    // 3. Razorpay Refund Execution (Only if paid and refund > 0)
    if (booking.razorpayPaymentId && refundAmount > 0) {
      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({
        key_id: (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').replace(/['"]+/g, ''),
        key_secret: (process.env.RAZORPAY_KEY_SECRET || '').replace(/['"]+/g, ''),
      });

      try {
        const refundResponse = await razorpay.payments.refund(booking.razorpayPaymentId, {
          amount: refundAmount * 100, // Convert to Paise
          notes: { 
            bookingId: booking.id, 
            reason: 'User initiated cancellation' 
          }
        });
        refundId = refundResponse.id;
      } catch (refundErr: any) {
        console.error('[RAZORPAY REFUND ERROR]', refundErr);
        // We log it but proceed to update our status, perhaps for manual follow-up if it fails
      }
    }

    // 4. Persistent State Update
    await (prisma.booking as any).update({
      where: { id: bookingId },
      data: { 
        status: 'CANCELLED',
        refundAmount,
        refundId: refundId as string
      }
    });

    // 5. Audit Log Persistence
    await logSecurityEvent('BOOKING_CANCELLED', (session.user as any).id, { 
      bookingId, 
      refundAmount,
      refundPercentage, 
      refundId,
      daysRemaining: diffDays 
    }, ip, userAgent);

    return NextResponse.json({ 
      success: true, 
      message: 'Trek cancelled successfully.',
      refundAmount,
      refundPercentage,
      refundContext
    });

  } catch (error: any) {
    console.error('[API Booking Cancel] Critical failure:', error.message);
    return NextResponse.json({ error: 'Cancellation could not be processed at this time. Please try again or contact support.' }, { status: 500 });
  }
}
