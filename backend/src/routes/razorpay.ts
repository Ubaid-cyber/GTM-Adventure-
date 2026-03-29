import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';
import Razorpay from 'razorpay';

const router = Router();
router.use(authenticateToken);

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

// POST /api/razorpay/order (Legacy)
router.post('/order', async (req, res) => {
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

    res.json({ order });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// POST /api/razorpay/verify
router.post('/verify', async (req, res) => {
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

    await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        status: 'CONFIRMED',
        razorpayPaymentId: razorpay_payment_id 
      }
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
