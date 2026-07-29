import { requireAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { updateSubscriberStatusForm } from '@/actions/admin/cms'

export default async function NewsletterAdminPage() {
  const adminClient = await requireAdminClient()
  if (!adminClient) redirect('/admin/login')
  const { data } = await adminClient.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false })
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div><h1 className="text-2xl font-bold text-stone-900">Newsletter Subscribers</h1><p className="mt-1 text-sm text-stone-500">{data?.length || 0} subscriber records.</p></div>
      <div className="overflow-hidden rounded-xl border bg-white">
        {(data || []).length === 0 && <p className="p-6 text-sm text-stone-500">No subscribers yet.</p>}
        {(data || []).map((subscriber) => (
          <div key={subscriber.id} className="grid grid-cols-[1fr_140px_130px] items-center gap-3 border-b px-4 py-3 text-sm last:border-0">
            <div><p className="font-medium">{subscriber.email}</p><p className="text-xs text-stone-500">{new Date(subscriber.subscribed_at).toLocaleString('en-IN')}</p></div>
            <span className="capitalize">{subscriber.status}</span>
            <form action={updateSubscriberStatusForm}>
              <input type="hidden" name="id" value={subscriber.id} />
              <input type="hidden" name="status" value={subscriber.status === 'active' ? 'unsubscribed' : 'active'} />
              <button className="text-teal-700 hover:underline">{subscriber.status === 'active' ? 'Unsubscribe' : 'Reactivate'}</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  )
}
