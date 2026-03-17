import { prisma } from './prisma'
import { crypto } from 'crypto'

export async function generateOTP(phone: string) {
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

  await prisma.verificationToken.upsert({
    where: { identifier_token: { identifier: phone, token: code } },
    update: { expires },
    create: { identifier: phone, token: code, expires }
  })

  // In production, we would call Twilio/SMS service here
  console.log(`[DEV] OTP for ${phone}: ${code}`)
  return code
}

export async function verifyOTP(phone: string, token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier: phone, token } }
  })

  if (!verificationToken || verificationToken.expires < new Date()) {
    return false
  }

  // Delete token after successful verification
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: phone, token } }
  })

  return true
}
