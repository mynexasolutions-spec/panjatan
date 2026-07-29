import { requireAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { upsertContentPageForm } from '@/actions/admin/cms'
import CmsSubmitButton from '@/components/admin/CmsSubmitButton'

export default async function ContentPagesAdmin() {
  const adminClient = await requireAdminClient()
  if (!adminClient) redirect('/admin/login')
  const { data } = await adminClient.from('content_pages').select('*').order('slug')
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Content Pages</h1>
        <p className="mt-1 text-sm text-stone-500">About, contact and policy copy. Blocks use a JSON array of heading/body/items objects.</p>
      </div>
      {(data || []).map((page) => (
        <form key={page.slug} action={upsertContentPageForm} className="grid gap-4 rounded-xl border border-stone-200 bg-white p-6 sm:grid-cols-2">
          <input type="hidden" name="slug" value={page.slug} />
          <h2 className="font-semibold capitalize text-stone-900 sm:col-span-2">{page.slug}</h2>
          <label className="space-y-1"><span className="text-sm text-stone-600">Title</span><input name="title" defaultValue={page.title} className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="space-y-1"><span className="text-sm text-stone-600">Eyebrow</span><input name="eyebrow" defaultValue={page.eyebrow} className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="space-y-1 sm:col-span-2"><span className="text-sm text-stone-600">Summary</span><textarea name="summary" defaultValue={page.summary} rows={2} className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="space-y-1 sm:col-span-2"><span className="text-sm text-stone-600">Structured blocks (JSON)</span><textarea name="blocks" defaultValue={JSON.stringify(page.blocks, null, 2)} rows={12} spellCheck={false} className="w-full rounded-lg border px-3 py-2 font-mono text-xs" /></label>
          <label className="space-y-1"><span className="text-sm text-stone-600">SEO title</span><input name="seo_title" defaultValue={page.seo_title} className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="space-y-1"><span className="text-sm text-stone-600">SEO description</span><input name="seo_description" defaultValue={page.seo_description} className="w-full rounded-lg border px-3 py-2" /></label>
          <label className="flex items-center gap-2 text-sm"><input name="is_published" type="checkbox" defaultChecked={page.is_published} /> Published</label>
          <div className="sm:text-right"><CmsSubmitButton /></div>
        </form>
      ))}
    </div>
  )
}
