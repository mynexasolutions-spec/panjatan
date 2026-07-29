import { v2 as cloudinary } from 'cloudinary'
import { requireAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const adminClient = await requireAdminClient()
  if (!adminClient) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const paramsToSign = body?.paramsToSign
  if (!paramsToSign || typeof paramsToSign !== 'object' || Array.isArray(paramsToSign)) {
    return Response.json({ error: 'Invalid signing parameters' }, { status: 400 })
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!apiSecret) {
    return Response.json({ error: 'Cloudinary is not configured' }, { status: 503 })
  }

  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: apiSecret,
  })

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret)

  return Response.json({ signature })
}
