'use server'

import { requireAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getAnnouncement() {
  const supabase = await requireAdminClient()
  if (!supabase) return null
  
  // Try to get the latest announcement
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data
}

export async function saveAnnouncement(message: string, isActive: boolean) {
  const supabase = await requireAdminClient()
  if (!supabase) return { success: false, error: 'Unauthorized' }

  // Check if one exists
  const existing = await getAnnouncement()

  if (existing) {
    const { error } = await supabase
      .from('announcements')
      .update({ message, is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase
      .from('announcements')
      .insert([{ message, is_active: isActive }])

    if (error) return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout') // Revalidate everything since announcement is global
  revalidatePath('/admin/announcements')
  
  return { success: true }
}
