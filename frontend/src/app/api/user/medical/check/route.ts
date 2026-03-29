import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ safe: true }); // No account, no check
    }

    const { trekId } = await req.json();
    if (!trekId) return NextResponse.json({ error: 'trekId is required' }, { status: 400 });

    const trek = await prisma.trek.findUnique({
      where: { id: trekId }
    });

    if (!trek) return NextResponse.json({ error: 'Trek not found' }, { status: 404 });

    // Only Hard and Extreme treks trigger the safety banner
    const isHighDifficulty = trek.difficulty === 'HARD' || trek.difficulty === 'EXTREME';
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { medicalProfile: true }
    });

    if (!user || !user.medicalProfile) {
      return NextResponse.json({ 
        safe: !isHighDifficulty, 
        warning: isHighDifficulty ? "Profile Incomplete: Please complete your Health Passport to ensure safety on this high-altitude expedition." : null
      });
    }

    const { history } = user.medicalProfile as any;
    
    // Check for any reported conditions (Heart, Asthma, BP, etc.)
    const hasConditions = history && Object.values(history).some(val => val === true);

    if (isHighDifficulty && hasConditions) {
      return NextResponse.json({
        safe: false,
        warning: "GTM Mission Support: Your health is our primary mission. Because of the medical history reported in your profile, our Medical Specialists will assist you with a dedicated altitude-readiness consultation before you depart."
      });
    }

    return NextResponse.json({ safe: true });
  } catch (error: any) {
    console.error('Safety Check Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
