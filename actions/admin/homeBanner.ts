'use server'

import { requireAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getHomeBannerEnabled(): Promise<boolean> {
  const supabase = await requireAdminClient()
  if (!supabase) return false

  const { data } = await supabase
    .from('settings')
    .select('home_banner_enabled')
    .single()

  return !!data?.home_banner_enabled
}

export async function setHomeBannerEnabled(enabled: boolean) {
  const supabase = await requireAdminClient()
  if (!supabase) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('settings')
    .update({ home_banner_enabled: enabled })
    .eq('id', 'global-settings-id')

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/home-banner')
  return { success: true }
}

export async function getHomeBannerImages() {
  const supabase = await requireAdminClient()
  if (!supabase) return []

  const { data } = await supabase
    .from('home_banner_images')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true })

  return data || []
}

const MAX_IMAGES_PER_DEVICE = 6

export type HomeBannerDeviceType = 'desktop' | 'mobile'

export async function createHomeBannerImage(
  imageUrl: string,
  linkUrl: string,
  deviceType: HomeBannerDeviceType = 'desktop'
) {
  const supabase = await requireAdminClient()
  if (!supabase) return { success: false, error: 'Unauthorized' }

  const { count } = await supabase
    .from('home_banner_images')
    .select('*', { count: 'exact', head: true })
    .eq('device_type', deviceType)

  if (count && count >= MAX_IMAGES_PER_DEVICE) {
    return { success: false, error: `Maximum ${MAX_IMAGES_PER_DEVICE} ${deviceType} banner images allowed.` }
  }

  const { error } = await supabase
    .from('home_banner_images')
    .insert([{
      id: crypto.randomUUID(),
      image_url: imageUrl,
      link_url: linkUrl ? linkUrl.trim() : null,
      is_active: true,
      display_order: count || 0,
      device_type: deviceType,
    }])

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/home-banner')
  return { success: true }
}

export async function updateHomeBannerImageLink(id: string, linkUrl: string) {
  const supabase = await requireAdminClient()
  if (!supabase) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('home_banner_images')
    .update({ link_url: linkUrl ? linkUrl.trim() : null })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/home-banner')
  return { success: true }
}

export async function toggleHomeBannerImageStatus(id: string, isActive: boolean) {
  const supabase = await requireAdminClient()
  if (!supabase) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('home_banner_images')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/home-banner')
  return { success: true }
}

export async function deleteHomeBannerImage(id: string) {
  const supabase = await requireAdminClient()
  if (!supabase) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('home_banner_images')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/', 'layout')
  revalidatePath('/admin/home-banner')
  return { success: true }
}
