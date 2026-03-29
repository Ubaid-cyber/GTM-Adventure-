import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    // In a real app, check for ADMIN/LEADER role here
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profiles = await prisma.medicalProfile.findMany({
      where: {
        status: { not: 'NONE' } // Only show profiles that have been filled/flagged
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json(profiles);
  } catch (error: any) {
    console.error('Fetch Admin Medical Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { sendTacticalEmail } from '@/lib/email';

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profileId, status, medicalNotes } = await req.json();

    const updated = await prisma.medicalProfile.update({
      where: { id: profileId },
      include: { 
        user: { select: { email: true, name: true } }
      },
      data: {
        status,
        medicalNotes
      }
    });

    // ─── Automatic Email Trigger for Mission Clearance ───────────────────────
    if (status === 'CLEARED' && updated.user?.email) {
      await sendTacticalEmail({
        to: updated.user.email,
        subject: '[SECURE] Mission Clearance: APPROVED',
        body: `SUBJECT: ${updated.user.name}\nSTATUS: MISSION CLEARANCE DETECTED\n\nYou have been authorized for high-altitude deployment by our Clinical Surgeons. This clearance remains active until manually terminated. Check your Mission Dashboard for deployment orders.`
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Update Admin Medical Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { profileId } = await req.json();

    const deleted = await prisma.medicalProfile.update({
      where: { id: profileId },
      data: {
        status: 'NONE' // "Deleting" means resetting the clearance request
      }
    });

    return NextResponse.json(deleted);
  } catch (error: any) {
    console.error('Reset Admin Medical Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
