'use server';

import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@/types/leads';
import { revalidatePath } from 'next/cache';

/**
 * Senior Developer Recovery: Manual SQL Layer
 * Used because Prisma client generation is broken in this environment.
 * We use Template Literals with prisma.$executeRaw/prisma.$queryRaw 
 * for safe, parameterized SQL execution.
 */

export async function submitLead(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  trekId?: string;
  subject?: string;
}) {
  try {
    const id = Math.random().toString(36).substring(2, 10) + Date.now();
    const now = new Date();

    // Use prisma.$executeRaw with tagged templates for automatic parameter binding and safety
    await (prisma as any).$executeRaw`
      INSERT INTO "Lead" (id, name, email, phone, subject, message, status, "trekId", "createdAt", "updatedAt") 
      VALUES (${id}, ${data.name}, ${data.email}, ${data.phone || null}, ${data.subject || null}, ${data.message}, 'NEW', ${data.trekId || null}, ${now}, ${now})
    `;

    return { success: true };
  } catch (error) {
    console.error('Lead Submission Error (Raw SQL):', error);
    return { success: false, error: 'Failed to submit inquiry. Please try again later.' };
  }
}

export async function getLeads() {
  try {
    // Use prisma.$queryRaw for safe data retrieval
    const leads = await (prisma as any).$queryRaw`
      SELECT l.*, t.title as "trekTitle"
      FROM "Lead" l
      LEFT JOIN "Trek" t ON l."trekId" = t.id
      ORDER BY l."createdAt" DESC
    `;

    // Map raw result to match existing component expectations
    const formattedLeads = Array.isArray(leads) ? leads.map((l: any) => ({
      ...l,
      trek: l.trekTitle ? { title: l.trekTitle } : null
    })) : [];

    return { success: true, leads: formattedLeads };
  } catch (error) {
    console.error('Get Leads Error (Raw SQL):', error);
    return { success: false, error: 'Failed to fetch inquiries.' };
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  try {
    const now = new Date();
    await (prisma as any).$executeRaw`
      UPDATE "Lead" SET status = ${status}, "updatedAt" = ${now} WHERE id = ${id}
    `;

    revalidatePath('/adminControl/leads');
    return { success: true };
  } catch (error) {
    console.error('Update Lead Status Error (Raw SQL):', error);
    return { success: false, error: 'Failed to update lead status.' };
  }
}

export async function deleteLead(id: string) {
  try {
    await (prisma as any).$executeRaw`
      DELETE FROM "Lead" WHERE id = ${id}
    `;

    revalidatePath('/adminControl/leads');
    return { success: true };
  } catch (error) {
    console.error('Delete Lead Error (Raw SQL):', error);
    return { success: false, error: 'Failed to delete inquiry.' };
  }
}

export async function getLeadStats() {
  try {
    // Use prisma.$queryRaw for efficient grouped counting (Server-Side Aggregation)
    const stats = await (prisma as any).$queryRaw`
      SELECT status, CAST(COUNT(*) AS INTEGER) as count
      FROM "Lead"
      GROUP BY status
    `;

    // Initialize with zeros for a consistent interface
    const result = {
      total: 0,
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      CONVERTED: 0,
      LOST: 0,
      followUps: 0 // Combined CONTACTED + QUALIFIED for specific dashboard view
    };

    if (Array.isArray(stats)) {
      stats.forEach((s: any) => {
        if (s.status in result) {
          result[s.status as keyof typeof result] = s.count;
          result.total += s.count;
        }
        if (s.status === 'CONTACTED' || s.status === 'QUALIFIED') {
          result.followUps += s.count;
        }
      });
    }

    return { success: true, stats: result };
  } catch (error) {
    console.error('Get Lead Stats Error (Raw SQL):', error);
    return { success: false, error: 'Failed to fetch inquiry statistics.' };
  }
}
