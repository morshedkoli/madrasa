import { NextResponse } from 'next/server'
import { authenticateUser, signJWT, getSessionCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const { user, error } = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json({ error }, { status: 401 })
    }

    const token = await signJWT(user)

    const response = NextResponse.json({ user, token })
    response.headers.set('Set-Cookie', getSessionCookie(token))

    return response
  } catch (err: any) {
    console.error('[api:login]', err)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
