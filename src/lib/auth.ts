import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { sql } from './db-server'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-in-production')
const COOKIE_NAME = 'session'

export interface SessionUser {
  id: string
  name: string
  email: string
  role: string
  image?: string | null
}

export async function signJWT(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyJWT(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionUser
  } catch {
    return null
  }
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: SessionUser | null; error: string | null }> {
  try {
    const rows = await sql`
      SELECT id, full_name, email, role, password_hash, avatar_url
      FROM profiles
      WHERE email = ${email}
    ` as any[]

    const user = rows[0]
    if (!user) return { user: null, error: 'Invalid email or password' }
    if (!user.password_hash) return { user: null, error: 'Account not configured' }

    const isValid = await bcrypt.compare(password, user.password_hash)
    if (!isValid) return { user: null, error: 'Invalid email or password' }

    return {
      user: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        image: user.avatar_url || null,
      },
      error: null,
    }
  } catch (err: any) {
    console.error('[auth]', err)
    return { user: null, error: 'Authentication service unavailable' }
  }
}

export function getSessionCookie(name: string) {
  return `${COOKIE_NAME}=${name}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}
