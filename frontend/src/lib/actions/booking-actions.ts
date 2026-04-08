'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { logSecurityEvent } from '@/lib/audit';
import Razorpay from 'razorpay';
import crypto from 'crypto';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

/**
 * RECOVERY LAYER: Strict Raw SQL implementation
 * Required because Prisma Binary is missing/unreliable in this environment.
 */

const generateId = () => Math.random().toString(36).substring(2, 10) + Date.now();

export async function getBookings() {
  try {
    const bookings = await (prisma as any).$queryRaw`
      SELECT 
        b.*,
        u.name as "userName", u.email as "userEmail", u.profile_image as "userProfileImage",
        t.title as "trekTitle", t.price as "trekPrice",
        e."startDate" as "expeditionStartDate", e.status as "expeditionStatus",
        s.name as "staffName", s.email as "staffEmail"
      FROM "Booking" b
      LEFT JOIN "User" u ON b."userId" = u.id
      LEFT JOIN "Trek" t ON b."trekId" = t.id
      LEFT JOIN "Expedition" e ON b."expeditionId" = e.id
      LEFT JOIN "User" s ON b."assignedStaffId" = s.id
      ORDER BY b."createdAt" DESC
    `;
    
    // Format to match component expectations
    return Array.isArray(bookings) ? bookings.map((b: any) => ({
      ...b,
      user: { id: b.userId, name: b.userName, email: b.userEmail, profileImage: b.userProfileImage },
      trek: { id: b.trekId, title: b.trekTitle, price: b.trekPrice },
      expedition: b.expeditionId ? { id: b.expeditionId, startDate: b.expeditionStartDate, status: b.expeditionStatus } : null,
      assignedStaff: b.assignedStaffId ? { id: b.assignedStaffId, name: b.staffName, email: b.staffEmail } : null
    })) : [];
  } catch (error) {
    console.error('Failed to fetch bookings (Raw SQL):', error);
    return [];
  }
}

export async function updateBookingNotes(id: string, notes: string) {
  try {
    await (prisma as any).$executeRaw`
      UPDATE "Booking" SET "internalNotes" = ${notes}, "updatedAt" = NOW() WHERE id = ${id}
    `;
    revalidatePath('/adminControl/bookings');
    return { success: true };
  } catch (error) {
    console.error('Failed to update notes (Raw SQL):', error);
    return { success: false };
  }
}

export async function updateMedicalClearance(id: string, cleared: boolean) {
  try {
    await (prisma as any).$executeRaw`
      UPDATE "Booking" SET "medicalCleared" = ${cleared}, "updatedAt" = NOW() WHERE id = ${id}
    `;
    revalidatePath('/adminControl/bookings');
    return { success: true };
  } catch (error) {
    console.error('Failed to update medical status (Raw SQL):', error);
    return { success: false };
  }
}

export async function assignStaffToBooking(bookingId: string, staffId: string | null) {
  try {
    await (prisma as any).$executeRaw`
      UPDATE "Booking" SET "assignedStaffId" = ${staffId}, "updatedAt" = NOW() WHERE id = ${bookingId}
    `;
    revalidatePath('/adminControl/bookings');
    return { success: true };
  } catch (error) {
    console.error('Failed to assign staff (Raw SQL):', error);
    return { success: false };
  }
}

