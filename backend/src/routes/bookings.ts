import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { pool } from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

import Razorpay from 'razorpay';

const router = Router();

router.use(authenticateToken); // Apply to all routes in this router


const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').replace(/['"]+/g, '');
const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').replace(/['"]+/g, '');

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    const user = (req as any).user;
    let bookings;

    if (user.role === 'ADMIN') {
      // Admins see everything
      bookings = await prisma.booking.findMany({
        where: { status: 'CONFIRMED' },
        include: {
          user: { select: { name: true, email: true, profileImage: true, id: true } },
          trek: true,
          expedition: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (user.role === 'LEADER') {
      // Group Leaders see only bookings for treks they are guiding
      bookings = await prisma.booking.findMany({
        where: {
          status: 'CONFIRMED',
          OR: [
            { trek: { guideId: user.id } },
            { assignedStaffId: user.id }
          ]
        },
        include: {
          user: { select: { name: true, email: true, profileImage: true, id: true } },
          trek: true,
          expedition: true
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Trekkers see only their own
      bookings = await prisma.booking.findMany({
        where: { userId: user.id },
        include: {
          trek: true,
          expedition: true
        },
        orderBy: { createdAt: 'desc' }
      });
    }
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const { trekId, participants } = req.body;
    const numParticipants = parseInt(participants);
    const userEmail = (req as any).user.email;

    if (!trekId || isNaN(numParticipants) || numParticipants <= 0) {
      return res.status(400).json({ error: 'Invalid booking data' });
    }

    const user = (req as any).user;


    // ─── Atomic Transaction with Row-Level Locking ───
    const result: any = await prisma.$transaction(async (tx: any) => {
      const trek: any[] = await tx.$queryRaw`
        SELECT id, price, "availableSpots", title
        FROM "Trek"
        WHERE id = ${trekId}
        FOR UPDATE
      `;

      if (!trek || trek.length === 0) throw new Error('Trek not found');
      const selectedTrek = trek[0];
      const spotsRemaining = selectedTrek.availableSpots ?? 15;

      if (spotsRemaining < numParticipants) throw new Error('All Tickets are sold out');

      const totalPrice = selectedTrek.price * numParticipants;

      // 1. Create Booking
      const booking = await tx.booking.create({
        data: {
          userId: user.id,
          trekId: selectedTrek.id,
          participants: numParticipants,
          totalPrice,
          status: 'PENDING',
        },
      });

      // 2. Decrement spots
      await tx.trek.update({
        where: { id: selectedTrek.id },
        data: { availableSpots: { decrement: numParticipants } },
      });

      // 3. Create Razorpay Order
      const order = await razorpay.orders.create({
        amount: Math.round(totalPrice * 100), // in paise
        currency: 'INR',
        receipt: `receipt_${booking.id.slice(0, 10)}`,
        notes: { bookingId: booking.id, trekTitle: selectedTrek.title }
      });

      // 4. Update Booking with Order ID
      const updatedBooking = await tx.booking.update({
        where: { id: booking.id },
        data: { razorpayOrderId: order.id }
      });

      return { booking: updatedBooking, order, trekTitle: selectedTrek.title };
    });

    res.json({
      success: true,
      booking: result.booking,
      order: result.order,
      keyId,
      message: `Successfully reserved ${numParticipants} spot(s) for ${result.trekTitle}`
    });

  } catch (error: any) {
    if (error.message === 'NOT_ENOUGH_SPOTS') {
      return res.status(400).json({ error: 'Sorry, not enough spots available for this trek.' });
    }
    console.error('Booking Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// GET /api/bookings/:id (Single)
router.get('/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        trek: true,
        user: { select: { email: true } }
      }
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.user.email !== (req as any).user.email) return res.status(403).json({ error: 'Access Denied' });

    res.json({ success: true, booking });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/bookings/:id (Participants Update)
router.patch('/:id', async (req, res) => {
  try {
    const newParticipants = parseInt(req.body.participants);
    if (isNaN(newParticipants) || newParticipants <= 0) return res.status(400).json({ error: 'Invalid count' });

    const result = await prisma.$transaction(async (tx: any) => {
      const booking = await tx.booking.findUnique({
        where: { id: req.params.id },
        include: { user: true, trek: true }
      });

      if (!booking) throw new Error('NOT_FOUND');
      if (booking.user.email !== (req as any).user.email) throw new Error('FORBIDDEN');
      if (booking.status !== 'PENDING') throw new Error('INVALID_STATUS');

      const diff = newParticipants - booking.participants;
      if (diff === 0) return booking;

      // Lock trek to adjust spots
      const trek: any[] = await tx.$queryRaw`
        SELECT "availableSpots" FROM "Trek" WHERE id = ${booking.trekId} FOR UPDATE
      `;
      const currentSpots = trek[0]?.availableSpots || 0;

      if (diff > 0 && currentSpots < diff) throw new Error('NOT_ENOUGH_SPOTS');

      await tx.trek.update({
        where: { id: booking.trekId },
        data: { availableSpots: { decrement: diff } }
      });

      return await tx.booking.update({
        where: { id: booking.id },
        data: {
          participants: newParticipants,
          totalPrice: (booking.trek.price || 0) * newParticipants
        }
      });
    });

    res.json({ success: true, booking: result });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Not Found' });
    if (error.message === 'FORBIDDEN') return res.status(403).json({ error: 'Forbidden' });
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// POST /api/bookings/:id/cancel (Manual Cancel/Spot Release)
router.post('/:id/cancel', async (req, res) => {
  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const booking = await tx.booking.findUnique({
        where: { id: req.params.id },
        include: { user: true }
      });

      if (!booking) throw new Error('NOT_FOUND');
      if (booking.user.email !== (req as any).user.email) throw new Error('FORBIDDEN');
      if (booking.status !== 'PENDING') throw new Error('INVALID_STATUS');

      // Release spots
      await tx.trek.update({
        where: { id: booking.trekId },
        data: { availableSpots: { increment: booking.participants } }
      });

      return await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'CANCELLED' }
      });
    });

    res.json({ success: true, message: 'Booking cancelled and spots released.' });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') return res.status(404).json({ error: 'Not Found' });
    if (error.message === 'FORBIDDEN') return res.status(403).json({ error: 'Forbidden' });
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
