import { requireAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { DEFAULT_SITE_SETTINGS } from '@/lib/cms'
import { updateSiteSettingsForm } from '@/actions/admin/cms'
import CmsSubmitButton from '@/components/admin/CmsSubmitButton'

const fields = [
  ['site_name', 'Site name'],
  ['tagline', 'Tagline'],
  ['support_email', 'Support email'],
  ['support_phone', 'Support phone'],
  ['whatsapp_number', 'WhatsApp number (digits only)'],
  ['whatsapp_message', 'Default WhatsApp message'],
  ['business_hours', 'Business hours'],
  ['address', 'Business address'],
  ['announcement_text', 'Header announcement'],
  ['shop_banner_title', 'Shop banner title'],
  ['shop_banner_description', 'Shop banner description'],
  ['facebook_url', 'Facebook URL'],
  ['instagram_url', 'Instagram URL'],
  ['youtube_url', 'YouTube URL'],
  ['default_seo_title', 'Default SEO title'],
  ['default_seo_description', 'Default SEO description'],
] as const

export default async function GeneralContentPage() {
  const adminClient = await requireAdminClient()
  if (!adminClient) redirect('/admin/login')
  const { data } = await adminClient.from('site_settings').select('*').eq('id', 'global').maybeSingle()
  const settings = data || DEFAULT_SITE_SETTINGS
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">General Storefront Settings</h1>
        <p className="mt-1 text-sm text-stone-500">Brand, support, social, announcement, shop banner and SEO defaults.</p>
      </div>
      <form action={updateSiteSettingsForm} className="grid gap-5 rounded-xl border border-stone-200 bg-white p-6 sm:grid-cols-2">
        {fields.map(([name, label]) => {
          const long = ['tagline', 'whatsapp_message', 'address', 'announcement_text', 'shop_banner_description', 'default_seo_description'].includes(name)
          return (
            <label key={name} className={long ? 'space-y-1 sm:col-span-2' : 'space-y-1'}>
              <span className="text-sm font-medium text-stone-700">{label}</span>
              {long ? (
                <textarea name={name} defaultValue={String(settings[name] || '')} rows={3} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
              ) : (
                <input name={name} defaultValue={String(settings[name] || '')} className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
              )}
            </label>
          )
        })}
        <div className="sm:col-span-2"><CmsSubmitButton /></div>
      </form>
    </div>
  )
}
