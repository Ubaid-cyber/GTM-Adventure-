import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// GET /api/active-bookings/:id
router.get('/:id', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const activeBooking = await prisma.expedition.findUnique({
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

    if (!activeBooking) return res.status(404).json({ error: 'Booking details not found' });
    if (activeBooking.bookings.length === 0) return res.status(403).json({ error: 'Access Denied: No confirmed booking found' });

    res.json(activeBooking);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
