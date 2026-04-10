'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Validates that the current user has the LEADER or ADMIN role.
 * Returns the user object if valid.
 */
async function validateLeader() {
  const session = await auth();
  if (!session || !session.user?.email) {
    throw new Error('Unauthorized: Authentication required');
  }

  const userRes: any[] = await (prisma as any).$queryRaw`
    SELECT id, role FROM "User" WHERE email = ${session.user.email}
  `;

  if (!userRes || userRes.length === 0) {
    throw new Error('User not found');
  }

  const user = userRes[0];
  if (user.role !== 'LEADER' && user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Leader clearance required');
  }

  return user;
}

/**
 * Fetches all participants (users with confirmed bookings) for treks guided by this leader.
 */
export async function getLeaderParticipantsAction() {
  try {
    const leader = await validateLeader();

    const participants = await (prisma as any).$queryRaw`
      SELECT DISTINCT
        u.id, u.name, u.email, u.profile_image as "profileImage",
        t.title as "trekTitle",
        b.status as "bookingStatus",
        b.participants as "groupSize"
      FROM "User" u
      JOIN "Booking" b ON u.id = b."userId"
      JOIN "Trek" t ON b."trekId" = t.id
      WHERE (t."guideId" = ${leader.id} OR b."assignedStaffId" = ${leader.id})
      AND b.status = 'CONFIRMED'
    `;

    const results = Array.isArray(participants) ? participants : [];
    
    return results.map((p: any) => ({
      id: p.id,
      user: {
        id: p.id,
        name: p.name,
        email: p.email,
        profileImage: p.profileImage
      },
      trek: {
        title: p.trekTitle
      },
      status: p.bookingStatus,
      participants: Number(p.groupSize || 1)
    }));
  } catch (err: any) {
    console.error('getLeaderParticipantsAction Error:', err);
    throw new Error(err.message || 'Failed to fetch participants');
  }
}

/**
 * Fetches bookings for treks guided by this leader.
 */
export async function getLeaderBookingsAction() {
  try {
    const leader = await validateLeader();

    const bookings = await (prisma as any).$queryRaw`
      SELECT 
        b.*,
        t.title as "trekTitle", t.price as "trekPrice", t."coverImage" as "trekCoverImage", t.slug as "trekSlug",
        u.name as "userName", u.email as "userEmail", u.profile_image as "userProfileImage",
        e.id as "expeditionId", e.status as "expeditionStatus"
      FROM "Booking" b
      JOIN "Trek" t ON b."trekId" = t.id
      JOIN "User" u ON b."userId" = u.id
      LEFT JOIN "Expedition" e ON b."expeditionId" = e.id
      WHERE (t."guideId" = ${leader.id} OR b."assignedStaffId" = ${leader.id})
      AND b.status IN ('CONFIRMED', 'PENDING')
      ORDER BY b."createdAt" DESC
    `;

    return Array.isArray(bookings) ? (bookings as any[]).map((b: any) => ({
      ...b,
      user: { id: b.userId, name: b.userName, email: b.userEmail, profileImage: b.userProfileImage },
      trek: { title: b.trekTitle, price: b.trekPrice, coverImage: b.trekCoverImage, slug: b.trekSlug },
      expedition: b.expeditionId ? { id: b.expeditionId, status: b.expeditionStatus } : null
    })) : [];
  } catch (err: any) {
    console.error('getLeaderBookingsAction Error:', err);
    return [];
  }
}

/**
 * Fetches medical records for users with confirmed bookings for this leader's treks.
 */
export async function getLeaderMedicalRecordsAction() {
  try {
    const leader = await validateLeader();

    const profiles = await (prisma as any).$queryRaw`
      SELECT 
        mp.*,
        u.name as "userName", u.email as "userEmail", u.profile_image as "userProfileImage"
      FROM "MedicalProfile" mp
      JOIN "User" u ON mp."userId" = u.id
      WHERE u.id IN (
        SELECT "userId" FROM "Booking" b
        JOIN "Trek" t ON b."trekId" = t.id
        WHERE (t."guideId" = ${leader.id} OR b."assignedStaffId" = ${leader.id})
        AND b.status = 'CONFIRMED'
      )
    `;

    return Array.isArray(profiles) ? (profiles as any[]).map((p: any) => ({
      ...p,
      user: { name: p.userName, email: p.userEmail, profileImage: p.userProfileImage }
    })) : [];
  } catch (err: any) {
    console.error('getLeaderMedicalRecordsAction Error:', err);
    return [];
  }
}

/**
 * Expedition Telemetry Actions
 */
export async function getExpeditionTelemetryAction(expeditionId: string) {
  try {
    await validateLeader();

    const expeditions: any[] = await (prisma as any).$queryRaw`
      SELECT e.*, t.title as "trekTitle", t."maxAltitude", t."durationDays", t."guideId"
      FROM "Expedition" e
      JOIN "Trek" t ON e."trekId" = t.id
      WHERE e.id = ${expeditionId}
    `;

    if (!expeditions || expeditions.length === 0) return null;
    const ex = expeditions[0];

    return {
      ...ex,
      trek: {
        title: ex.trekTitle,
        maxAltitude: ex.maxAltitude,
        durationDays: ex.durationDays,
        guideId: ex.guideId
      }
    };
  } catch (err) {
    console.error('getExpeditionTelemetryAction Error:', err);
    return null;
  }
}

