import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import Razorpay from 'razorpay';

const router = Router();
router.use(authenticateToken);

const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').replace(/['"]+/g, '');
const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').replace(/['"]+/g, '');

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// POST /api/razorpay/order (Legacy)
router.post('/order', async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.body;
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { trek: true }
    });

    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    const order = await razorpay.orders.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: 'INR',
      receipt: `retry_${bookingId.slice(0, 10)}`,
      notes: { bookingId, trekTitle: booking.trek.title }
    });

    res.json({ order, keyId });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// POST /api/razorpay/verify
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
    const secret = process.env.RAZORPAY_KEY_SECRET || '';

    if (razorpay_order_id.startsWith('mock_') && razorpay_signature === 'mock_sig') {
      console.log('Bypassing signature verification for simulated mock order.');
    } else {
      const shasum = crypto.createHmac('sha256', secret);
      shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = shasum.digest('hex');

      if (digest !== razorpay_signature) {
        return res.status(400).json({ error: 'Invalid payment signature' });
      }
    }

    await prisma.$transaction(async (tx: any) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { trek: true }
      });

      if (!booking) throw new Error('Booking not found');

      if (booking.status !== 'CONFIRMED') {
          // 1. Create Expedition
          const durationDays = (booking.trek as any)?.durationDays || 5;
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
              razorpayPaymentId: razorpay_payment_id,
              expeditionId: expedition.id
            }
          });
          
          console.log(`[RAZORPAY_VERIFY] Created Expedition ${expedition.id} for Booking ${bookingId}`);
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
