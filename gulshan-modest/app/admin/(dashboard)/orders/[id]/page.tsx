import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, User, MapPin, Package, CreditCard } from 'lucide-react'
import { OrderStatusManager } from '../_components/OrderStatusManager'

export const metadata = {
  title: 'Order Details | Admin Dashboard',
}

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const orderId = resolvedParams.id
  const supabase = await createClient()

  // Fetch Order Details
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      *,
      profiles:user_id (
        full_name,
        email,
        phone
      ),
      addresses:address_id (
        full_name,
        phone,
        alternate_phone,
        address_line_1,
        city,
        state,
        postal_code
      ),
      order_items (*)
    `)
    .eq('id', orderId)
    .single()

  if (orderError) {
    console.error('Failed to load order', orderId, orderError)
  }

  if (!order) {
    notFound()
  }

  // order_items.product_id has no DB foreign key to products (some legacy/mock
  // rows may not resolve), so look products up separately rather than embedding.
  const productIds = Array.from(new Set((order.order_items || []).map((item: any) => item.product_id).filter(Boolean)))

  let productsById: Record<string, { image_url: string; is_active: boolean }> = {}
  if (productIds.length > 0) {
    const { data: productsData } = await supabase
      .from('products')
      .select('id, is_active, featured_image_url, product_images ( image_url )')
      .in('id', productIds)

    productsById = (productsData || []).reduce((acc: any, p: any) => {
      acc[p.id] = {
        image_url: p.product_images?.[0]?.image_url || p.featured_image_url || null,
        is_active: p.is_active,
      }
      return acc
    }, {})
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/orders"
          className="p-2 bg-white border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Order {order.order_number}</h1>
          <p className="text-sm text-stone-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Details & Items */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-stone-400" />
                Customer
              </h3>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-stone-900">{order.profiles?.full_name || 'Guest'}</p>
                <p className="text-stone-600">{order.profiles?.email}</p>
                {order.profiles?.phone && <p className="text-stone-600">{order.profiles.phone}</p>}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
              <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-stone-400" />
                Shipping Address
              </h3>
              {order.addresses ? (
                <div className="space-y-1 text-sm text-stone-600">
                  <p className="font-medium text-stone-900 mb-1">{order.addresses.full_name}</p>
                  <p>{order.addresses.address_line_1}</p>
                  <p>{order.addresses.city}, {order.addresses.state} {order.addresses.postal_code}</p>
                  <p className="mt-2 pt-2 border-t border-stone-100">Phone: {order.addresses.phone}</p>
                  {order.addresses.alternate_phone && (
                    <p>Alternate: {order.addresses.alternate_phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-stone-500 italic">No address details available.</p>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden">
            <div className="p-6 border-b border-stone-200/60 flex items-center gap-2">
              <Package className="w-5 h-5 text-stone-400" />
              <h3 className="text-lg font-bold text-stone-900">Order Items</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Product</th>
                    <th className="px-6 py-4 font-semibold">Variant</th>
                    <th className="px-6 py-4 font-semibold">Product ID</th>
                    <th className="px-6 py-4 font-semibold">Unit Price</th>
                    <th className="px-6 py-4 font-semibold">Qty</th>
                    <th className="px-6 py-4 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {order.order_items?.map((item: any) => {
                    const product = item.product_id ? productsById[item.product_id] : null
                    const href = product?.is_active ? `/shop/${item.product_id}` : null

                    const thumbnail = (
                      <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 border border-stone-200 bg-stone-100">
                        {product?.image_url ? (
                          <Image src={product.image_url} alt={item.product_name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px] font-medium">
                            IMG
                          </div>
                        )}
                      </div>
                    )

                    return (
                      <tr key={item.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4">
                          {href ? (
                            <Link href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
                              {thumbnail}
                              <span className="font-medium text-stone-900 group-hover:text-orange-600 transition-colors">
                                {item.product_name}
                              </span>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-3">
                              {thumbnail}
                              <div>
                                <span className="font-medium text-stone-900">{item.product_name}</span>
                                <span className="block text-[11px] text-stone-400 font-medium">
                                  {product ? 'Inactive — not viewable on site' : 'Product no longer available'}
                                </span>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-stone-600">{item.variant_name}</td>
                        <td className="px-6 py-4 text-stone-400 text-xs">{item.product_id || '—'}</td>
                        <td className="px-6 py-4 text-stone-600">₹{item.price_at_purchase}</td>
                        <td className="px-6 py-4 text-stone-600">{item.quantity}</td>
                        <td className="px-6 py-4 font-medium text-stone-900 text-right">₹{item.line_total}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Status & Summary */}
        <div className="space-y-6">
          
          <OrderStatusManager 
            orderId={order.id} 
            initialOrderStatus={order.order_status}
            initialPaymentStatus={order.payment_status}
          />

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-stone-400" />
              Payment Summary
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-medium text-stone-900">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                {order.shipping_cost === 0 ? (
                  <span className="font-medium text-green-600">Free</span>
                ) : (
                  <span className="font-medium text-stone-900">₹{order.shipping_cost}</span>
                )}
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between items-center">
                <span className="font-bold text-stone-900">Total</span>
                <span className="text-xl font-bold text-orange-600">₹{order.total_amount}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-stone-200">
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Payment Method</p>
              <p className="text-sm font-medium text-stone-900">{order.payment_method}</p>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
            <h3 className="text-lg font-bold text-stone-900 mb-6">Timeline</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">Order Placed</span>
                <span className="font-medium text-stone-900">
                  {new Date(order.created_at).toLocaleString('en-IN', {
                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              {order.paid_at && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Paid</span>
                  <span className="font-medium text-stone-900">
                    {new Date(order.paid_at).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {order.shipped_at && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Shipped</span>
                  <span className="font-medium text-stone-900">
                    {new Date(order.shipped_at).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {order.delivered_at && (
                <div className="flex justify-between">
                  <span className="text-stone-500">Delivered</span>
                  <span className="font-medium text-stone-900">
                    {new Date(order.delivered_at).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {order.cancelled_at && (
                <div className="flex justify-between text-red-600">
                  <span>Cancelled</span>
                  <span className="font-medium">
                    {new Date(order.cancelled_at).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
