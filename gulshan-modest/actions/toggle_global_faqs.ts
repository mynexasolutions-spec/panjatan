'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleUseGlobalFaqs(productId: string, useGlobalFaqs: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .update({ use_global_faqs: useGlobalFaqs })
    .eq('id', productId)

  if (error) {
    return { success: false, error: error.message }
  }

  // Use the RPC function or just revalidate path
  revalidatePath('/admin/products/[id]/edit', 'page')
  revalidatePath('/product/[slug]', 'page')
  
  return { success: true }
}
