import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/bookings/[id]
 * Fetches single booking details for resume flow or detail view.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        trek: {
          select: {
            id: true,
            title: true,
            price: true,
            location: true,
            availableSpots: true,
            coverImage: true,
          }
        },
        user: {
          select: { email: true }
        }
      }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Security check: Only owner or ADMIN can view
    if (booking.user.email !== session.user?.email) {
      return NextResponse.json({ error: 'Access Denied' }, { status: 403 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error: any) {
    console.error('Fetch Single Booking Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/bookings/[id]
 * Updates participant count for an existing PENDING booking.
 * Note: This requires complex spot adjustment logic.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { participants } = await req.json();
    const newParticipants = parseInt(participants);

    if (isNaN(newParticipants) || newParticipants <= 0) {
      return NextResponse.json({ error: 'Invalid participant count' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Lock the booking and trek
      const booking = await tx.booking.findUnique({
        where: { id },
        include: { user: true, trek: true }
      });

      if (!booking) throw new Error('NOT_FOUND');
      if (booking.user.email !== session.user?.email) throw new Error('FORBIDDEN');
      if (booking.status !== 'PENDING') throw new Error('INVALID_STATUS');

      const diff = newParticipants - booking.participants;
      
      if (diff === 0) return booking; // No change

      // 2. Lock trek for update to adjust spots
      const trek: any[] = await tx.$queryRaw`
        SELECT "availableSpots" FROM "Trek" WHERE id = ${booking.trekId} FOR UPDATE
      `;
      
      const currentSpots = trek[0]?.availableSpots || 0;

      if (diff > 0 && currentSpots < diff) {
        throw new Error('NOT_ENOUGH_SPOTS');
      }

      // 3. Update Trek spots (inversely: more participants = fewer spots)
      await tx.trek.update({
        where: { id: booking.trekId },
        data: { availableSpots: { decrement: diff } }
      });

      // 4. Update Booking
      const updatedBooking = await tx.booking.update({
        where: { id },
        data: { 
          participants: newParticipants,
          totalPrice: (booking.trek.price || 0) * newParticipants
        }
      });

      return updatedBooking;
    });

    return NextResponse.json({ success: true, booking: result });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    if (error.message === 'FORBIDDEN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (error.message === 'NOT_ENOUGH_SPOTS') return NextResponse.json({ error: 'Not enough spots available for the update.' }, { status: 400 });
    
    console.error('Update Booking Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
