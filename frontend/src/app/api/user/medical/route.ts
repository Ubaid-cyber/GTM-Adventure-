import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { medicalProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user.medicalProfile || {});
  } catch (error: any) {
    console.error('Fetch Medical Profile Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vitals, history, fitness } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { medicalProfile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const oldHistory = (user.medicalProfile?.history as any) || {};
    const newHistory = history || {};
    
    // Check if any NEW risk factor was added (transition from false/null/undefined to true)
    const riskAdded = Object.keys(newHistory).some(key => 
      newHistory[key] === true && oldHistory[key] !== true
    );

    const currentStatus = user.medicalProfile?.status || 'NONE';
    let nextStatus = currentStatus;

    if (currentStatus === 'NONE' || riskAdded) {
      nextStatus = 'AWAITING_CLEARANCE';
    }

    const medicalProfile = await prisma.medicalProfile.upsert({
      where: { userId: user.id },
      update: {
        vitals: vitals || {},
        history: history || {},
        status: nextStatus,
      },
      create: {
        userId: user.id,
        vitals: vitals || {},
        history: history || {},
        status: 'AWAITING_CLEARANCE',
      },
    });

    return NextResponse.json({ success: true, medicalProfile });
  } catch (error: any) {
    console.error('Update Medical Profile Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
