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
      if (nextUrl.pathname.startsWith('/admin')) return role === 'ADMIN';
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

  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  if (nextUrl.pathname.startsWith('/leader') && role !== 'LEADER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  if (nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
