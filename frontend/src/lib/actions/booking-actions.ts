'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { BookingStatus } from '@prisma/client';

export async function getBookings() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          }
        },
        trek: {
          select: {
            id: true,
            title: true,
            price: true,
          }
        },
        expedition: {
          select: {
            id: true,
            startDate: true,
            status: true,
          }
        },
        assignedStaff: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
    return bookings;
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    throw new Error('Could not retrieve booking records.');
  }
}

export async function updateBookingNotes(id: string, notes: string) {
  try {
    await prisma.booking.update({
      where: { id },
      data: { internalNotes: notes }
    });
    revalidatePath('/adminControl/bookings');
    return { success: true };
  } catch (error) {
    console.error('Failed to update booking notes:', error);
    throw new Error('Action failed: Could not save notes.');
  }
}

export async function updateMedicalClearance(id: string, cleared: boolean) {
  try {
    await prisma.booking.update({
      where: { id },
      data: { medicalCleared: cleared }
    });
    revalidatePath('/adminControl/bookings');
    return { success: true };
  } catch (error) {
    console.error('Failed to update medical status:', error);
    throw new Error('Action failed: Could not update medical status.');
  }
}

export async function assignStaffToBooking(bookingId: string, staffId: string | null) {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { assignedStaffId: staffId }
    });
    revalidatePath('/adminControl/bookings');
    return { success: true };
  } catch (error) {
    console.error('Failed to assign staff:', error);
    throw new Error('Action failed: Could not assign staff.');
  }
}

export async function getStaffMembers() {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: 'LEADER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      }
    });
    return staff;
  } catch (error) {
    console.error('Failed to fetch staff members:', error);
    throw new Error('Could not retrieve staff directory.');
  }
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  try {
    await prisma.booking.update({
      where: { id },
      data: { status }
    });
    revalidatePath('/adminControl/bookings');
    return { success: true };
  } catch (error) {
    console.error('Failed to update booking status:', error);
    throw new Error('Operation failed: Could not update status.');
  }
}

export async function deleteBooking(id: string) {
  try {
    await prisma.booking.delete({
      where: { id }
    });
    revalidatePath('/adminControl/bookings');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete booking:', error);
    throw new Error('Operation failed: Could not delete record.');
  }
}
