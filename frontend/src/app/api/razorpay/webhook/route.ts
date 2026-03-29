import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Razorpay Webhooks require raw body string for signature verification
    const bodyText = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return NextResponse.json({ error: "Missing webhook signature or secret" }, { status: 400 });
    }

    // Verify webhook authenticity natively
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(bodyText)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("🚨 Razorpay Webhook Invalid Signature Detected!");
      return NextResponse.json({ error: "Invalid cryptographic signature" }, { status: 400 });
    }

    const event = JSON.parse(bodyText);
    console.log(`✅ Webhook Received: ${event.event}`);

    // We listen for payment.captured or order.paid to formally secure the booking
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const paymentEntity = event.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;

      if (!orderId) {
        // Return 200 so Razorpay stops retrying this irrelevant event
        return NextResponse.json({ success: true, message: "Irrelevant event structure" });
      }

      // Execute secure database transaction to confirm the PENDING checkout
      await prisma.$transaction(async (tx) => {
        const booking = await tx.booking.findUnique({
          where: { razorpayOrderId: orderId }
        });

        if (booking && booking.status === "PENDING") {
          await tx.booking.update({
            where: { id: booking.id },
            data: { 
              status: "CONFIRMED",
              razorpayPaymentId: paymentId
            }
          });
          console.log(`🎉 Webhook Successfully Confirmed Booking: ${booking.id}`);
        } else {
          console.log(`⚠️ Webhook arrived but Booking was not found or already processed. OrderID: ${orderId}`);
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook Server Error:", error);
    return NextResponse.json({ error: "Webhook handler exception" }, { status: 500 });
  }
}
