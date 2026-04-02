import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// 🌍 GLOBAL MISSION OVERSIGHT: Aggregated view for Admins
router.get('/active-missions', async (req, res) => {
  try {
    const user = (req as any).user;
    if (user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access Denied: High-command clearance expected.' });
    }

    const missions = await prisma.expedition.findMany({
      where: { status: 'ONGOING' },
      include: {
        trek: {
           select: { 
             title: true, 
             guide: { select: { name: true, profileImage: true } } 
           }
        },
        sitreps: {
           orderBy: { createdAt: 'desc' },
           take: 3
        },
        checklists: {
           orderBy: { verifiedAt: 'desc' }
        }
      }
    });

    // AUDIT: Who is watching the watchers?
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'ADMIN_GLOBAL_MISSION_OVERSIGHT_ACCESS',
        ip: req.ip || '0.0.0.0',
        userAgent: req.headers['user-agent']
      }
    });

    res.json(missions);
  } catch (error: any) {
    console.error('Admin Oversight Error:', error);
    res.status(500).json({ error: 'Failed to access mission command.' });
  }
});

// 📡 SITE-REP FEED: Deep dive into all operational logs
router.get('/all-sitreps', async (req, res) => {
  try {
     const user = (req as any).user;
     if (user.role !== 'ADMIN') return res.status(403).json({ error: 'No clearance.' });

     const sitreps = await prisma.situationReport.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
           expedition: { 
              include: { trek: { select: { title: true } } } 
           }
        }
     });

     res.json(sitreps);
  } catch (err) {
     res.status(500).json({ error: 'Log access failed.' });
  }
});

export default router;
