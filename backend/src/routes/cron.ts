import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import crypto from 'crypto';

const router = Router();

// GET /api/cron/release-spots (Timed Spot Recovery)
router.get('/release-spots', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: tenMinutesAgo },
      },
      select: { id: true, trekId: true, participants: true }
    });

    if (expiredBookings.length === 0) return res.json({ message: 'No expired bookings found.' });

    const releasedSpots: string[] = [];
    for (const booking of expiredBookings) {
      await prisma.$transaction(async (tx: any) => {
        const currentBooking = await tx.booking.findUnique({ where: { id: booking.id }, select: { status: true } });
        if (currentBooking?.status !== 'PENDING') return;

        await tx.trek.update({ where: { id: booking.trekId }, data: { availableSpots: { increment: booking.participants } } });
        await tx.booking.update({ where: { id: booking.id }, data: { status: 'CANCELLED' } });
        releasedSpots.push(booking.id);
      });
    }

    res.json({ success: true, count: releasedSpots.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
