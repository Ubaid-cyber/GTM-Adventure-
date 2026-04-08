'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getUserMedicalProfileAction() {
  try {
    const session = await auth();
    if (!session || !session.user?.email) return null;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { medicalProfile: true }
    });

    return user?.medicalProfile || null;
  } catch (error) {
    console.error('getUserMedicalProfileAction Error:', error);
    return null;
  }
}

export async function updateUserMedicalProfileAction(data: { vitals: any, history: any, fitness?: any }) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) throw new Error('Unauthorized');

    const { vitals, history, fitness } = data;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { medicalProfile: true }
    });

    if (!user) throw new Error('User not found');

    const oldHistory = (user.medicalProfile?.history as any) || {};
    const newHistory = history || {};
    
    // Check for NEW risk factors
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

    revalidatePath('/dashboard');
    return { success: true, medicalProfile };
  } catch (error: any) {
    console.error('updateUserMedicalProfileAction Error:', error);
    return { success: false, error: error.message };
  }
}
