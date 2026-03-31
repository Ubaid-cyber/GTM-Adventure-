import { prisma } from "./prisma";

/**
 * Smart Phone Normalization for Global & India (+91)
 */
function normalizePhone(phone: string): string {
  // 1. Strip all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // 2. If it already starts with '+', it is likely E.164 already
  if (phone.startsWith('+')) {
     return `+${cleaned}`;
  }

  // 3. Smart Detection for 10-digit (or local) numbers
  const defaultPrefix = (process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE || '+91').replace('+', '');
  
  // Example: 0... (local format) -> +COUNTRY_CODE...
  if (cleaned.startsWith('0') && cleaned.length >= 9) {
    cleaned = defaultPrefix + cleaned.substring(1);
  } 
  // Example: 6005888754 (10-digit) -> +916005888754
  else if (cleaned.length === 10) {
    cleaned = defaultPrefix + cleaned;
  }

  return `+${cleaned}`;
}

/**
 * Senior Architect Integration: Twilio Verify API
 */
export async function generateOTP(phone: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID
  const normalizedPhone = normalizePhone(phone);

  if (sid && token && serviceSid) {
    try {
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');
      const response = await fetch(
        `https://verify.twilio.com/v2/Services/${serviceSid}/Verifications`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
          },
          body: new URLSearchParams({
            To: normalizedPhone,
            Channel: 'sms',
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        const msg = errorData.message || 'Unknown Twilio Error';
        console.error(`[Twilio Verify] Error for ${normalizedPhone}:`, msg);
        
        if (msg.includes('Invalid parameter `To`')) {
          throw new Error(`The phone number ${normalizedPhone} is invalid for SMS. Please ensure it is a mobile number with the correct country code.`);
        }
        
        throw new Error(msg);
      }
      
      console.log(`[Twilio Verify] Verification code sent to ${normalizedPhone}`);
      return { success: true };
    } catch (err: any) {
      console.error('[Twilio Verify] Critical Error:', err.message);
      throw err;
    }
  } else {
    const msg = "Invalid Twilio Configuration. Please ensure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID are set in your .env file.";
    console.error(`[CRITICAL] OTP Engine initialization failed:`, msg);
    throw new Error(msg);
  }
}

/**
 * Verifies a token with Twilio Verify API
 */
export async function verifyOTP(phone: string, code: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID
  const normalizedPhone = normalizePhone(phone);
  
  if (sid && token && serviceSid) {
    try {
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');

      const response = await fetch(
        `https://verify.twilio.com/v2/Services/${serviceSid}/VerificationCheck`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${auth}`,
          },
          body: new URLSearchParams({
            To: normalizedPhone,
            Code: code,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[Twilio Verify] Check failed for ${normalizedPhone}:`, errorData.message);
        return false;
      }
      
      const data = await response.json();
      if (data.status !== 'approved') {
        console.warn(`[Twilio Verify] Code not approved for ${normalizedPhone}. Status: ${data.status}`);
        return false;
      }
      
      return true;
    } catch (err: any) {
      console.error('[Twilio Verify] Verification failed:', err.message);
      return false;
    }
  }

  return false;
}
