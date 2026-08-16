import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Razorpay webhook — the authoritative confirmation path alongside the
 * browser-side signature verification in actions/checkout.ts
 * (verifyRazorpayPayment). Either one marking an order 'paid' is
 * sufficient; both are idempotent against the order's current status.
 * Configure this URL (https://<domain>/api/webhooks/razorpay) and the
 * "payment.captured", "payment.failed" and "order.paid" events in the
 * Razorpay dashboard, and set RAZORPAY_WEBHOOK_SECRET to match.
 *
 * Stock is intentionally NOT touched here — place_guest_order/place_order
 * already decrement it atomically when the order row is created, before
 * the Razorpay order even exists.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('[Razorpay Webhook Error]: RAZORPAY_WEBHOOK_SECRET is not configured on server.')
      return NextResponse.json(
        { success: false, error: 'Webhook secret is not configured on server environment' },
        { status: 500 }
      )
    }

    if (!signature) {
      console.error('[Razorpay Webhook Error]: Missing x-razorpay-signature header.')
      return NextResponse.json({ success: false, error: 'Missing x-razorpay-signature header' }, { status: 400 })
    }

    const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')

    const signatureBuffer = Buffer.from(signature, 'utf8')
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8')

    let isValid = false
    if (signatureBuffer.length === expectedBuffer.length) {
      isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
    }

    if (!isValid) {
      console.error('[Razorpay Webhook Error]: Signature mismatch. Untrusted webhook payload received.')
      return NextResponse.json({ success: false, error: 'Invalid webhook signature' }, { status: 400 })
    }

    const eventData = JSON.parse(rawBody)
    const event = eventData.event as string
    const payload = eventData.payload

    console.log(`[Razorpay Webhook]: Received valid event '${event}'`)

    const supabaseAdmin = createAdminClient()

    switch (event) {
      case 'payment.captured':
      case 'order.paid': {
        const payment = payload?.payment?.entity
        const orderEntity = payload?.order?.entity
        const razorpayOrderId: string | undefined = payment?.order_id || orderEntity?.id
        const razorpayPaymentId: string | undefined = payment?.id
        if (!razorpayOrderId) break

        const { data: order, error: fetchError } = await supabaseAdmin
          .from('orders')
          .select('id, payment_status')
          .eq('razorpay_order_id', razorpayOrderId)
          .maybeSingle()

        if (fetchError) {
          console.error('[Razorpay Webhook Error]: Failed fetching order:', fetchError.message)
          break
        }
        if (!order) {
          console.warn(`[Razorpay Webhook]: No order found for razorpay_order_id ${razorpayOrderId}`)
          break
        }
        if (order.payment_status === 'paid') break

        const { error: updateErr } = await supabaseAdmin
          .from('orders')
          .update({
            payment_status: 'paid',
            order_status: 'processing',
            razorpay_payment_id: razorpayPaymentId || null,
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', order.id)

        if (updateErr) {
          console.error(`[Razorpay Webhook Error]: DB update failed for ${event}:`, updateErr.message)
        } else {
          console.log(`[Razorpay Webhook]: Order ${order.id} marked paid via '${event}'.`)
        }
        break
      }

      case 'payment.failed': {
        const payment = payload?.payment?.entity
        const razorpayOrderId: string | undefined = payment?.order_id
        if (!razorpayOrderId) break

        const { data: order, error: fetchError } = await supabaseAdmin
          .from('orders')
          .select('id, payment_status')
          .eq('razorpay_order_id', razorpayOrderId)
          .maybeSingle()

        if (fetchError) {
          console.error('[Razorpay Webhook Error]: Failed fetching order:', fetchError.message)
          break
        }
        if (!order || order.payment_status === 'paid') break

        const { error: updateErr } = await supabaseAdmin
          .from('orders')
          .update({ payment_status: 'failed', updated_at: new Date().toISOString() })
          .eq('id', order.id)

        if (updateErr) {
          console.error('[Razorpay Webhook Error]: DB update failed for payment.failed:', updateErr.message)
        }
        break
      }

      default:
        console.log(`[Razorpay Webhook]: Unhandled event type '${event}' acknowledged.`)
        break
    }

    return NextResponse.json({ success: true, event }, { status: 200 })
  } catch (error) {
    console.error('[Razorpay Webhook Critical Error]:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    )
  }
}
