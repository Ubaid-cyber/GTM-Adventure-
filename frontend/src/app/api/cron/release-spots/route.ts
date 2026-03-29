import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure Next.js doesn't cache this cron job

export async function GET(req: NextRequest) {
  try {
    // 1. Authorization Security Check
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('Unauthorized Cron Job execution attempt.');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Find Expired Bookings (10 minutes old)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: tenMinutesAgo,
        },
      },
      select: {
        id: true,
        trekId: true,
        participants: true,
      },
    });

    if (expiredBookings.length === 0) {
      return NextResponse.json({ message: 'No expired pending bookings found.' });
    }

    // 3. Process cancellations atomically
    const releasedSpots: string[] = [];

    for (const booking of expiredBookings) {
      await prisma.$transaction(async (tx: any) => {
        // Double check status to avoid race conditions
        const currentBooking = await tx.booking.findUnique({
          where: { id: booking.id },
          select: { status: true }
        });

        if (currentBooking?.status !== 'PENDING') return;

        // Restore spots
        await tx.trek.update({
          where: { id: booking.trekId },
          data: {
            availableSpots: { increment: booking.participants },
          },
        });

        // Mark as cancelled
        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });

        releasedSpots.push(booking.id);
      });
    }

    console.log(`Cron: Released spots for ${releasedSpots.length} abandoned bookings.`);
    
    return NextResponse.json({
      success: true,
      releasedBookings: releasedSpots.length,
      bookingsModified: releasedSpots
    });

  } catch (error: any) {
    console.error('Cron Error releasing spots:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
