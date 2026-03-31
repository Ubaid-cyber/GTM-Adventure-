import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { verifyCredentials } from "./auth-service"

export const { handlers, auth, signIn, signOut } = NextAuth({
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
        code: { label: "Code", type: "text" }
      },
      async authorize(credentials) {
        // --- 1. PHONE AUTH (New) ---
        if (credentials?.phone && credentials?.code) {
          const { verifyOTP } = await import("./otp");
          const isValid = await verifyOTP(credentials.phone as string, credentials.code as string);
          if (isValid) {
            const { prisma } = await import("./prisma");
            let user = await (prisma.user as any).findFirst({
              where: { OR: [{ email: credentials.phone as string }, { name: credentials.phone as string }] }
            });
            if (!user) {
              user = await (prisma.user as any).create({
                data: {
                  name: `user-${(credentials.phone as string).slice(-4)}`,
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
          const user = await verifyCredentials(
            credentials.email as string, 
            credentials.password as string
          );

          if (user) {
            const { logSecurityEvent } = await import("./audit");
            await logSecurityEvent("LOGIN_SUCCESS", user.id, { email: user.email }, ip, userAgent);
            return user;
          }
          
          return null;
        } catch (error: any) {
          const { logSecurityEvent } = await import("./audit");
          await logSecurityEvent("LOGIN_FAILED", undefined, { email: credentials.email, error: error.message }, ip, userAgent);
          console.error('[NextAuth] Auth error:', error.message);
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
      if (session.user) {
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
