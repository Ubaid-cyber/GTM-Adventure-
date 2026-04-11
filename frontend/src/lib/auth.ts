import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { verifyCredentials } from "./auth-service"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        phone: { label: "Phone", type: "text" },
        code: { label: "Code", type: "text" },
        totpCode: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials) {
        // --- 1. PHONE AUTH (New) ---
        if (credentials?.phone && credentials?.code) {
          const { verifyOTP } = await import("./otp");
          const isValid = await verifyOTP(credentials.phone as string, credentials.code as string);
          if (isValid) {
            const { prisma } = await import("./prisma");
            let user = await (prisma.user as any).findFirst({
              where: { phone: credentials.phone as string }
            });
            if (!user) {
              // Only create if truly new
              user = await (prisma.user as any).create({
                data: {
                  name: `trekker-${(credentials.phone as string).slice(-4)}`,
                  email: `${credentials.phone}@gtm-mobile.com`,
                  phone: credentials.phone as string,
                  role: 'TREKKER'
                }
              });
            }
            return user;
          }
          return null;
        }

        // --- 2. TRADITIONAL EMAIL AUTH ---
        if (!credentials?.email || !credentials?.password) return null;
        
        const { headers } = await import("next/headers");
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "unknown";
        const userAgent = headerList.get("user-agent") || "unknown";

        // 1. Account Lockout Check (Secure Access Control)
        const { rateLimit } = await import("./rate-limit");
        const { success } = await rateLimit(`login:${credentials.email}`, 5, 600); // 10 min lockout
        if (!success) {
          const { logSecurityEvent } = await import("./audit");
          await logSecurityEvent("ACCOUNT_LOCKED", undefined, { email: credentials.email }, ip, userAgent);
          throw new Error("ACCOUNT_LOCKED");
        }

        try {
          console.log(`[AuthDebug] Login Attempt: ${credentials.email}`);
          const user = await verifyCredentials(
            credentials.email as string, 
            credentials.password as string
          );

          if (!user) {
            console.log(`[AuthDebug] verifyCredentials returned NULL`);
            return null;
          }

          // --- 3. ROLE-BASED 2FA (MANDATORY FOR STAFF ONLY) ---
          // Trekkers are bypassed (protected by rate-limiters & security headers)
          // 🔴 2FA TEMPORARILY DISABLED — re-enable by changing `false` back to isStaff below
          const { prisma } = await import("./prisma");
          const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
          
          const isStaff = false; // TODO: restore → dbUser?.role === 'ADMIN' || dbUser?.role === 'LEADER' || dbUser?.role === 'MEDICAL'
          
          if (isStaff && dbUser?.twoFactorEnabled) {
            if (!credentials.totpCode) {
              console.log(`[AuthDebug] 2FA Mandate Triggered for Staff: ${user.email}`);
              throw new Error("2FA_REQUIRED"); 
            }
            const { verifyTOTP } = await import("./totp");
            const isValidTOTP = await verifyTOTP(credentials.totpCode as string, dbUser.twoFactorSecret!);
            
            if (!isValidTOTP) {
              console.log(`[AuthDebug] 2FA INVALID CODE FOR STAFF`);
              throw new Error("INVALID_2FA_CODE");
            }
            console.log(`[AuthDebug] Staff 2FA Verified Successfully`);
          }

          return user;

        } catch (error: any) {
          console.error(`[AuthDebug] Internal Auth Error:`, error.message);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
        (session.user as any).id = token.sub;
      }
      return session;
    }
  },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
});
