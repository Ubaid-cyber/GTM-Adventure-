import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookingId = (await params).id;

    const activeBooking = await prisma.expedition.findUnique({
      where: { id: bookingId },
      include: {
        trek: {
          select: {
            title: true,
            maxAltitude: true,
            durationDays: true,
          }
        },
        bookings: {
          where: {
            user: { email: session.user.email },
            status: 'CONFIRMED'
          }
        }
      }
    });

    if (!activeBooking) {
      return NextResponse.json({ error: 'Booking details not found' }, { status: 404 });
    }

    // Security: Only allow if user has a confirmed booking for this trek
    if (activeBooking.bookings.length === 0) {
      return NextResponse.json({ error: 'Access Denied: No confirmed booking found' }, { status: 403 });
    }

    return NextResponse.json(activeBooking);
  } catch (error: any) {
    console.error('Fetch Active Booking Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
