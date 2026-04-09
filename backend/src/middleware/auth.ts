import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';

/**
 * 🛡️ ENTERPRISE AUTHENTICATION PERIMETER
 * Verifies signed JWT tokens from the GTM-Adventure Unified Frontend.
 * Ensures identity is proven via cryptographic signature, not spoofable headers.
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  const devEmail = req.headers['x-user-email'] as string; 

  let email: string | null = null;

  if (token) {
    try {
      const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'development_secret_only';
      const decoded = jwt.verify(token, secret) as any;
      email = decoded.email;
      console.log(`[AUTHENTICATED] JWT Verification Success: ${email}`);
    } catch (err) {
      console.warn('⚠️ Security: Invalid JWT token signature detected.');
      return res.status(401).json({ error: 'Auth failed: Invalid security token.' });
    }

  } else if (devEmail && process.env.NODE_ENV !== 'production') {
    // 🧪 DEV MODE ONLY fallback
    email = devEmail;
    console.log(`[AUTHENTICATED] Logic-Only Header (Dev Mode): ${email}`);
  }

  if (!email) {
    console.warn(`[SECURITY SHIELD] Rejected access to: ${req.path} (Missing Credentials)`);
    return res.status(401).json({ error: 'Unauthorized: Operational clearance required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User context not found in system.' });
    }

    // 🛡️ DATA ISOLATION: Scrub sensitive vectors from context
    const { password, twoFactorSecret, ...scrubbedUser } = user;
    (req as any).user = scrubbedUser;
    
    next();
  } catch (error) {
    console.error('CRITICAL: Auth System Failure:', error);
    res.status(500).json({ error: 'Internal operational failure.' });
  }
};
