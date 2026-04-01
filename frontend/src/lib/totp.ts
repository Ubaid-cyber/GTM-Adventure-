import { generateSecret, generateURI, verify } from 'otplib'
import * as QRCode from 'qrcode'

/**
 * Generates a new TOTP secret for a user.
 * This should be stored in the database.
 */
export function generateTOTPSecret() {
  return generateSecret()
}

/**
 * Generates a TOTP URL for use in a QR Code.
 */
export function getTOTPUrl(email: string, secret: string) {
  return generateURI({
    issuer: 'GTM Adventures',
    label: email,
    secret
  })
}

/**
 * Generates a QR Code as a Data URL for the given TOTP URL.
 */
export async function generateQRCode(url: string): Promise<string> {
  return await QRCode.toDataURL(url)
}

/**
 * Verifies a TOTP token against a secret.
 */
export async function verifyTOTP(token: string, secret: string): Promise<boolean> {
  const result = await verify({ token, secret })
  return result.valid
}

/**
 * Checks if a user should be prompted for 2FA.
 */
export function shouldEnforce2FA(role: string): boolean {
  return role === 'ADMIN' || role === 'LEADER'
}
