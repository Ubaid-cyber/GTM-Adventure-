import { describe, it, expect, vi } from 'vitest'
import { generateOTP } from '../otp'
import { prisma } from '../prisma'

vi.mock('../prisma', () => ({
  prisma: {
    verificationToken: {
      upsert: vi.fn(),
    },
  },
}))

describe('OTP Logic', () => {
  it('should generate a 6-digit OTP code', async () => {
    const phone = '+919876543210'
    const code = await generateOTP(phone)
    
    expect(code).toHaveLength(6)
    expect(Number(code)).toBeGreaterThanOrEqual(100000)
    expect(Number(code)).toBeLessThanOrEqual(999999)
  })

  it('should call prisma.verificationToken.upsert with correct values', async () => {
    const phone = '+919876543210'
    await generateOTP(phone)
    
    expect(prisma.verificationToken.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.anything(),
        create: expect.objectContaining({
          identifier: phone,
        }),
      })
    )
  })
})
