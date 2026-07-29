'use server'

import { revalidatePath } from 'next/cache'
import { requireAdminClient } from '@/lib/supabase/admin'
import type { ContentBlock } from '@/lib/cms'

export type CmsActionResult = { success: boolean; error?: string }

async function authorizedClient() {
  return requireAdminClient()
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) || '').trim()
}

function refreshStorefront() {
  revalidatePath('/', 'layout')
  revalidatePath('/about')
  revalidatePath('/contact')
  revalidatePath('/shop')
  revalidatePath('/policies/privacy')
  revalidatePath('/policies/refund')
  revalidatePath('/policies/shipping')
  revalidatePath('/policies/terms')
}

export async function updateSiteSettings(formData: FormData): Promise<CmsActionResult> {
  const client = await authorizedClient()
  if (!client) return { success: false, error: 'Unauthorized' }

  const payload = {
    id: 'global',
    site_name: text(formData, 'site_name'),
    tagline: text(formData, 'tagline'),
    support_email: text(formData, 'support_email'),
    support_phone: text(formData, 'support_phone'),
    whatsapp_number: text(formData, 'whatsapp_number').replace(/\D/g, ''),
    whatsapp_message: text(formData, 'whatsapp_message'),
    business_hours: text(formData, 'business_hours'),
    address: text(formData, 'address'),
    announcement_text: text(formData, 'announcement_text'),
    shop_banner_title: text(formData, 'shop_banner_title'),
    shop_banner_description: text(formData, 'shop_banner_description'),
    facebook_url: text(formData, 'facebook_url') || null,
    instagram_url: text(formData, 'instagram_url') || null,
    youtube_url: text(formData, 'youtube_url') || null,
    default_seo_title: text(formData, 'default_seo_title'),
    default_seo_description: text(formData, 'default_seo_description'),
    updated_at: new Date().toISOString(),
  }

  if (!payload.site_name || !payload.support_email) {
    return { success: false, error: 'Site name and support email are required.' }
  }

  const { error } = await client.from('site_settings').upsert(payload)
  if (error) return { success: false, error: error.message }
  refreshStorefront()
  revalidatePath('/admin/content/general')
  return { success: true }
}

export async function upsertContentPage(formData: FormData): Promise<CmsActionResult> {
  const client = await authorizedClient()
  if (!client) return { success: false, error: 'Unauthorized' }

  let blocks: ContentBlock[]
  try {
    blocks = JSON.parse(text(formData, 'blocks'))
    if (!Array.isArray(blocks)) throw new Error('Content must be an array.')
  } catch {
    return { success: false, error: 'Content blocks must be valid JSON array.' }
  }

  const slug = text(formData, 'slug')
  const payload = {
    slug,
    title: text(formData, 'title'),
    eyebrow: text(formData, 'eyebrow'),
    summary: text(formData, 'summary'),
    blocks,
    seo_title: text(formData, 'seo_title'),
    seo_description: text(formData, 'seo_description'),
    is_published: formData.get('is_published') === 'on',
    updated_at: new Date().toISOString(),
  }
  if (!slug || !payload.title) return { success: false, error: 'Slug and title are required.' }

  const { error } = await client.from('content_pages').upsert(payload, { onConflict: 'slug' })
  if (error) return { success: false, error: error.message }
  revalidatePath(`/admin/content/pages`)
  revalidatePath(slug === 'about' || slug === 'contact' ? `/${slug}` : `/policies/${slug}`)
  return { success: true }
}

export async function updateHomepageSection(formData: FormData): Promise<CmsActionResult> {
  const client = await authorizedClient()
  if (!client) return { success: false, error: 'Unauthorized' }

  const sectionKey = text(formData, 'section_key')
  const payload = {
    section_key: sectionKey,
    heading: text(formData, 'heading'),
    subheading: text(formData, 'subheading'),
    body: text(formData, 'body'),
    image_url: text(formData, 'image_url') || null,
    link_label: text(formData, 'link_label') || null,
    link_url: text(formData, 'link_url') || null,
    is_visible: formData.get('is_visible') === 'on',
    display_order: Math.max(0, Number(formData.get('display_order') || 0)),
    updated_at: new Date().toISOString(),
  }
  if (!sectionKey) return { success: false, error: 'Section key is required.' }

  const { error } = await client.from('homepage_sections').upsert(payload, { onConflict: 'section_key' })
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/admin/content/home')
  return { success: true }
}

