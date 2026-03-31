import { prisma } from './prisma';

/**
 * High-Performance Audit Logging Utility
 * Records security events, user actions, and system alerts.
 */
export async function logSecurityEvent(
  action: string,
  userId?: string,
  metadata?: any,
  ip: string = 'unknown',
  userAgent: string = 'unknown'
) {
  try {
    const log = await prisma.auditLog.create({
      data: {
        action,
        userId,
        ip,
        userAgent,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined, // Ensure JSON safety
      },
    });
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[AUDIT LOG] ${action} | User: ${userId || 'ANONYMOUS'} | IP: ${ip}`);
    }
    
    return log;
  } catch (error: any) {
    console.error('[AuditLogger] Failed to write log:', error.message);
    // Fail silently in production to avoid crashing on logging errors (Safe Practice)
  }
}
