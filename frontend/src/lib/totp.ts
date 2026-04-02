import { 
  generateSecret as otpGenerateSecret, 
  generateURI as otpGenerateURI, 
  verify as otpVerify 
} from 'otplib';
import * as QRCode from 'qrcode';

/**
 * Standardize TOTP logic for GTM Adventures HQ
 * Using the exported functional API for Next.js 16/Turbopack compatibility.
 */

/**
 * Generates a new TOTP secret for a user.
 */
export function generateTOTPSecret(): string {
  return otpGenerateSecret();
}

/**
 * Generates a TOTP URL for use in a QR Code.
 */
export function getTOTPUrl(email: string, secret: string): string {
  return otpGenerateURI({
    issuer: 'GTM Adventures',
    label: email,
    secret
  });
}

/**
 * Generates a QR Code as a Data URL for the given TOTP URL.
 */
export async function generateQRCode(url: string): Promise<string> {
  return await QRCode.toDataURL(url);
}

/**
 * Verifies a TOTP token against a secret.
 */
export async function verifyTOTP(token: string, secret: string): Promise<boolean> {
  try {
    // The functional verify method returns an object with a 'valid' property or a boolean
    // depending on the internal otp strategy.
    const result = await otpVerify({ token, secret });
    return !!result;
  } catch (err) {
    console.error('[TOTP] Verification Error:', err);
    return false;
  }
}

/**
 * Checks if a user should be prompted for 2FA.
 */
export function shouldEnforce2FA(role: string): boolean {
  return role === 'ADMIN' || role === 'LEADER';
}
