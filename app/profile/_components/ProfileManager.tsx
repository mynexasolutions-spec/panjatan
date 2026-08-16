'use client'

import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle, LogOut, Mail, MapPin, Package, Phone, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCustomer } from '@/context/CustomerContext'
import { LocalAddress, isValidIndianPhone } from '@/lib/local-customer'
import { useToast } from '@/context/ToastContext'

const EMPTY_ADDRESS: LocalAddress = {
  fullName: '',
  phone: '',
  alternatePhone: '',
  email: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
}

export default function ProfileManager() {
  const { customer, address, orders, isHydrated, logout, saveAddress, syncOrders } = useCustomer()
  const [profile, setProfile] = useState<LocalAddress>(EMPTY_ADDRESS)
  const [saved, setSaved] = useState(false)
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})
  const { showToast } = useToast()
  const router = useRouter()

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) => ({ ...prev, [orderId]: !prev[orderId] }))
  }

  useEffect(() => {
    if (!isHydrated) return
    if (!customer) {
      router.replace('/login?returnTo=%2Fprofile')
      return
    }
    setProfile((current) => ({
      ...(address || { ...EMPTY_ADDRESS, phone: customer.phone }),
      // Name and email always mirror the account — never the saved address —
      // so they stay locked even if an older cached address has stale values.
      fullName: customer.fullName,
      email: customer.email,
      phone: address?.phone || current.phone || customer.phone,
    }))
    void syncOrders()
  }, [address, customer, isHydrated, router, syncOrders])

  if (!isHydrated || !customer) {
    return <div className="rounded-2xl border border-cream-line bg-white p-8 text-center text-sm text-ink/60">Loading your account…</div>
  }

  const handleSave = (event: FormEvent) => {
    event.preventDefault()
    if (!profile.street.trim() || !profile.city.trim() || !profile.state.trim()) {
      showToast('Please complete all required address fields.', 'error')
      return
    }
    if (!isValidIndianPhone(profile.phone)) {
      showToast('Please enter a valid Indian mobile number.', 'error')
      return
    }
    if (!/^\d{6}$/.test(profile.zipCode)) {
      showToast('Please enter a valid 6-digit PIN code.', 'error')
      return
    }
    if (profile.alternatePhone && !isValidIndianPhone(profile.alternatePhone)) {
      showToast('Please enter a valid alternate Indian mobile number.', 'error')
      return
    }
    // Name and email are locked to the account regardless of form state.
    saveAddress({ ...profile, fullName: customer.fullName, email: customer.email })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const change = (field: keyof LocalAddress, value: string) =>
    setProfile((current) => ({ ...current, [field]: value }))

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-cream-line/75 bg-white p-6 shadow-card md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4 border-b border-cream-line/50 pb-5">
          <div>
            <p className="font-semibold text-ink">{customer.fullName}</p>
            <p className="mt-1 text-sm text-ink/55">{customer.email} · +91 {customer.phone}</p>
          </div>
          <button onClick={async () => { await logout(); router.replace('/login') }}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

       <form onSubmit={handleSave} className="space-y-6">
  {saved && (
    <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3.5 text-sm text-green-700">
      <CheckCircle className="h-5 w-5" /> Address saved.
    </div>
  )}
  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
    {/* Added icon={null} and changed pl-10 to px-4 for clean alignment */}
    <Field label="Full name" icon={null}>
      <input disabled value={profile.fullName}
        className="field-input cursor-not-allowed bg-cream/20 px-4 text-ink/55" />
    </Field>
    
    <Field label="Email address" icon={null}>
      <input disabled value={profile.email}
        className="field-input cursor-not-allowed bg-cream/20 px-4 text-ink/55" />
    </Field>
    
    <Field label="Mobile number" icon={null}>
      <input inputMode="numeric" maxLength={10} value={profile.phone}
        onChange={(e) => change('phone', e.target.value.replace(/\D/g, ''))}
        className="field-input px-4" />
    </Field>
    
    {/* If you want to remove the phone icon here too, change to icon={null} and pl-10 to px-4 */}
    <Field label="Alternate phone (optional)" icon={<Phone className="h-4 w-4" />}>
      <input inputMode="numeric" maxLength={10} value={profile.alternatePhone}
        onChange={(e) => change('alternatePhone', e.target.value.replace(/\D/g, ''))}
        className="field-input pl-10" />
    </Field>
  </div>
  <p className="text-xs text-ink/45 -mt-2">Name and email are tied to your account and can't be changed here.</p>
  
  <div className="space-y-4 border-t border-cream-line/50 pt-5">
    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink">
      <MapPin className="h-4 w-4 text-gold" /> Default shipping address
    </h3>
    <input required maxLength={150} value={profile.street} onChange={(e) => change('street', e.target.value)}
      placeholder="House, street, locality" className="field-input px-4" />
    <div className="grid grid-cols-2 gap-4">
      <input required maxLength={50} value={profile.city} onChange={(e) => change('city', e.target.value)}
        placeholder="City" className="field-input px-4" />
      <input required maxLength={50} value={profile.state} onChange={(e) => change('state', e.target.value)}
        placeholder="State" className="field-input px-4" />
    </div>
    <input required inputMode="numeric" maxLength={6} value={profile.zipCode}
      onChange={(e) => change('zipCode', e.target.value.replace(/\D/g, ''))}
      placeholder="6-digit PIN code" className="field-input px-4" />
  </div>
  <button className="w-full rounded-full bg-emerald px-4 py-3.5 font-semibold text-cream transition hover:bg-emerald-deep">
    Save address
  </button>
</form>

      </div>

      <div className="space-y-4 rounded-2xl border border-cream-line/75 bg-white p-6 shadow-card md:p-8">
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          <Package className="h-5 w-5 text-gold" /> Order history
        </h3>
        {orders.length ? orders.map((order) => {
          const isExpanded = !!expandedOrders[order.id]
          return (
            <div key={order.id} className="rounded-xl border border-cream-line bg-cream/20 p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-ink">Order #{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-ink/55">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                  <p className="mt-1 text-xs text-ink/55">
                    {order.items.length} item{order.items.length === 1 ? '' : 's'} ·{' '}
                    {order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Pay Online (Razorpay)'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-emerald">₹{order.total.toLocaleString('en-IN')}</p>
                  <span className="mt-2 inline-block rounded-md border border-cream-line bg-white px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-ink/60">
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Toggle Details Button */}
              <div className="flex justify-end border-t border-cream-line/30 pt-3">
                <button
                  type="button"
                  onClick={() => toggleOrder(order.id)}
                  className="text-xs font-bold text-emerald hover:text-emerald-deep hover:underline transition-all"
                >
                  {isExpanded ? 'Hide Details' : 'View Details'}
                </button>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-cream-line/35 pt-4 space-y-4 text-xs text-ink/80 animate-fade-in">
                  {/* Items List */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40">Items</p>
                    <div className="divide-y divide-cream-line/30 bg-white rounded-xl border border-cream-line/50 px-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-2.5">
                          <div>
                            <span className="font-semibold text-ink">{item.productName}</span>
                            {item.variantName && (
                              <span className="text-ink/60 block">Variant: {item.variantName}</span>
                            )}
                            <span className="text-ink/50 block">Qty: {item.quantity} · ₹{item.price} each</span>
                          </div>
                          <span className="font-bold text-ink shrink-0">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-1 bg-white rounded-xl border border-cream-line/50 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-1">Shipping Address</p>
                    <p className="font-semibold">{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                    <p className="text-ink/50 mt-1">Phone: {order.shippingAddress.phone}</p>
                  </div>

                  {/* Pricing Summary */}
                  <div className="bg-white rounded-xl border border-cream-line/50 p-3 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-1">Payment Summary</p>
                    <div className="flex justify-between">
                      <span className="text-ink/60">Subtotal</span>
                      <span className="font-medium text-ink">₹{order.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {order.shipping > 0 && (
                      <div className="flex justify-between">
                        <span className="text-ink/60">Shipping</span>
                        <span className="font-medium text-ink">₹{order.shipping}</span>
                      </div>
                    )}
                    {order.codFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-ink/60">COD Fee</span>
                        <span className="font-medium text-ink">₹{order.codFee}</span>
                      </div>
                    )}
                    {order.onlineDiscount > 0 && (
                      <div className="flex justify-between text-emerald font-semibold">
                        <span>Online Discount</span>
                        <span>-₹{order.onlineDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {order.discount > 0 && (
                      <div className="flex justify-between text-emerald font-semibold">
                        <span>Coupon Discount</span>
                        <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-cream-line/30 pt-2 font-bold text-sm">
                      <span className="text-ink">Grand Total</span>
                      <span className="text-emerald">₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-ink/50 border-t border-cream-line/30 pt-2">
                      <span>Payment Status</span>
                      <span className="uppercase font-semibold text-ink/80">{order.paymentStatus}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        }) : (
          <p className="py-6 text-center text-sm text-ink/50">No orders placed yet.</p>
        )}
      </div>
      <style jsx>{`
        :global(.field-input) {
          width: 100%;
          border: 1px solid rgba(181, 159, 126, 0.35);
          border-radius: 0.75rem;
          padding: 0.7rem 1rem;
          background: rgba(251, 247, 240, 0.2);
          color: inherit;
          outline: none;
        }
        :global(.field-input:focus) { border-color: #1e6645; box-shadow: 0 0 0 2px rgba(30, 102, 69, .12); }
      `}</style>
    </div>
  )
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink/60">{label}</span>
      <span className="relative block">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/30">{icon}</span>
        {children}
      </span>
    </label>
  )
}
