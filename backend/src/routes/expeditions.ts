import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// GET /api/expeditions/:id
router.get('/:id', async (req, res) => {
  try {
    const user = (req as any).user;
    const expedition = await prisma.expedition.findUnique({
      where: { id: req.params.id },
      include: {
        trek: {
           include: {
              guide: { select: { id: true, email: true } }
           }
        },
        bookings: {
          where: {
            userId: user.id || 'NONE',
            status: 'CONFIRMED'
          }
        }
      }
    });

    if (!expedition) return res.status(404).json({ error: 'Expedition not found' });

    // ─── Big Company Security: Strict Domain Logic ───
    const isParticipant = expedition.bookings.length > 0;
    const isLeader = user.role === 'LEADER' && expedition.trek.guideId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isParticipant && !isLeader && !isAdmin) {
       return res.status(403).json({ error: 'Access Denied: Scoped access restricted.' });
    }

    res.json(expedition);
  } catch (error: any) {
    console.error('Expedition Fetch Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/expeditions/:id
// MISSION CONTROL: Update Live Telemetry
router.patch('/:id', async (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { currentLocationName, currentAltitude, currentLat, currentLong, progressPercent } = req.body;

    const expedition = await prisma.expedition.findUnique({
       where: { id },
       include: { trek: true }
    });

    if (!expedition) return res.status(404).json({ error: 'Sector not found.' });

    // 🛡️ SECURITY GOVERNANCE
    if (user.role !== 'LEADER' && user.role !== 'ADMIN') {
       return res.status(403).json({ error: 'Unauthorized: Command clearance required.' });
    }

    if (user.role === 'LEADER' && expedition.trek.guideId !== user.id) {
       return res.status(403).json({ error: 'Forbidden: You are not the authorized leader for this expedition.' });
    }

    // 📐 ARCHITECTURAL VALIDATION
    if (progressPercent !== undefined && (progressPercent < 0 || progressPercent > 100)) {
       return res.status(400).json({ error: 'Invalid telemetry: Progress must be 0-100.' });
    }

    const updated = await prisma.expedition.update({
       where: { id },
       data: {
          currentLocationName,
          currentAltitude,
          currentLat,
          currentLong,
          progressPercent
       }
    });

    // 📝 AUDIT LOGGING: Immutable trace of operational updates
    await prisma.auditLog.create({
       data: {
          userId: user.id,
          action: 'LEADER_TELEMETRY_UPDATE',
          ip: req.ip || '0.0.0.0',
          userAgent: req.headers['user-agent'],
          metadata: {
             expeditionId: id,
             updates: req.body
          }
       }
    });

    res.json(updated);
  } catch (error: any) {
     console.error('Telemetry Update Error:', error);
     res.status(500).json({ error: 'Failed to update telemetry.' });
  }
});

export default router;
