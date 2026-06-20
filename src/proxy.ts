import { NextResponse, type NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('session')?.value

  const protectedPaths = ['/admin', '/teacher', '/accounts']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    const user = await verifyJWT(token)

    if (!user) {
      const res = NextResponse.redirect(new URL('/auth/login', request.url))
      res.cookies.set('session', '', { maxAge: 0 })
      return res
    }

    const isAuthorized =
      (pathname.startsWith('/admin') && user.role === 'admin') ||
      (pathname.startsWith('/teacher') && user.role === 'teacher') ||
      (pathname.startsWith('/accounts') && user.role === 'accountant')

    if (!isAuthorized) {
      const redirectMap: Record<string, string> = {
        admin: '/admin',
        teacher: '/teacher',
        accountant: '/accounts',
      }
      return NextResponse.redirect(new URL(redirectMap[user.role] || '/auth/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
