import { requireAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { updateHomepageItemForm, updateHomepageSectionForm, createHomepageItemForm, deleteHomepageItemForm } from '@/actions/admin/cms'
import CmsSubmitButton from '@/components/admin/CmsSubmitButton'

export default async function HomepageContentPage() {
  const adminClient = await requireAdminClient()
  if (!adminClient) redirect('/admin/login')
  const { data } = await adminClient.from('homepage_sections').select('*, homepage_section_items(*)').order('display_order')
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Homepage Content</h1>
        <p className="mt-1 text-sm text-stone-500">Edit the fixed homepage sections without changing the storefront layout.</p>
      </div>
      {(data || []).map((section) => (
        <div key={section.id} className="space-y-3">
        <form action={updateHomepageSectionForm} className="grid gap-4 rounded-xl border border-stone-200 bg-white p-6 sm:grid-cols-2">
          <input type="hidden" name="section_key" value={section.section_key} />
          <h2 className="font-semibold capitalize text-stone-900 sm:col-span-2">{section.section_key.replaceAll('-', ' ')}</h2>
          <label className="space-y-1"><span className="text-sm text-stone-600">Heading</span><input name="heading" defaultValue={section.heading} className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="space-y-1"><span className="text-sm text-stone-600">Subheading</span><input name="subheading" defaultValue={section.subheading} className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="space-y-1 sm:col-span-2"><span className="text-sm text-stone-600">Body</span><textarea name="body" defaultValue={section.body} rows={3} className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="space-y-1"><span className="text-sm text-stone-600">Image URL</span><input name="image_url" defaultValue={section.image_url || ''} className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="space-y-1"><span className="text-sm text-stone-600">Display order</span><input name="display_order" type="number" min="0" defaultValue={section.display_order} className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="space-y-1"><span className="text-sm text-stone-600">Link label</span><input name="link_label" defaultValue={section.link_label || ''} className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="space-y-1"><span className="text-sm text-stone-600">Link URL</span><input name="link_url" defaultValue={section.link_url || ''} className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="flex items-center gap-2 text-sm"><input name="is_visible" type="checkbox" defaultChecked={section.is_visible} /> Visible</label>
          <div className="sm:text-right"><CmsSubmitButton /></div>
        </form>
        {(section.homepage_section_items || []).sort((a: any, b: any) => a.display_order - b.display_order).map((item: any) => (
          <form key={item.id} action={updateHomepageItemForm} className="ml-4 grid gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 sm:grid-cols-3">
            <input type="hidden" name="id" value={item.id} />
            <input name="title" defaultValue={item.title} placeholder="Item title" className="rounded-lg border px-3 py-2" />
            <input name="subtitle" defaultValue={item.subtitle} placeholder="Subtitle" className="rounded-lg border px-3 py-2" />
            <input name="display_order" type="number" min="0" defaultValue={item.display_order} className="rounded-lg border px-3 py-2" />
            <textarea name="body" defaultValue={item.body} placeholder="Body" rows={2} className="rounded-lg border px-3 py-2 sm:col-span-2" />
            <input name="image_url" defaultValue={item.image_url || ''} placeholder="Image URL" className="rounded-lg border px-3 py-2" />
            <input name="link_url" defaultValue={item.link_url || ''} placeholder="Link URL" className="rounded-lg border px-3 py-2" />
            <input name="metadata" defaultValue={JSON.stringify(item.metadata || {})} placeholder="Metadata JSON" className="rounded-lg border px-3 py-2 font-mono text-xs" />
            <div className="flex items-center justify-between"><label className="text-sm"><input name="is_visible" type="checkbox" defaultChecked={item.is_visible} /> Visible</label><CmsSubmitButton label="Save item" /></div>
          </form>
        ))}
        <details className="ml-4 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-emerald-800">+ Add new item</summary>
          <form action={createHomepageItemForm} className="mt-3 grid gap-3 sm:grid-cols-3">
            <input type="hidden" name="section_id" value={section.id} />
            <input name="title" required placeholder="Item title" className="rounded-lg border px-3 py-2" />
            <input name="subtitle" placeholder="Subtitle" className="rounded-lg border px-3 py-2" />
            <input name="display_order" type="number" min="0" defaultValue={((section.homepage_section_items || []).length) * 10} className="rounded-lg border px-3 py-2" />
            <textarea name="body" placeholder="Body / benefits" rows={2} className="rounded-lg border px-3 py-2 sm:col-span-2" />
            <input name="image_url" placeholder="Image URL" className="rounded-lg border px-3 py-2" />
            <input name="link_url" placeholder="Link URL" className="rounded-lg border px-3 py-2" />
            <input name="metadata" defaultValue="{}" placeholder="Metadata JSON" className="rounded-lg border px-3 py-2 font-mono text-xs" />
            <div className="flex items-center justify-between"><label className="text-sm"><input name="is_visible" type="checkbox" defaultChecked /> Visible</label><CmsSubmitButton label="Add item" /></div>
          </form>
        </details>
        {(section.homepage_section_items || []).length > 0 && (
          <details className="ml-4 rounded-xl border border-dashed border-red-200 bg-red-50/40 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-red-700">Remove an item</summary>
            <div className="mt-3 space-y-2">
              {(section.homepage_section_items || []).sort((a: any, b: any) => a.display_order - b.display_order).map((item: any) => (
                <form key={item.id} action={deleteHomepageItemForm} className="flex items-center justify-between gap-3 rounded-lg border border-stone-200 bg-white px-3 py-2">
                  <input type="hidden" name="id" value={item.id} />
                  <span className="text-sm text-stone-700">{item.title}</span>
                  <button className="text-xs font-semibold text-red-700 hover:underline">Delete</button>
                </form>
              ))}
            </div>
          </details>
        )}
        </div>
      ))}
    </div>
  )
}
