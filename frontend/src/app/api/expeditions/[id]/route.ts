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

    const expeditionId = (await params).id;

    const expedition = await prisma.expedition.findUnique({
      where: { id: expeditionId },
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

    if (!expedition) {
      return NextResponse.json({ error: 'Expedition not found' }, { status: 404 });
    }

    // Security: Only allow if user has a confirmed booking for this expedition
    if (expedition.bookings.length === 0) {
      return NextResponse.json({ error: 'Access Denied: No confirmed booking found' }, { status: 403 });
    }

    return NextResponse.json(expedition);
  } catch (error: any) {
    console.error('Fetch Expedition Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
