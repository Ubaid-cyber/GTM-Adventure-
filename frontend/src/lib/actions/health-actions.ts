'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Retrieves the medical profile for the current session user.
 * Replaces GET /api/user/medical
 */
export async function getMedicalProfileAction() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { medicalProfile: true }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return { success: true, profile: user.medicalProfile };
  } catch (error: any) {
    console.error('getMedicalProfileAction Error:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

/**
 * Updates the medical profile for the current session user.
 * Replaces POST /api/user/medical
 */
export async function updateMedicalProfileAction(data: { vitals: any, history: any }) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }

    const { vitals, history } = data;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { medicalProfile: true }
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const oldHistory = (user.medicalProfile?.history as any) || {};
    const newHistory = history || {};
    
    // Check if any NEW risk factor was added
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

    revalidatePath('/dashboard/health');
    return { success: true, profile: medicalProfile };
  } catch (error: any) {
    console.error('updateMedicalProfileAction Error:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

/**
 * Performs a safety check for a specific trek.
 * Replaces POST /api/user/medical/check
 */
export async function checkMedicalSafetyAction(trekId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return { success: true }; // No account, default to safe or handled by client
    }

    const trek = await prisma.trek.findUnique({
      where: { id: trekId }
    });

    if (!trek) return { success: false, error: 'Trek not found' };

    const isHighDifficulty = trek.difficulty === 'HARD' || trek.difficulty === 'EXTREME';
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { medicalProfile: true }
    });

    if (!user || !user.medicalProfile) {
      return { 
        safe: !isHighDifficulty, 
        warning: isHighDifficulty ? "Profile Incomplete: Please complete your Health Passport to ensure safety on this high-altitude trek." : null
      };
    }

    const { history } = user.medicalProfile as any;
    const hasConditions = history && Object.values(history).some(val => val === true);

    if (isHighDifficulty && hasConditions) {
      return {
        safe: false,
        warning: "GTM Trip Support: Your safety is our priority. Because of the medical history reported in your profile, our specialists will assist you with a dedicated readiness consultation before you depart."
      };
    }

    return { safe: true };
  } catch (error: any) {
    console.error('checkMedicalSafetyAction Error:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}
