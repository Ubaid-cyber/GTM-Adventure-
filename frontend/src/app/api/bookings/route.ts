import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { trekId, participants, userEmail } = await req.json();
    const numParticipants = parseInt(participants);

    if (!trekId || isNaN(numParticipants) || numParticipants <= 0 || !userEmail) {
      return NextResponse.json({ error: 'Invalid booking data' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ─── Atomic Transaction with Row-Level Locking ────────────────────────────
    const result = await prisma.$transaction(async (tx: any) => {
      const trek: any[] = await tx.$queryRaw`
        SELECT id, price, "availableSpots", "title"
        FROM "Trek"
        WHERE id = ${trekId}
        FOR UPDATE
      `;

      if (!trek || trek.length === 0) throw new Error('Trek not found');

      const selectedTrek = trek[0];
      const spotsRemaining = selectedTrek.availableSpots ?? 15;

      if (spotsRemaining < numParticipants) throw new Error('NOT_ENOUGH_SPOTS');

      const totalPrice = selectedTrek.price * numParticipants;

      const booking = await tx.booking.create({
        data: {
          userId: user.id,
          trekId: selectedTrek.id,
          participants: numParticipants,
          totalPrice,
          status: 'PENDING',
        },
      });

      await tx.trek.update({
        where: { id: selectedTrek.id },
        data: { availableSpots: { decrement: numParticipants } },
      });

      return { booking, trekTitle: selectedTrek.title };
    });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'TREK_BOOKED',
        ip,
        userAgent: req.headers.get('user-agent') || 'unknown',
        metadata: { trekId, participants: numParticipants },
      },
    });

    return NextResponse.json({
      success: true,
      booking: result.booking,
      message: `Successfully booked ${numParticipants} spot(s) for ${result.trekTitle}`,
    });
  } catch (error: any) {
    if (error.message === 'NOT_ENOUGH_SPOTS') {
      return NextResponse.json({ error: 'Sorry, not enough spots available for this trek.' }, { status: 400 });
    }
    console.error('Booking Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json([]);
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        trek: {
          select: {
            id: true,
            title: true,
            coverImage: true,
            location: true,
            durationDays: true,
          },
        },
        expedition: {
          select: {
            id: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Fetch Bookings Error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