export async function updateHomepageItem(formData: FormData): Promise<CmsActionResult> {
  const client = await authorizedClient()
  if (!client) return { success: false, error: 'Unauthorized' }
  const id = text(formData, 'id')
  if (!id) return { success: false, error: 'Item ID is required.' }
  let metadata: Record<string, unknown> = {}
  try {
    metadata = JSON.parse(text(formData, 'metadata') || '{}')
  } catch {
    return { success: false, error: 'Item metadata must be valid JSON.' }
  }
  const { error } = await client.from('homepage_section_items').update({
    title: text(formData, 'title'),
    subtitle: text(formData, 'subtitle'),
    body: text(formData, 'body'),
    image_url: text(formData, 'image_url') || null,
    link_url: text(formData, 'link_url') || null,
    metadata,
    is_visible: formData.get('is_visible') === 'on',
    display_order: Math.max(0, Number(formData.get('display_order') || 0)),
    updated_at: new Date().toISOString(),
  }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/')
  revalidatePath('/admin/content/home')
  return { success: true }
}

export async function createNavigationLink(formData: FormData): Promise<CmsActionResult> {
  const client = await authorizedClient()
  if (!client) return { success: false, error: 'Unauthorized' }

  const location = text(formData, 'location')
  if (!['header', 'footer', 'legal'].includes(location)) {
    return { success: false, error: 'Invalid navigation location.' }
  }
  const { error } = await client.from('navigation_links').insert({
    location,
    label: text(formData, 'label'),
    href: text(formData, 'href'),
    is_external: formData.get('is_external') === 'on',
    is_visible: true,
    display_order: Math.max(0, Number(formData.get('display_order') || 0)),
  })
  if (error) return { success: false, error: error.message }
  refreshStorefront()
  revalidatePath('/admin/content/navigation')
  return { success: true }
}

export async function deleteNavigationLink(formData: FormData): Promise<CmsActionResult> {
  const client = await authorizedClient()
  if (!client) return { success: false, error: 'Unauthorized' }
  const { error } = await client.from('navigation_links').delete().eq('id', text(formData, 'id'))
  if (error) return { success: false, error: error.message }
  refreshStorefront()
  revalidatePath('/admin/content/navigation')
  return { success: true }
}

export async function updateSubscriberStatus(formData: FormData): Promise<CmsActionResult> {
  const client = await authorizedClient()
  if (!client) return { success: false, error: 'Unauthorized' }
  const status = text(formData, 'status')
  if (!['active', 'unsubscribed'].includes(status)) return { success: false, error: 'Invalid status.' }
  const { error } = await client
    .from('newsletter_subscribers')
    .update({
      status,
      unsubscribed_at: status === 'unsubscribed' ? new Date().toISOString() : null,
    })
    .eq('id', text(formData, 'id'))
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin/content/newsletter')
  return { success: true }
}

// React form actions intentionally discard the structured result. The result-returning
// variants above remain useful for programmatic clients and future enhanced forms.
export async function updateSiteSettingsForm(formData: FormData): Promise<void> {
  await updateSiteSettings(formData)
}
export async function upsertContentPageForm(formData: FormData): Promise<void> {
  await upsertContentPage(formData)
}
export async function updateHomepageSectionForm(formData: FormData): Promise<void> {
  await updateHomepageSection(formData)
}
export async function updateHomepageItemForm(formData: FormData): Promise<void> {
  await updateHomepageItem(formData)
}
export async function createNavigationLinkForm(formData: FormData): Promise<void> {
  await createNavigationLink(formData)
}
export async function deleteNavigationLinkForm(formData: FormData): Promise<void> {
  await deleteNavigationLink(formData)
}
export async function updateSubscriberStatusForm(formData: FormData): Promise<void> {
  await updateSubscriberStatus(formData)
}
