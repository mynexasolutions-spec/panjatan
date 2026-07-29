'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdminAuthenticated } from '@/lib/admin-session'

export async function getHeroSlides() {
  const supabase = await createClient()
  
  const { data } = await supabase
    .from('hero_slides')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  return data || []
}

export async function createHeroSlide(imageUrl: string, position: 'left' | 'right' = 'right') {
  const supabase = await createClient()
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  // Check limit per position
  const { count } = await supabase
    .from('hero_slides')
    .select('*', { count: 'exact', head: true })
    .eq('position', position)

  if (count && count >= 5) {
    return { success: false, error: `Maximum 5 slides allowed for the ${position} side.` }
  }

  const { error } = await supabase
    .from('hero_slides')
    .insert([{
      id: crypto.randomUUID(),
      image_url: imageUrl,
      is_active: true,
      display_order: count || 0,
      position: position
    }])

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}

export async function deleteHeroSlide(id: string) {
  const supabase = await createClient()
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('hero_slides')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}

export async function toggleHeroSlideStatus(id: string, isActive: boolean) {
  const supabase = await createClient()
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('hero_slides')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/hero-slides')
  return { success: true }
}
