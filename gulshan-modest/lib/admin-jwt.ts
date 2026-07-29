export const ADMIN_SESSION_COOKIE = 'panjatan-admin-session'
export const ADMIN_SESSION_MAX_AGE = 8 * 60 * 60

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const issuer = 'panjatan-admin'
const audience = 'panjatan-admin'

export type AdminSession = {
  sub: 'admin'
  email: string
  role: 'admin'
  iat: number
  exp: number
  iss: typeof issuer
  aud: typeof audience
}

function base64UrlEncode(value: string | Uint8Array) {
  const bytes = typeof value === 'string' ? encoder.encode(value) : value
  let binary = ''

  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index])
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function getSigningSecret() {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSWORD

  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET or ADMIN_PASSWORD must be configured')
  }

  return secret
}

async function getSigningKey(usage: KeyUsage[]) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getSigningSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usage
  )
}

export async function createAdminToken(email: string) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload: AdminSession = {
    sub: 'admin',
    email,
    role: 'admin',
    iat: now,
    exp: now + ADMIN_SESSION_MAX_AGE,
    iss: issuer,
    aud: audience,
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const unsignedToken = `${header}.${encodedPayload}`
  const key = await getSigningKey(['sign'])
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(unsignedToken)
  )

  return `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`
}

export async function verifyAdminToken(
  token: string | null | undefined
): Promise<AdminSession | null> {
  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const header = JSON.parse(decoder.decode(base64UrlDecode(encodedHeader)))

    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null

    const key = await getSigningKey(['verify'])
    const validSignature = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlDecode(encodedSignature),
      encoder.encode(`${encodedHeader}.${encodedPayload}`)
    )

    if (!validSignature) return null

    const payload = JSON.parse(
      decoder.decode(base64UrlDecode(encodedPayload))
    ) as AdminSession
    const now = Math.floor(Date.now() / 1000)

    if (
      payload.sub !== 'admin' ||
      payload.role !== 'admin' ||
      payload.iss !== issuer ||
      payload.aud !== audience ||
      typeof payload.email !== 'string' ||
      typeof payload.exp !== 'number' ||
      payload.exp <= now
    ) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
