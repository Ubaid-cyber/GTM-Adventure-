import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    // Include user to verify ownership
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { user: true }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Security: Only the owner of the booking can create a payment order
    if (booking.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden: You do not own this booking' }, { status: 403 });
    }

    if (booking.status !== 'PENDING') {
      return NextResponse.json({ error: `Booking is already ${booking.status}` }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    let order;

    if (!keyId || keyId === 'rzp_test_placeholder') {
      console.log('SIMULATING ORDER CREATION (No Razorpay keys provided)');
      order = {
        id: `mock_order_${Date.now()}`,
        amount: Math.round(booking.totalPrice * 100),
        currency: 'INR',
      };
    } else {
      const instance = new Razorpay({
        key_id: keyId,
        key_secret: process.env.RAZORPAY_KEY_SECRET as string,
      });

      const options = {
        amount: Math.round(booking.totalPrice * 100),
        currency: 'INR',
        receipt: `receipt_order_${booking.id}`,
      };
      
      order = await instance.orders.create(options);
    }

    // Save order ID to booking for webhook matching
    await prisma.booking.update({
      where: { id: booking.id },
      data: { razorpayOrderId: order.id }
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Razorpay Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
