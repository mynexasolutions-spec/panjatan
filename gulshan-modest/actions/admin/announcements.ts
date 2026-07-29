'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { isAdminAuthenticated } from '@/lib/admin-session'

export async function getAnnouncement() {
  const supabase = await createClient()
  
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
  const supabase = await createClient()
  
  const isAdmin = await isAdminAuthenticated()
  if (!isAdmin) return { success: false, error: 'Unauthorized' }

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
