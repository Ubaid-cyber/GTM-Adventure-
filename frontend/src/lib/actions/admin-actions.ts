'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redis } from '@/lib/redis';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

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
 * Validates that the current user has the MEDICAL role.
 * Completely isolated from admin — doctors only.
 */
async function validateMedical() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role !== 'MEDICAL') {
    throw new Error('Unauthorized: Medical Officer access required');
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
          title: true,
          price: true
        }
      },
      expedition: {
        select: {
          startDate: true,
          status: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Initiates a refund for a booking from the admin panel.
 */
export async function adminRefundBooking(bookingId: string) {
  await validateAdmin();

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        trek: true,
        expedition: true
      }
    });

    if (!booking) throw new Error('Booking not found');
    if (booking.status === 'CANCELLED' && booking.refundId) {
      throw new Error('This booking has already been refunded.');
    }

    // 1. Calculate Refund (Same logic as user cancellation)
    const today = new Date();
    const trekStart = booking.expedition?.startDate || new Date(today.getTime() + 40 * 24 * 60 * 60 * 1000); 
    const diffDays = Math.ceil((trekStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    if (diffDays > 30) refundPercentage = 90;
    else if (diffDays >= 7) refundPercentage = 50;

    const refundAmount = Math.round((booking.totalPrice * refundPercentage) / 100);
    let refundId = null;

    // 2. Razorpay Payout
    if (booking.razorpayPaymentId && refundAmount > 0) {
      const Razorpay = (await import('razorpay')).default;
      const razorpay = new Razorpay({
        key_id: (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').replace(/['"]+/g, ''),
        key_secret: (process.env.RAZORPAY_KEY_SECRET || '').replace(/['"]+/g, ''),
      });

      const refundResponse = await razorpay.payments.refund(booking.razorpayPaymentId, {
        amount: refundAmount * 100, // Paise
        notes: { bookingId, initiator: 'ADMIN_PROCESSED' }
      });
      refundId = refundResponse.id;
    }

    // 3. Update Status
    await (prisma.booking as any).update({
      where: { id: bookingId },
      data: { 
        status: 'CANCELLED',
        refundAmount,
        refundId: refundId as string
      }
    });

    revalidatePath('/adminControl/financials');
    return { success: true, refundAmount, refundId };

  } catch (error: any) {
    console.error('[Admin Refund Action] Error:', error.message);
    throw new Error(error.message || 'Refund processing failed.');
  }
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

  // Optimization: Create a Hash Map for O(1) lookup (Better Approach)
  const trekMap = treks.reduce((acc, t) => {
    acc[t.id] = t.title;
    return acc;
  }, {} as Record<string, string>);

  const revenueByTrek = trekRevenue.map(rev => ({
    trekId: rev.trekId,
    title: trekMap[rev.trekId] || 'Unknown Trek',
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

/**
 * Manually confirms a PENDING booking (Admin only).
 */
export async function confirmBookingManually(bookingId: string) {
  await validateAdmin();
  
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true, trek: true }
  });

  if (!booking) throw new Error('Booking not found');
  if (booking.status !== 'PENDING') {
    throw new Error(`Cannot manually confirm a booking that is currently ${booking.status}`);
  }

  // 1. Update Booking
  await prisma.booking.update({
    where: { id: bookingId },
    data: { 
      status: 'CONFIRMED',
      internalNotes: `Manually confirmed by Admin on ${new Date().toISOString()}`
    }
  });

  // 2. Create Audit Log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'MANUAL_PAYMENT_CONFIRMATION',
      ip: 'SECURE_INTERNAL',
      metadata: {
        bookingId: booking.id,
        userEmail: booking.user.email,
        trekTitle: booking.trek.title,
        confirmedBy: session?.user?.email
      }
    }
  });

  revalidatePath('/adminControl/financials');
  return { success: true };
}

/**
 * Blocks an IP address and logs it. (Admin only)
 */
export async function blockIP(ip: string, reason: string = 'MALICIOUS_ACTIVITY') {
  await validateAdmin();
  const session = await auth();
  const userId = (session?.user as any)?.id;

  // 1. Add to Database
  await (prisma as any).blockedIP.upsert({
    where: { ip },
    update: { reason, blockedBy: userId },
    create: { ip, reason, blockedBy: userId }
  });

  // 2. Add to Redis for fast middleware lookup (Global Shield)
  if (redis) {
    await redis.set(`blocked_ip:${ip}`, '1');
  }

  // 3. Audit Log
  await prisma.auditLog.create({
    data: {
      userId,
      action: 'SECURITY_IP_BLOCKED',
      ip: 'SECURE_INTERNAL',
      metadata: { blockedIp: ip, reason }
    }
  });

  revalidatePath('/adminControl/financials');
  return { success: true };
}

/**
 * Unblocks an IP address. (Admin only)
 */
export async function unblockIP(ip: string) {
  await validateAdmin();
  const session = await auth();

  // 1. Remove from Database
  await (prisma as any).blockedIP.deleteMany({ where: { ip } });

  // 2. Remove from Redis
  if (redis) {
    await redis.del(`blocked_ip:${ip}`);
  }

  // 3. Audit Log
  await prisma.auditLog.create({
    data: {
      userId: (session?.user as any)?.id,
      action: 'SECURITY_IP_UNBLOCKED',
      ip: 'SECURE_INTERNAL',
      metadata: { unblockedIp: ip }
    }
  });

  revalidatePath('/adminControl/financials');
  return { success: true };
}

/**
 * Fetches the current list of blocked IPs.
 */
export async function getBlockedIPs() {
  await validateAdmin();
  return (prisma as any).blockedIP.findMany({
  });
}

/**
 * Medical Administration Actions
 */

export async function getAllMedicalProfiles() {
  await validateMedical();
  return await prisma.medicalProfile.findMany({
    where: {
      status: { not: 'NONE' }
    },
    include: {
      user: {
        select: { name: true, email: true }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function updateMedicalNotesStatus(profileId: string, status: any, medicalNotes?: string) {
  await validateMedical();
  
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

  // Automatic Email Trigger
  if (status === 'CLEARED' && updated.user?.email) {
    const { sendNotificationEmail } = await import('@/lib/email');
    await sendNotificationEmail({
      to: updated.user.email,
      subject: '[SECURE] Trek Clearance: APPROVED',
      body: `SUBJECT: ${updated.user.name}\nSTATUS: TREK CLEARANCE DETECTED\n\nYou have been authorized for high-altitude departure by our specialists. This clearance remains active for your upcoming trip. Check your Trip Dashboard for details.`
    });
  }

  revalidatePath('/adminControl/medical');
  return { success: true };
}

export async function resetMedicalClearance(profileId: string) {
  await validateMedical();
  
  await prisma.medicalProfile.update({
    where: { id: profileId },
    data: {
      status: 'NONE'
    }
  });

  revalidatePath('/adminControl/medical');
  return { success: true };
}

/**
 * Fetches all active expeditions for the Mission Oversight dashboard.
 */
export async function getActiveMissionsAction() {
  await validateAdmin();

  return await prisma.expedition.findMany({
    where: {
      status: 'ONGOING'
    },
    include: {
      trek: {
        include: {
          guide: {
            select: {
              name: true,
              profileImage: true
            }
          }
        }
      },
      sitreps: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      },
      checklists: {
        where: {
          status: 'VERIFIED'
        }
      }
    },
    orderBy: {
      startDate: 'asc'
    }
  });
}
