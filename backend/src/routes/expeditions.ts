import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// GET /api/expeditions/:id
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const expedition = await prisma.expedition.findUnique({
      where: { id: req.params.id },
      include: {
        trek: {
          select: { title: true, maxAltitude: true, durationDays: true }
        },
        bookings: {
          where: {
            userId,
            status: 'CONFIRMED'
          }
        }
      }
    });

    if (!expedition) return res.status(404).json({ error: 'Expedition not found' });
    if (expedition.bookings.length === 0) return res.status(403).json({ error: 'Access Denied: No confirmed booking found' });

    res.json(expedition);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
