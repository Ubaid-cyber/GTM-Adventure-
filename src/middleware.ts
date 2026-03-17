import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { nextUrl } = req
  const role = (req.auth?.user as any)?.role

  // Protecting Leader Dashboard
  if (nextUrl.pathname.startsWith('/leader') && role !== 'LEADER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  // Protecting Admin Dashboard
  if (nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
