import { verifyOTP } from "./otp";
import { auth } from "./auth";

/**
 * Security Guard: Senior Architect's Utility for Sensitive Actions.
 * Wraps any internal function with an OTP verification check.
 */
export async function withSecurityGuard<T>(
  action: () => Promise<T>,
  phoneNumber: string,
  otpToken?: string
): Promise<{ success: boolean; data?: T; error?: string }> {
  // 1. Check if we already have a token for this sensitive action
  if (!otpToken) {
    return { success: false, error: "OTP_REQUIRED" };
  }

  // 2. Verify OTP
  const isValid = await verifyOTP(phoneNumber, otpToken);
  if (!isValid) {
    return { success: false, error: "INVALID_OTP" };
  }

  // 3. Execute the protected action
  try {
    const result = await action();
    return { success: true, data: result };
  } catch (error: any) {
    console.error("[SecurityGuard] Action failed:", error.message);
    return { success: false, error: "ACTION_FAILED" };
  }
}

/**
 * Check if a session has 'Elevated' status (e.g. for Admin Dashboard)
 * In a real app, this might check a 'last_verified_at' timestamp in Redis.
 */
export async function isElevatedSession() {
  const session = await auth();
  if (!session?.user) return false;
  
  // Custom logic for Admin 'Command Key' elevation can go here
  return (session.user as any).role === "ADMIN";
}