export async function getStaffMembers() {
  try {
    const staff = await (prisma as any).$queryRaw`
      SELECT id, name, email, role FROM "User" WHERE role = 'LEADER'
    `;
    return staff || [];
  } catch (err) {
    return [];
  }
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  try {
    await (prisma as any).$executeRaw`
      UPDATE "Booking" SET status = ${status}, "updatedAt" = NOW() WHERE id = ${id}
    `;
    revalidatePath('/adminControl/bookings');
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function deleteBooking(id: string) {
  try {
    await (prisma as any).$executeRaw`DELETE FROM "Booking" WHERE id = ${id}`;
    revalidatePath('/adminControl/bookings');
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

/**
 * MISSION READY BOOKING ACTIONS (Refactored to Strict Raw SQL)
 */

export async function startBookingAction(trekId: string, participants: number) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) throw new Error('AUTH_REQUIRED');
    const userEmail = session.user.email;

    const result = await (prisma as any).$transaction(async (tx: any) => {
      // 1. Lock Trek
      const treks: any[] = await tx.$queryRaw`
        SELECT id, price, "availableSpots", title
        FROM "Trek"
        WHERE id = ${trekId}
        FOR UPDATE
      `;

      if (!treks || treks.length === 0) throw new Error('TREK_NOT_FOUND');
      const trek = treks[0];
      if (trek.availableSpots < participants) throw new Error('NOT_ENOUGH_SPOTS');

      // 2. Resolve User
      const users: any[] = await tx.$queryRaw`SELECT id FROM "User" WHERE email = ${userEmail}`;
      if (!users || users.length === 0) throw new Error('USER_NOT_FOUND');
      const userId = users[0].id;

      const basePrice = trek.price * participants;
      const gstAmount = Math.round(basePrice * 0.05);
      const totalPrice = basePrice + gstAmount;
      const bookingId = generateId();

      // 3. Create Booking
      await tx.$executeRaw`
        INSERT INTO "Booking" (id, "userId", "trekId", participants, "basePrice", "gstAmount", "totalPrice", status, "createdAt", "updatedAt")
        VALUES (${bookingId}, ${userId}, ${trekId}, ${participants}, ${basePrice}, ${gstAmount}, ${totalPrice}, 'PENDING', NOW(), NOW())
      `;

      // 4. Update Trek Spots
      await tx.$executeRaw`
        UPDATE "Trek" SET "availableSpots" = "availableSpots" - ${participants} WHERE id = ${trekId}
      `;

      return { id: bookingId };
    });

    return { success: true, booking: result };
  } catch (error: any) {
    console.error('startBookingAction Error:', error);
    return { success: false, error: error.message };
  }
}

export async function getBookingProgress(bookingId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) throw new Error('AUTH_REQUIRED');
    const userEmail = session.user.email;

    const bookings: any[] = await (prisma as any).$queryRaw`
      SELECT b.*, t.title as "trekTitle", t.price as "trekPrice"
      FROM "Booking" b
      JOIN "Trek" t ON b."trekId" = t.id
      JOIN "User" u ON b."userId" = u.id
      WHERE b.id = ${bookingId} AND u.email = ${userEmail}
      LIMIT 1
    `;

    if (!bookings || bookings.length === 0) throw new Error('BOOKING_NOT_FOUND');
    const b = bookings[0];
    
    return { 
      success: true, 
      booking: { ...b, trek: { title: b.trekTitle, price: b.trekPrice } } 
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function cancelPendingBookingAction(bookingId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) throw new Error('AUTH_REQUIRED');
    const userEmail = session.user.email;

    await (prisma as any).$transaction(async (tx: any) => {
      const bookings: any[] = await tx.$queryRaw`
        SELECT b."trekId", b.participants 
        FROM "Booking" b
        JOIN "User" u ON b."userId" = u.id
        WHERE b.id = ${bookingId} AND b.status = 'PENDING' AND u.email = ${userEmail}
        FOR UPDATE
      `;

      if (!bookings || bookings.length === 0) throw new Error('BOOKING_NOT_FOUND');
      
      await tx.$executeRaw`UPDATE "Trek" SET "availableSpots" = "availableSpots" + ${bookings[0].participants} WHERE id = ${bookings[0].trekId}`;
      await tx.$executeRaw`DELETE FROM "Booking" WHERE id = ${bookingId}`;
    });

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateBookingParticipantsAction(bookingId: string, newParticipants: number) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) throw new Error('AUTH_REQUIRED');
    const userEmail = session.user.email;

    const result = await (prisma as any).$transaction(async (tx: any) => {
      const bookings: any[] = await tx.$queryRaw`
        SELECT b.*, t.price as "trekPrice"
        FROM "Booking" b
        JOIN "Trek" t ON b."trekId" = t.id
        JOIN "User" u ON b."userId" = u.id
        WHERE b.id = ${bookingId} AND b.status = 'PENDING' AND u.email = ${userEmail}
        FOR UPDATE
      `;

      if (!bookings || bookings.length === 0) throw new Error('BOOKING_NOT_FOUND');
      const b = bookings[0];

      const diff = newParticipants - b.participants;
      if (diff === 0) return b;

      if (diff > 0) {
        const trek: any[] = await tx.$queryRaw`SELECT "availableSpots" FROM "Trek" WHERE id = ${b.trekId} FOR UPDATE`;
        if (trek[0].availableSpots < diff) throw new Error('NOT_ENOUGH_SPOTS');
      }

      const basePrice = b.trekPrice * newParticipants;
      const gstAmount = Math.round(basePrice * 0.05);
      const totalPrice = basePrice + gstAmount;

      await tx.$executeRaw`
        UPDATE "Booking" 
        SET participants = ${newParticipants}, "basePrice" = ${basePrice}, "gstAmount" = ${gstAmount}, "totalPrice" = ${totalPrice}, "updatedAt" = NOW()
        WHERE id = ${bookingId}
      `;

      await tx.$executeRaw`UPDATE "Trek" SET "availableSpots" = "availableSpots" - ${diff} WHERE id = ${b.trekId}`;

      return { id: bookingId };
    });

    return { success: true, booking: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function initiateRazorpayOrderAction(bookingId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) throw new Error('AUTH_REQUIRED');
    const userEmail = session.user.email;

    const bookings: any[] = await (prisma as any).$queryRaw`
      SELECT b.* FROM "Booking" b JOIN "User" u ON b."userId" = u.id WHERE b.id = ${bookingId} AND u.email = ${userEmail}
    `;

    if (!bookings || bookings.length === 0) throw new Error('BOOKING_NOT_FOUND');
    const b = bookings[0];
    if (b.status !== 'PENDING') throw new Error('INVALID_STATUS');

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    let order;

    if (!keyId || keyId === 'rzp_test_placeholder') {
      order = { id: `mock_order_${Date.now()}`, amount: Math.round(b.totalPrice * 100), currency: 'INR' };
    } else {
      const instance = new Razorpay({ key_id: keyId, key_secret: process.env.RAZORPAY_KEY_SECRET as string });
      order = await instance.orders.create({ amount: Math.round(b.totalPrice * 100), currency: 'INR', receipt: `receipt_${b.id}` });
    }

    await (prisma as any).$executeRaw`UPDATE "Booking" SET "razorpayOrderId" = ${order.id} WHERE id = ${b.id}`;

    return { success: true, order, keyId };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function verifyPaymentAction(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId: string;
}) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) throw new Error('AUTH_REQUIRED');

    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

    if (!(payload.razorpay_order_id.startsWith('mock_') && payload.razorpay_signature === 'mock_sig')) {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${payload.razorpay_order_id}|${payload.razorpay_payment_id}`);
      if (shasum.digest('hex') !== payload.razorpay_signature) throw new Error('INVALID_SIGNATURE');
    }

    await (prisma as any).$executeRaw`
      UPDATE "Booking" SET status = 'CONFIRMED', "razorpayPaymentId" = ${payload.razorpay_payment_id}, "updatedAt" = NOW() WHERE id = ${payload.bookingId}
    `;

    revalidatePath('/dashboard');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getUserBookingsAction() {
  try {
    const session = await auth();
    if (!session || !session.user?.email) throw new Error('AUTH_REQUIRED');
    const userEmail = session.user.email;

    const bookings = await (prisma as any).$queryRaw`
      SELECT 
        b.*,
        t.title as "trekTitle", t.price as "trekPrice", t."coverImage" as "trekCoverImage", t.location as "trekLocation", t."durationDays" as "trekDurationDays",
        e."startDate" as "expeditionStartDate", e.status as "expeditionStatus"
      FROM "Booking" b
      JOIN "Trek" t ON b."trekId" = t.id
      LEFT JOIN "Expedition" e ON b."expeditionId" = e.id
      JOIN "User" u ON b."userId" = u.id
      WHERE u.email = ${userEmail}
      ORDER BY b."createdAt" DESC
    `;

    return Array.isArray(bookings) ? (bookings as any[]).map((b: any) => ({
      ...b,
      trek: { 
        title: b.trekTitle, 
        price: b.trekPrice, 
        coverImage: b.trekCoverImage,
        location: b.trekLocation,
        durationDays: b.trekDurationDays
      },
      expedition: b.expeditionId ? { 
        id: b.expeditionId, 
        startDate: b.expeditionStartDate, 
        status: b.expeditionStatus 
      } : null
    })) : [];
  } catch (err: any) {
    console.error('getUserBookingsAction Error:', err);
    return [];
  }
}

export async function cancelUserBookingAction(bookingId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) throw new Error('AUTH_REQUIRED');
    const userEmail = session.user.email;

    const bookingRes: any[] = await (prisma as any).$queryRaw`
      SELECT b.*, t.title as "trekTitle", e."startDate" as "expeditionStartDate"
      FROM "Booking" b
      JOIN "Trek" t ON b."trekId" = t.id
      LEFT JOIN "Expedition" e ON b."expeditionId" = e.id
      JOIN "User" u ON b."userId" = u.id
      WHERE b.id = ${bookingId} AND u.email = ${userEmail}
      LIMIT 1
    `;

    if (!bookingRes || bookingRes.length === 0) throw new Error('BOOKING_NOT_FOUND');
    const booking = bookingRes[0];

    if (booking.status === 'CANCELLED') throw new Error('ALREADY_CANCELLED');

    // Refund Logic
    const today = new Date();
    const trekStart = booking.expeditionStartDate ? new Date(booking.expeditionStartDate) : new Date(today.getTime() + 40 * 24 * 60 * 60 * 1000);
    const diffDays = Math.ceil((trekStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    let refundContext = "Non-refundable";

    if (diffDays > 30) {
      refundPercentage = 90;
      refundContext = "90% Refund";
    } else if (diffDays >= 7) {
      refundPercentage = 50;
      refundContext = "50% Refund";
    }

    const refundAmount = Math.round((booking.totalPrice * refundPercentage) / 100);
    let refundId = null;

    // Razorpay Refund
    if (booking.razorpayPaymentId && refundAmount > 0) {
      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (keyId && !keyId.startsWith('rzp_test_placeholder')) {
        const instance = new Razorpay({
          key_id: (keyId || '').replace(/['"]+/g, ''),
          key_secret: (process.env.RAZORPAY_KEY_SECRET || '').replace(/['"]+/g, ''),
        });
        const refund: any = await instance.payments.refund(booking.razorpayPaymentId, {
          amount: refundAmount * 100,
          notes: { bookingId: booking.id, reason: 'User Cancelled' }
        });
        refundId = refund.id;
      }
    }

    // Update Status
    await (prisma as any).$executeRaw`
      UPDATE "Booking" 
      SET status = 'CANCELLED', "refundAmount" = ${refundAmount}, "refundId" = ${refundId}, "updatedAt" = NOW()
      WHERE id = ${bookingId}
    `;

    // Inventory Return
    await (prisma as any).$executeRaw`
      UPDATE "Trek" SET "availableSpots" = "availableSpots" + ${booking.participants} WHERE id = ${booking.trekId}
    `;

    // Audit
    await logSecurityEvent('BOOKING_CANCELLED', booking.userId, { 
      bookingId, 
      refundAmount, 
      refundPercentage,
      diffDays 
    });

    revalidatePath('/dashboard/bookings');
    return { success: true, refundAmount, refundPercentage, refundContext };

  } catch (err: any) {
    console.error('cancelUserBookingAction Error:', err);
    return { success: false, error: err.message };
  }
}
