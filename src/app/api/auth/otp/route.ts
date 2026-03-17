import { NextResponse } from "next/server"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"
import { generateOTP, verifyOTP } from "@/lib/otp"
import { prisma } from "@/lib/prisma"

const otpRequestSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
})

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1"
    const body = await req.json()
    const { phone } = otpRequestSchema.parse(body)

    const { success } = await rateLimit(`otp:${ip}`, 5, 600) // 5 per 10 mins

    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    await generateOTP(phone)

    return NextResponse.json({ message: "OTP sent successfully" })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
