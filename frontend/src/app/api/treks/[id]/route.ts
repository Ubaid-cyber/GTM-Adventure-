import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Trek ID is required' }, { status: 400 });
    }

    const trek = await prisma.trek.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: { name: true, profileImage: true },
            },
          },
        },
      },
    });

    if (!trek) {
      return NextResponse.json({ error: 'Trek not found' }, { status: 404 });
    }

    // Exclude the embedding completely from the response payload for performance
    const { embedding, ...trekData } = trek;

    return NextResponse.json({ success: true, trek: trekData });
  } catch (error: any) {
    console.error('Fetch Trek Error:', error);
    return NextResponse.json({ error: 'Failed to fetch trek details' }, { status: 500 });
  }
}
