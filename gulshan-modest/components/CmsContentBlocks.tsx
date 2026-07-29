import type { ContentBlock } from '@/lib/cms'

export default function CmsContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="prose prose-emerald prose-sm md:prose-base max-w-none space-y-8 text-ink/80">
      {blocks.map((block, index) => (
        <section key={`${block.heading || 'section'}-${index}`} className="space-y-3">
          {block.heading && <h2 className="font-display text-xl font-semibold text-ink md:text-2xl">{block.heading}</h2>}
          <p className="whitespace-pre-line leading-relaxed">{block.body}</p>
          {!!block.items?.length && (
            <ul className="list-disc space-y-2 pl-5">
              {block.items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
