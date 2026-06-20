import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'

export async function GET(request: Request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.match(/session=([^;]+)/)
  const token = match?.[1]

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const user = await verifyJWT(token)
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  return NextResponse.json({ user })
}
