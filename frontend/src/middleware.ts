import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

const authConfig: NextAuthConfig = {
  providers: [],
  pages: { signIn: '/login' },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as any)?.role;
      const protectedRoutes = ['/dashboard', '/profile', '/bookings'];
      const isProtectedRoute = protectedRoutes.some((r) => nextUrl.pathname.startsWith(r));
      if (isProtectedRoute && !isLoggedIn) return false;
      if (nextUrl.pathname.startsWith('/leader')) return role === 'LEADER' || role === 'ADMIN';
      // 🛡️ Admin Check Deferred to Specific AdminLoginGate Component
      // if (nextUrl.pathname.startsWith('/admin')) return role === 'ADMIN';
      return true;
    },
  },
};

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const role = (req.auth?.user as any)?.role;

  const protectedRoutes = ['/dashboard', '/profile', '/bookings'];
  const isProtectedRoute = protectedRoutes.some((r) => nextUrl.pathname.startsWith(r));

  const authRoutes = ['/login', '/signup'];
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // 🛡️ REVERSE GUARD: If logged in, redirect away from auth pages
  if (isAuthRoute && isLoggedIn) {
    if (role === 'MEDICAL') return NextResponse.redirect(new URL('/medicalControl', nextUrl));
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  if (isProtectedRoute && !isLoggedIn) {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    console.warn(`[SECURITY] Unauthorized access attempt to ${nextUrl.pathname} from ${ip}`);
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  if (nextUrl.pathname.startsWith('/leader') && role !== 'LEADER' && role !== 'ADMIN') {
    const user = req.auth?.user?.email || 'anonymous';
    console.warn(`[SECURITY] Restricted role access attempt to ${nextUrl.pathname} by ${user}`);
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  // 🩺 MEDICAL route: only MEDICAL role allowed
  if (nextUrl.pathname.startsWith('/medicalControl') && role !== 'MEDICAL' && role !== 'ADMIN') {
    const user = req.auth?.user?.email || 'anonymous';
    console.warn(`[SECURITY] Medical dashboard access attempt by unauthorized user: ${user}`);
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  // 🛡️ Admin Intercept Deferred
  // AdminControl login intercepts are now natively handled by AdminLoginGate without bouncing users
  if (nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
    const user = req.auth?.user?.email || 'anonymous';
    console.warn(`[SECURITY] Admin access attempt to ${nextUrl.pathname} by ${user} (Deferred to Gate)`);
    // NO REDIRECT. Let the AdminLayout catch it and show the black card.
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
