'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Validates that the current user has the ADMIN role.
 */
async function validateAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * Fetches all treks for the management dashboard.
 */
export async function getAdminTours() {
  await validateAdmin();
  return await prisma.trek.findMany({
    include: {
      _count: {
        select: {
          bookings: true,
          expeditions: true
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Fetches a single trek by ID for editing.
 */
export async function getTourById(id: string) {
  await validateAdmin();
  return await prisma.trek.findUnique({
    where: { id },
  });
}

/**
 * Creates or updates a tour package.
 */
export async function upsertTour(data: any) {
  await validateAdmin();
  
  const { id, ...payload } = data;

  if (id) {
    // Update
    const tour = await prisma.trek.update({
      where: { id },
      data: payload,
    });
    revalidatePath('/adminControl/tours');
    revalidatePath(`/adminControl/tours/${id}/edit`);
    return tour;
  } else {
    // Create
    const tour = await prisma.trek.create({
      data: payload,
    });
    revalidatePath('/adminControl/tours');
    return tour;
  }
}

/**
 * Deletes a tour package.
 * Blocked if active bookings or expeditions exist.
 */
export async function deleteTour(id: string) {
  await validateAdmin();

  const tour = await prisma.trek.findUnique({
    where: { id },
    include: { 
      _count: { 
        select: { 
          bookings: true,
          expeditions: true 
        } 
      } 
    }
  });

  if (!tour) throw new Error('Tour not found');

  if (tour._count.bookings > 0 || tour._count.expeditions > 0) {
    throw new Error('Safety Protocol: Cannot delete a tour with active bookings or expeditions.');
  }

  await prisma.trek.delete({ where: { id } });
  revalidatePath('/adminControl/tours');
}
