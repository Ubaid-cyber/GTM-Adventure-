import * as otplib from 'otplib';
import * as QRCode from 'qrcode';

/**
 * Standardize TOTP logic for GTM Adventures HQ.
 * Using a Dynamic detection pattern to handle complex Next.js 16 / Turbopack bundling.
 */

/**
 * Internal helper to find the authenticator instance or functional equivalents.
 */
function getAuth(): any {
  const mod = otplib as any;
  // Try common paths: named export, default export, or the module itself
  return mod.authenticator || mod.default?.authenticator || mod.totp || mod;
}

/**
 * Generates a new TOTP secret for a user.
 */
export function generateTOTPSecret(): string {
  const auth = getAuth();
  return (auth.generateSecret || auth.generate).call(auth);
}

/**
 * Generates a TOTP URL for use in a QR Code.
 */
export function getTOTPUrl(email: string, secret: string): string {
  const auth = getAuth();
  // Try keyuri (Authenticator) then generateURI (TOTP)
  const method = auth.keyuri || auth.generateURI;
  return method.call(auth, email, 'GTM Adventures', secret);
}

/**
 * Generates a QR Code as a Data URL for the given TOTP URL.
 */
export async function generateQRCode(url: string): Promise<string> {
  return await QRCode.toDataURL(url);
}

/**
 * Verifies a TOTP token against a secret.
 * Resilience: Handles both .check() and .verify() with dynamic window support.
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    if (!token || !secret) return false;
    const cleanToken = token.replace(/[\s-]/g, '');
    const auth = getAuth();

    // Try check() first (Authenticator standard), then verify() (TOTP standard)
    if (auth.check) {
      return auth.check(cleanToken, secret);
    }
    
    if (auth.verify) {
      // In some versions verify is functional: verify({ token, secret }) 
      // In others it's positional: verify(token, secret)
      try {
        return auth.verify({ token: cleanToken, secret, window: 1 });
      } catch {
        return auth.verify(cleanToken, secret);
      }
    }

    return false;
  } catch (err) {
    console.error('[TOTP] Critical Failure:', err);
    return false;
  }
}

/**
 * Checks if a user should be prompted for 2FA.
 */
export function shouldEnforce2FA(role: string): boolean {
  return role === 'ADMIN' || role === 'LEADER';
}
