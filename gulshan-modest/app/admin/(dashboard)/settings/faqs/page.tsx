import { getGlobalFaqs } from '@/actions/global_faqs'
import { GlobalFaqsEditor } from '@/components/admin/GlobalFaqsEditor'

export const metadata = {
  title: 'Global FAQs | Gulshan Modest Admin',
}

export default async function GlobalFaqsPage() {
  const { data: initialFaqs } = await getGlobalFaqs()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Global FAQs</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage the universal frequently asked questions that apply to your store.
        </p>
      </div>

      <div className="bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
        <GlobalFaqsEditor initialFaqs={initialFaqs || []} />
      </div>
    </div>
  )
}
