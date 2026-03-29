import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      console.error('Missing signature or webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    console.log('Razorpay Webhook Event:', event.event);

    // Handle payment.captured or order.paid
    if (event.event === 'order.paid' || event.event === 'payment.captured') {
      const { id: orderId } = event.payload.order ? event.payload.order.entity : event.payload.payment.entity;
      
      // If it was a payment.captured, the order_id is inside payment.entity
      const actualOrderId = event.payload.order 
        ? event.payload.order.entity.id 
        : event.payload.payment.entity.order_id;

      if (actualOrderId) {
        const booking = await prisma.booking.findUnique({
          where: { razorpayOrderId: actualOrderId }
        });

        if (booking && booking.status !== 'CONFIRMED') {
          await prisma.booking.update({
            where: { id: booking.id },
            data: { 
              status: 'CONFIRMED',
              razorpayPaymentId: event.payload.payment ? event.payload.payment.entity.id : undefined 
            }
          });
          console.log(`Booking ${booking.id} confirmed via Webhook`);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Razorpay Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
