'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getGlobalFaqs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('global_faqs')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching global FAQs:', error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function addGlobalFaq(formData: FormData) {
  const supabase = await createClient()
  
  const question = formData.get('question')?.toString()
  const answer = formData.get('answer')?.toString()

  if (!question || !answer) {
    return { success: false, error: 'Question and answer are required' }
  }

  // Get current max display_order
  const { data: maxOrderData } = await supabase
    .from('global_faqs')
    .select('display_order')
    .order('display_order', { ascending: false })
    .limit(1)

  const newOrder = maxOrderData && maxOrderData.length > 0 ? maxOrderData[0].display_order + 1 : 0

  const { data, error } = await supabase
    .from('global_faqs')
    .insert([
      {
        question,
        answer,
        display_order: newOrder
      }
    ])
    .select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/settings/faqs')
  revalidatePath('/product/[slug]', 'page')
  return { success: true, data: data[0] }
}

export async function updateGlobalFaq(id: string, formData: FormData) {
  const supabase = await createClient()
  
  const question = formData.get('question')?.toString()
  const answer = formData.get('answer')?.toString()

  if (!question || !answer) {
    return { success: false, error: 'Question and answer are required' }
  }

  const { data, error } = await supabase
    .from('global_faqs')
    .update({ question, answer })
    .eq('id', id)
    .select()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/settings/faqs')
  revalidatePath('/product/[slug]', 'page')
  return { success: true, data: data[0] }
}

export async function deleteGlobalFaq(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('global_faqs')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/settings/faqs')
  revalidatePath('/product/[slug]', 'page')
  return { success: true }
}

export async function updateGlobalFaqOrders(orders: { id: string; display_order: number }[]) {
  const supabase = await createClient()

  // Supabase doesn't have a built-in bulk update for different values on same query cleanly via RPC without creating one.
  // We'll update them individually since it's a small array.
  for (const item of orders) {
    const { error } = await supabase
      .from('global_faqs')
      .update({ display_order: item.display_order })
      .eq('id', item.id)

    if (error) {
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/admin/settings/faqs')
  revalidatePath('/product/[slug]', 'page')
  return { success: true }
}
