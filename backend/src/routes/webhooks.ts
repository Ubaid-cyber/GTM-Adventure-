import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import crypto from 'crypto';

const router = Router();

// POST /api/webhooks/razorpay
router.post('/razorpay', async (req: Request, res: Response) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const rawBody = (req as any).rawBody;
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!rawBody) {
      console.error('[WEBHOOK_SECURITY] Error: Raw body buffer was not captured. Payment verification failed.');
      return res.status(500).json({ error: 'Internal server configuration error' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.warn('[WEBHOOK_SECURITY] Invalid signature detected. Request rejected.');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    if (event.event === 'payment.captured') {
      const { bookingId } = event.payload.payment.entity.notes;

      await prisma.$transaction(async (tx: any) => {
        const booking = await tx.booking.findUnique({
          where: { id: bookingId },
          include: { trek: true }
        });

        if (booking && booking.status !== 'CONFIRMED') {
          // 1. Create Expedition
          const durationDays = booking.trek?.durationDays || 5;
          const startDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
          
          const expedition = await tx.expedition.create({
            data: {
              trekId: booking.trekId,
              status: 'UPCOMING',
              startDate,
              endDate
            }
          });

          // 2. Confirm Booking and relate Expedition
          await tx.booking.update({
            where: { id: bookingId },
            data: { 
              status: 'CONFIRMED', 
              razorpayPaymentId: event.payload.payment.entity.id,
              expeditionId: expedition.id
            }
          });
        }
      });
    }

    res.json({ status: 'ok' });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
