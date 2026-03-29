import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

/**
 * Enhanced authentication bridge for local development.
 * Looks up the user from the database to provide full context (id, role).
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const userEmail = req.headers['x-user-email'] as string;
  
  if (!userEmail) {
    return res.status(401).json({ error: 'Unauthorized: No user context found.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found in system.' });
    }

    // Attach full user object to request
    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
