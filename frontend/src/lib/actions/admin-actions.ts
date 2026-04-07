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
export async function getAdminTreks() {
  await validateAdmin();
  return await prisma.trek.findMany({
    include: {
      guide: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Deletes a trek (if no bookings exist).
 */
export async function deleteTrek(id: string) {
  await validateAdmin();
  
  // Check for bookings first
  const trek = await prisma.trek.findUnique({
    where: { id },
    include: { _count: { select: { bookings: true } } }
  });

  if (trek?._count.bookings && trek?._count.bookings > 0) {
    throw new Error('Cannot delete a trek with existing bookings.');
  }

  await prisma.trek.delete({ where: { id } });
  revalidatePath('/adminControl/expeditions');
}

/**
 * Fetches all medical profiles awaiting review or clearance.
 */
export async function getAwaitingClearance() {
  await validateAdmin();
  return await prisma.medicalProfile.findMany({
    where: {
      status: {
        in: ['AWAITING_CLEARANCE', 'IN_REVIEW']
      }
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          profileImage: true
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
}

/**
 * Updates a user's medical clearance status.
 */
export async function updateMedicalStatus(userId: string, status: any) {
  await validateAdmin();
  
  await prisma.medicalProfile.update({
    where: { userId },
    data: { status }
  });

  revalidatePath('/adminControl/medical');
}

/**
 * Fetches all transactions for the accounting dashboard.
 */
export async function getAdminTransactions() {
  await validateAdmin();
  return await prisma.booking.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      trek: {
        select: {
          title: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Fetches all users for the management directory.
 */
export async function getAdminUsers() {
  await validateAdmin();
  return await prisma.user.findMany({
    include: {
      _count: {
        select: {
          bookings: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Updates a user's role (e.g. promoting Trekker to Leader).
 */
export async function updateUserRole(userId: string, role: any) {
  await validateAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { role }
  });
  revalidatePath('/adminControl/participants');
}

/**
 * Fetches all audit logs for the governance dashboard with optional search.
 */
export async function getAdminAuditLogs(query?: string) {
  await validateAdmin();
  return await prisma.auditLog.findMany({
    where: query ? {
      OR: [
        { action: { contains: query, mode: 'insensitive' } },
        { ip: { contains: query } },
        { userId: { contains: query } }
      ]
    } : {},
    orderBy: {
      createdAt: 'desc'
    },
    take: 100
  });
}

/**
 * Fetches aggregated financial statistics for the HQ Command Center.
 */
export async function getAdminFinancialStats() {
  await validateAdmin();

  // 1. Get total revenue breakdown by trek
  const trekRevenue = await prisma.booking.groupBy({
    by: ['trekId'],
    _sum: { totalPrice: true },
    where: { status: 'CONFIRMED' }
  });

  // 2. Hydrate trek titles for the breakdown
  const treks = await prisma.trek.findMany({
    where: { id: { in: trekRevenue.map(r => r.trekId) } },
    select: { id: true, title: true }
  });

  const revenueByTrek = trekRevenue.map(rev => ({
    trekId: rev.trekId,
    title: treks.find(t => t.id === rev.trekId)?.title || 'Unknown Trek',
    total: rev._sum.totalPrice || 0
  })).sort((a, b) => b.total - a.total);

  // 3. Get recent growth (Revenue this month vs last month)
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [thisMonthRev, lastMonthRev] = await Promise.all([
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { status: 'CONFIRMED', createdAt: { gte: startOfThisMonth } }
    }),
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { 
        status: 'CONFIRMED', 
        createdAt: { gte: startOfLastMonth, lt: startOfThisMonth } 
      }
    })
  ]);

  const thisMonthTotal = thisMonthRev._sum.totalPrice || 0;
  const lastMonthTotal = lastMonthRev._sum.totalPrice || 0;
  const growth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  return {
    revenueByTrek,
    thisMonthTotal,
    lastMonthTotal,
    growth: parseFloat(growth.toFixed(1))
  };
}

/**
 * Toggles a trek's visibility or status (Drafting for future).
 */
export async function toggleTrekStatus(id: string) {
  await validateAdmin();
  // Logic for status toggle if added to schema
}
