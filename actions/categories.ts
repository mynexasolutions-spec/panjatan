'use server'

import { requireAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionResult = {
  error?: string
  success?: boolean
}

async function authorizedClient() {
  const supabase = await requireAdminClient()
  return supabase ? { supabase } : { error: { error: 'Unauthorized' } as ActionResult }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function createCategory(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authorizedClient()
  if ('error' in auth) return auth.error
  const { supabase } = auth

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const imageUrl = formData.get('image_url') as string
  const isActive = formData.get('is_active') === 'on'

  if (!name) {
    return { error: 'Category name is required' }
  }

  const slug = slugify(name)

  const { error } = await supabase.from('categories').insert({
    name,
    slug,
    description: description || null,
    image_url: imageUrl || null,
    is_active: isActive,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'A category with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function updateCategory(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const auth = await authorizedClient()
  if ('error' in auth) return auth.error
  const { supabase } = auth

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const imageUrl = formData.get('image_url') as string
  const isActive = formData.get('is_active') === 'on'

  if (!id || !name) {
    return { error: 'Category ID and name are required' }
  }

  const slug = slugify(name)

  const { error } = await supabase
    .from('categories')
    .update({
      name,
      slug,
      description: description || null,
      image_url: imageUrl || null,
      is_active: isActive,
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'A category with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  redirect('/admin/categories')
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const auth = await authorizedClient()
  if ('error' in auth) return auth.error
  const { supabase } = auth

  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function toggleCategoryStatus(
  id: string,
  isActive: boolean
): Promise<ActionResult> {
  const auth = await authorizedClient()
  if ('error' in auth) return auth.error
  const { supabase } = auth

  const { error } = await supabase
    .from('categories')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}
