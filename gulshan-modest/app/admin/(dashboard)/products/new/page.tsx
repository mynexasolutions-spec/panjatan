import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import ProductForm from '../_components/ProductForm'

export const metadata: Metadata = {
  title: 'New Product',
}

export default async function NewProductPage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: otherProducts }] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('name'),
    supabase
      .from('products')
      .select('id, name, color_group_id, color_name')
      .order('name'),
  ])

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">New Product</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          Add a new product to your catalog
        </p>
      </div>
      <ProductForm categories={categories || []} otherProducts={otherProducts || []} />
    </div>
  )
}
