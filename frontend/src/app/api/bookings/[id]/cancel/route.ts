import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = (await params).id;

    // Use transaction to ensure spots are restored correctly
    const result = await prisma.$transaction(async (tx: any) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { user: true }
      });

      if (!booking) throw new Error('BOOKING_NOT_FOUND');
      if (booking.user.email !== session.user?.email) throw new Error('FORBIDDEN');
      if (booking.status === 'CANCELLED') throw new Error('ALREADY_CANCELLED');
      if (booking.status === 'CONFIRMED') throw new Error('CANNOT_CANCEL_CONFIRMED');

      // 1. Restore spots to the trek
      await tx.trek.update({
        where: { id: booking.trekId },
        data: { availableSpots: { increment: booking.participants } }
      });

      // 2. Mark booking as CANCELLED
      const cancelledBooking = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' }
      });

      return cancelledBooking;
    });

    // 3. Log the cancellation
    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: 'BOOKING_CANCELLED',
        ip: req.headers.get('x-forwarded-for') || '127.0.0.1',
        metadata: { bookingId }
      }
    });

    return NextResponse.json({ success: true, booking: result });
  } catch (error: any) {
    if (error.message === 'BOOKING_NOT_FOUND') return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (error.message === 'ALREADY_CANCELLED') return NextResponse.json({ error: 'Booking already cancelled' }, { status: 400 });
    if (error.message === 'CANNOT_CANCEL_CONFIRMED') return NextResponse.json({ error: 'Cannot cancel a confirmed booking' }, { status: 400 });

    console.error('Cancel Booking Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
