import { requireAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { createNavigationLinkForm, deleteNavigationLinkForm } from '@/actions/admin/cms'
import CmsSubmitButton from '@/components/admin/CmsSubmitButton'

export default async function NavigationAdminPage() {
  const adminClient = await requireAdminClient()
  if (!adminClient) redirect('/admin/login')
  const { data } = await adminClient.from('navigation_links').select('*').order('location').order('display_order')
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div><h1 className="text-2xl font-bold text-stone-900">Navigation</h1><p className="mt-1 text-sm text-stone-500">Ordered header, footer and legal links.</p></div>
      <form action={createNavigationLinkForm} className="grid gap-4 rounded-xl border bg-white p-6 sm:grid-cols-5">
        <select name="location" className="rounded-lg border px-3 py-2"><option value="header">Header</option><option value="footer">Footer</option><option value="legal">Legal</option></select>
        <input name="label" required placeholder="Label" className="rounded-lg border px-3 py-2" />
        <input name="href" required placeholder="/path or https://…" className="rounded-lg border px-3 py-2" />
        <input name="display_order" type="number" min="0" defaultValue="0" className="rounded-lg border px-3 py-2" />
        <div className="flex items-center justify-between gap-2"><label className="text-xs"><input name="is_external" type="checkbox" /> External</label><CmsSubmitButton label="Add" /></div>
      </form>
      <div className="overflow-hidden rounded-xl border bg-white">
        {(data || []).map((link) => (
          <div key={link.id} className="grid grid-cols-[90px_1fr_2fr_auto] items-center gap-3 border-b px-4 py-3 text-sm last:border-0">
            <span className="rounded bg-stone-100 px-2 py-1 text-center text-xs uppercase">{link.location}</span>
            <span className="font-medium">{link.label}</span><span className="truncate text-stone-500">{link.href}</span>
            <form action={deleteNavigationLinkForm}><input type="hidden" name="id" value={link.id} /><button className="text-red-700 hover:underline">Delete</button></form>
          </div>
        ))}
      </div>
    </div>
  )
}
