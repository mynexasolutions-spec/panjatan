'use client'

import { useState, useEffect } from 'react'
import { User, Phone, MapPin, CheckCircle, Package, Mail } from 'lucide-react'
import { updateCustomerFullProfile } from '@/actions/profile'
import { useToast } from '@/context/ToastContext'

type CustomerProfile = {
  fullName: string
  phone: string
  alternatePhone: string
  street: string
  city: string
  state: string
  zipCode: string
}

export default function ProfileManager({ adminProfile, orders = [] }: { adminProfile: any, orders?: any[] }) {
  const [profile, setProfile] = useState<CustomerProfile>({
    fullName: '',
    phone: '',
    alternatePhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
  })
  const [saved, setSaved] = useState(false)
  const { showToast } = useToast()

  // Load profile data on mount
  useEffect(() => {
    if (adminProfile) {
      setProfile({
        fullName: adminProfile.full_name || '',
        phone: adminProfile.phone || '',
        alternatePhone: adminProfile.alternatePhone || '',
        street: adminProfile.street || '',
        city: adminProfile.city || '',
        state: adminProfile.state || '',
        zipCode: adminProfile.zipCode || '',
      })
    } else if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('gulshan-customer-profile')
      if (savedData) {
        try {
          setProfile(JSON.parse(savedData))
        } catch (e) {
          console.error('Failed to parse profile data', e)
        }
      }
    }
  }, [adminProfile])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (adminProfile) {
      const res = await updateCustomerFullProfile(profile)
      if (res.error) {
        showToast(res.error, 'error')
        return
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('gulshan-customer-profile', JSON.stringify(profile))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const handleChange = (field: keyof CustomerProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8">
      {/* Form Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card border border-cream-line/75">
        <form onSubmit={handleSave} className="space-y-6">
          {saved && (
            <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              <span>Shipping address and profile saved successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profile.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="e.g. Sumaiya Khan"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink/30" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={adminProfile?.email || ''}
                  placeholder="e.g. customer@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-line bg-cream/10 text-ink/50 cursor-not-allowed focus:outline-none text-[15px]"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink/30" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink/30" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                Alternate Phone Number <span className="text-ink/30 normal-case font-medium">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.alternatePhone}
                  onChange={(e) => handleChange('alternatePhone', e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
                />
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-ink/30" />
              </div>
            </div>
          </div>

          <div className="border-t border-cream-line/50 pt-5 space-y-4">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold" /> Default Shipping Address
            </h3>

            <div>
              <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                Street Address
              </label>
              <input
                type="text"
                required
                value={profile.street}
                onChange={(e) => handleChange('street', e.target.value)}
                placeholder="e.g. Apartment, Suite, Block number"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={profile.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={profile.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="e.g. Delhi"
                  className="w-full px-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">
                PIN Code / ZIP Code
              </label>
              <input
                type="text"
                required
                value={profile.zipCode}
                onChange={(e) => handleChange('zipCode', e.target.value)}
                placeholder="e.g. 110001"
                className="w-full px-4 py-2.5 rounded-xl border border-cream-line bg-cream/20 text-ink focus:outline-none focus:ring-2 focus:ring-emerald/20 focus:border-emerald transition-all text-[15px]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-emerald text-cream font-body font-semibold rounded-full shadow-card hover:bg-emerald-deep transition-all duration-200"
          >
            Save Account Details
          </button>
        </form>
      </div>

      {/* Orders Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-card border border-cream-line/75 space-y-4">
        <h3 className="text-base font-semibold text-ink flex items-center gap-2">
          <Package className="w-5 h-5 text-gold" /> Order History
        </h3>
        {orders && orders.length > 0 ? (
          <div className="space-y-4 mt-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-cream-line rounded-xl p-4 flex justify-between items-center bg-cream/20">
                <div>
                  <div className="font-bold text-ink">Order #{order.order_number}</div>
                  <div className="text-xs text-ink/60 mt-1">
                    {(() => {
                      const d = new Date(order.created_at)
                      const day = d.getUTCDate()
                      const month = d.getUTCMonth() + 1
                      const year = d.getUTCFullYear()
                      return `${day}/${month}/${year}`
                    })()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-emerald">₹{order.total_amount}</div>
                  <div className="text-xs uppercase tracking-wider font-bold mt-1 text-ink/60 bg-cream border border-cream-line px-2 py-0.5 rounded-md inline-block">
                    {order.order_status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-ink/50 text-sm">
            No orders placed yet. Add items to your cart and enquiry to get started!
          </div>
        )}
      </div>
    </div>
  )
}
