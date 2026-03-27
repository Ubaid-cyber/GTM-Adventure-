import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// ─── POST /api/bookings ───────────────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    // Auth is handled by NextAuth on the frontend; the user email is passed in the body
    // For full decoupled auth, this will be replaced with JWT middleware in a future module
    const { trekId, participants, userEmail } = req.body;
    const numParticipants = parseInt(participants);

    if (!trekId || isNaN(numParticipants) || numParticipants <= 0 || !userEmail) {
      res.status(400).json({ error: 'Invalid booking data' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    // ─── Atomic Transaction with Row-Level Locking ────────────────────────────
    const result = await prisma.$transaction(async (tx: any) => {
      const trek: any[] = await tx.$queryRaw`
        SELECT id, price, "availableSpots", "title"
        FROM "Trek"
        WHERE id = ${trekId}
        FOR UPDATE
      `;

      if (!trek || trek.length === 0) throw new Error('Trek not found');

      const selectedTrek = trek[0];
      const spotsRemaining = selectedTrek.availableSpots ?? 15;

      if (spotsRemaining < numParticipants) throw new Error('NOT_ENOUGH_SPOTS');

      const totalPrice = selectedTrek.price * numParticipants;

      const booking = await tx.booking.create({
        data: { userId: user.id, trekId: selectedTrek.id, participants: numParticipants, totalPrice, status: 'PENDING' }
      });

      await tx.trek.update({
        where: { id: selectedTrek.id },
        data: { availableSpots: { decrement: numParticipants } }
      });

      return { booking, trekTitle: selectedTrek.title };
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'TREK_BOOKED',
        ip: (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'unknown',
        metadata: { trekId, participants: numParticipants },
      }
    });

    res.json({
      success: true,
      booking: result.booking,
      message: `Successfully booked ${numParticipants} spot(s) for ${result.trekTitle}`
    });
  } catch (error: any) {
    if (error.message === 'NOT_ENOUGH_SPOTS') {
      res.status(400).json({ error: 'Sorry, not enough spots available for this trek.' });
      return;
    }
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// ─── GET /api/bookings?email=... ──────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { email } = req.query as { email: string };
    if (!email) { res.status(400).json({ error: 'Email required' }); return; }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.json([]); return; }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: {
        trek: { select: { title: true, coverImage: true, location: true, durationDays: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

export default router;