export async function updateExpeditionTelemetryAction(expeditionId: string, data: any) {
  try {
    await validateLeader();

    await (prisma as any).$executeRaw`
      UPDATE "Expedition"
      SET 
        "currentLocationName" = ${data.currentLocationName},
        "currentAltitude" = ${data.currentAltitude},
        "progressPercent" = ${data.progressPercent},
        "updatedAt" = NOW()
      WHERE id = ${expeditionId}
    `;

    revalidatePath(`/dashboard/treks/${expeditionId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * SITREP Actions
 */
export async function postSitrepAction(data: { expeditionId: string, status: string, weather: string, healthSummary: string, safetyNotes: string }) {
  try {
    const leader = await validateLeader();

    await (prisma as any).$executeRaw`
      INSERT INTO "SituationReport" (id, "expeditionId", "leaderId", status, weather, "healthSummary", "safetyNotes", "createdAt")
      VALUES (
        gen_random_uuid()::text, 
        ${data.expeditionId}, 
        ${leader.id}, 
        ${data.status}::"SitrepStatus", 
        ${data.weather}, 
        ${data.healthSummary}, 
        ${data.safetyNotes}, 
        NOW()
      )
    `;

    revalidatePath(`/dashboard/treks/${data.expeditionId}`);
    return { success: true };
  } catch (err: any) {
    console.error('postSitrepAction Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Checklist Actions
 */
export async function updateChecklistAction(expeditionId: string, phase: string) {
  try {
    const leader = await validateLeader();

    // Raw SQL for Upsert
    await (prisma as any).$executeRaw`
      INSERT INTO "OperationalChecklist" ("id", "expeditionId", "phase", "status", "completedBy", "verifiedAt")
      VALUES (
        gen_random_uuid()::text,
        ${expeditionId},
        ${phase}::"TrekPhase",
        'VERIFIED'::"ChecklistStatus",
        ${leader.id},
        NOW()
      )
      ON CONFLICT ("expeditionId", "phase") DO UPDATE SET
        "status" = 'VERIFIED'::"ChecklistStatus",
        "completedBy" = ${leader.id},
        "verifiedAt" = NOW()
    `;

    revalidatePath(`/dashboard/treks/${expeditionId}`);
    return { success: true };
  } catch (err: any) {
    console.error('updateChecklistAction Error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Roster Actions
 */
export async function getExpeditionRosterAction(expeditionId: string) {
  try {
    const leader = await validateLeader();

    const expedition: any[] = await (prisma as any).$queryRaw`
      SELECT e.id, t."guideId" FROM "Expedition" e
      JOIN "Trek" t ON e."trekId" = t.id
      WHERE e.id = ${expeditionId}
    `;

    if (!expedition || expedition.length === 0) throw new Error('Expedition not found');
    const ex = expedition[0];

    // Check if user is guide OR admin
    const isAuthorizedLeader = ex.guideId === leader.id || leader.role === 'ADMIN';

    const confirmedBookings = await prisma.booking.findMany({
      where: { expeditionId, status: 'CONFIRMED' },
      include: {
        user: {
          select: {
            id: true, name: true, profileImage: true, country: true, 
            bio: true, role: true, medicalProfile: { select: { status: true, updatedAt: true } }
          }
        }
      }
    });

    const participants = confirmedBookings.map(b => {
       const u = (b as any).user;
       if (!isAuthorizedLeader) delete u.medicalProfile;
       return u;
    });

    const guideRes: any[] = await (prisma as any).$queryRaw`
      SELECT id, name, profile_image as "profileImage", role, bio FROM "User" WHERE id = ${ex.guideId}
    `;
    const guide = guideRes.length > 0 ? guideRes[0] : null;

    return { participants, leader: guide };
  } catch (err) {
    console.error('getExpeditionRosterAction Error:', err);
    return null;
  }
}

/**
 * Feed Actions
 */
export async function getExpeditionFeedAction(expeditionId: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) return [];

    const posts = await prisma.expeditionPost.findMany({
      where: { expeditionId },
      include: {
        user: { select: { name: true, profileImage: true, role: true } },
        comments: {
          include: { user: { select: { name: true, profileImage: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return JSON.parse(JSON.stringify(posts));
  } catch (err) {
    console.error('getExpeditionFeedAction Error:', err);
    return [];
  }
}

export async function createExpeditionPostAction(expeditionId: string, content: string, type: any = 'MESSAGE', mediaUrl?: string) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) return { success: false, error: 'Unauthorized' };

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });
    if (!user) return { success: false, error: 'User not found' };

    const post = await prisma.expeditionPost.create({
      data: { 
        expeditionId, 
        userId: user.id, 
        content, 
        type, 
        mediaUrl 
      },
      include: { user: { select: { name: true, profileImage: true } } }
    });

    revalidatePath(`/dashboard/treks/${expeditionId}`);
    return { success: true, post: JSON.parse(JSON.stringify(post)) };
  } catch (err: any) {
    console.error('createExpeditionPostAction Error:', err);
    return { success: false, error: err.message };
  }
}
