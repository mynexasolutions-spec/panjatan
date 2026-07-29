export const CUSTOMER_SESSION_COOKIE = 'gulshan-user-session'
export const CUSTOMER_SESSION_MAX_AGE = 30 * 24 * 60 * 60

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const issuer = 'panjatan-customer'
const audience = 'panjatan-storefront'

export type CustomerSession = {
  sub: string
  email: string
  full_name: string
  role: 'customer'
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
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64UrlDecode(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function getSigningSecret() {
  const dedicated =
    process.env.CUSTOMER_SESSION_SECRET || process.env.ADMIN_JWT_SECRET
  if (process.env.NODE_ENV === 'production' && !dedicated) {
    throw new Error(
      'CUSTOMER_SESSION_SECRET or ADMIN_JWT_SECRET must be configured in production'
    )
  }
  const secret = dedicated || process.env.ADMIN_PASSWORD
  if (!secret) throw new Error('CUSTOMER_SESSION_SECRET must be configured')
  return secret
}

async function getKey(usage: KeyUsage[]) {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(getSigningSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    usage
  )
}

export async function createCustomerToken(input: {
  id: string
  email: string
  full_name?: string | null
}) {
  const now = Math.floor(Date.now() / 1000)
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload: CustomerSession = {
    sub: input.id,
    email: input.email,
    full_name: input.full_name || 'Customer',
    role: 'customer',
    iat: now,
    exp: now + CUSTOMER_SESSION_MAX_AGE,
    iss: issuer,
    aud: audience,
  }
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const unsigned = `${header}.${encodedPayload}`
  const signature = await crypto.subtle.sign(
    'HMAC',
    await getKey(['sign']),
    encoder.encode(unsigned)
  )
  return `${unsigned}.${base64UrlEncode(new Uint8Array(signature))}`
}

export async function verifyCustomerToken(
  token: string | null | undefined
): Promise<CustomerSession | null> {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerValue, payloadValue, signatureValue] = parts
    const header = JSON.parse(decoder.decode(base64UrlDecode(headerValue)))
    if (header.alg !== 'HS256' || header.typ !== 'JWT') return null
    const valid = await crypto.subtle.verify(
      'HMAC',
      await getKey(['verify']),
      base64UrlDecode(signatureValue),
      encoder.encode(`${headerValue}.${payloadValue}`)
    )
    if (!valid) return null
    const payload = JSON.parse(
      decoder.decode(base64UrlDecode(payloadValue))
    ) as CustomerSession
    const now = Math.floor(Date.now() / 1000)
    if (
      payload.role !== 'customer' ||
      payload.iss !== issuer ||
      payload.aud !== audience ||
      typeof payload.sub !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.sub) ||
      typeof payload.email !== 'string' ||
      typeof payload.exp !== 'number' ||
      payload.exp <= now
    ) return null
    return payload
  } catch {
    return null
  }
}
