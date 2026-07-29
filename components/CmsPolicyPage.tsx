import Header from '@/components/Header'
import Footer from '@/components/Footer'
import FloatingWhatsApp from '@/components/FloatingWhatsApp'
import CmsContentBlocks from '@/components/CmsContentBlocks'
import { getContentPage } from '@/lib/cms'

export default async function CmsPolicyPage({ slug }: { slug: 'privacy' | 'refund' | 'shipping' | 'terms' }) {
  const page = await getContentPage(slug)
  if (!page) throw new Error(`Published ${slug} content is missing.`)
  return (
    <main className="flex min-h-screen flex-col overflow-x-hidden bg-cream pt-[72px] md:pt-[84px]">
      <Header />
      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-16 md:py-24">
        <h1 className="mb-4 font-display text-3xl font-semibold text-ink md:text-4xl">{page.title}</h1>
        {page.summary && <p className="mb-10 text-base leading-relaxed text-ink/60">{page.summary}</p>}
        <CmsContentBlocks blocks={page.blocks} />
      </div>
      <Footer />
      <FloatingWhatsApp />
    </main>
  )
}
