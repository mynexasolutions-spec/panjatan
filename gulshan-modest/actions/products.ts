'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type ActionResult = {
  error?: string
  success?: boolean
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

// Resolves the color_group_id to store for a product, given the "group with"
// selection from the admin form (another product's ID to share colors with).
async function resolveColorGroupId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  groupWithProductId: string | null
): Promise<string | null> {
  if (!groupWithProductId) return null

  const { data: target } = await supabase
    .from('products')
    .select('id, color_group_id')
    .eq('id', groupWithProductId)
    .single()

  if (!target) return null

  if (target.color_group_id) return target.color_group_id

  // Target isn't in a group yet — create one and backfill it onto the target.
  const newGroupId = crypto.randomUUID()
  await supabase
    .from('products')
    .update({ color_group_id: newGroupId })
    .eq('id', target.id)

  return newGroupId
}

export async function createProduct(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const categoryId = formData.get('category_id') as string
  const shortDescription = formData.get('short_description') as string
  const description = formData.get('description') as string
  const fabric = formData.get('fabric') as string
  const stitching = formData.get('stitching') as string
  const seoTitle = formData.get('seo_title') as string
  const seoDescription = formData.get('seo_description') as string
  const badge = formData.get('badge') as string
  const colorName = formData.get('color_name') as string
  const isActive = formData.get('is_active') === 'on'
  const isFeatured = formData.get('is_featured') === 'on'

  if (!name) {
    return { error: 'Product name is required' }
  }

  const slug = slugify(name)
  const id = crypto.randomUUID()

  const { data: product, error } = await supabase.from('products').insert({
    id,
    name,
    slug,
    category_id: categoryId || null,
    short_description: shortDescription || null,
    description: description || null,
    fabric: fabric || null,
    stitching: stitching || null,
    seo_title: seoTitle || null,
    seo_description: seoDescription || null,
    badge: badge || null,
    color_name: colorName || null,
    color_hex: null,
    color_group_id: null,
    is_active: isActive,
    is_featured: isFeatured,
  }).select('id').single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'A product with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  redirect(`/admin/products/${product.id}/edit`)
}

export async function updateProduct(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const categoryId = formData.get('category_id') as string
  const shortDescription = formData.get('short_description') as string
  const description = formData.get('description') as string
  const fabric = formData.get('fabric') as string
  const stitching = formData.get('stitching') as string
  const seoTitle = formData.get('seo_title') as string
  const seoDescription = formData.get('seo_description') as string
  const badge = formData.get('badge') as string
  const colorName = formData.get('color_name') as string
  const isActive = formData.get('is_active') === 'on'
  const isFeatured = formData.get('is_featured') === 'on'

  if (!id || !name) {
    return { error: 'Product ID and name are required' }
  }

  const slug = slugify(name)

  const { error } = await supabase
    .from('products')
    .update({
      name,
      slug,
      category_id: categoryId || null,
      short_description: shortDescription || null,
      description: description || null,
      fabric: fabric || null,
      stitching: stitching || null,
      seo_title: seoTitle || null,
      seo_description: seoDescription || null,
      badge: badge || null,
      color_name: colorName || null,
      color_hex: null,
      color_group_id: null,
      is_active: isActive,
      is_featured: isFeatured,
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'A product with this name already exists' }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}/edit`)
  redirect(`/admin/products/${id}/edit`)
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/products')
  return { success: true }
}

// ─── Product Information CRUD ────────────────────────────

export async function saveProductInformation(
  productId: string,
  items: { id?: string; label: string; value: string; display_order: number }[]
): Promise<ActionResult> {
  const supabase = await createClient()

  // Delete existing items and re-insert
  const { error: deleteError } = await supabase
    .from('product_information')
    .delete()
    .eq('product_id', productId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  if (items.length > 0) {
    const rows = items.map((item, index) => ({
      product_id: productId,
      label: item.label,
      value: item.value,
      display_order: index,
    }))

    const { error: insertError } = await supabase
      .from('product_information')
      .insert(rows)

    if (insertError) {
      return { error: insertError.message }
    }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}

// ─── Product Image CRUD ────────────────────────────────────

export async function addProductImage(
  productId: string,
  imageUrl: string,
  colorName?: string | null
): Promise<ActionResult> {
  const supabase = await createClient()

  // Get max sort_order
  const { data: maxSort } = await supabase
    .from('product_images')
    .select('sort_order')
    .eq('product_id', productId)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single()

  const nextSort = maxSort ? maxSort.sort_order + 1 : 0

  const { error } = await supabase.from('product_images').insert({
    product_id: productId,
    image_url: imageUrl,
    sort_order: nextSort,
    color_name: colorName || null,
  })

  if (error) {
    return { error: error.message }
  }

  // If this is the only image, automatically set it as featured
  if (nextSort === 0) {
    await supabase
      .from('products')
      .update({ featured_image_url: imageUrl })
      .eq('id', productId)
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function deleteProductImage(imageId: string, productId: string): Promise<ActionResult> {
  const supabase = await createClient()

  // Check if this is the featured image before deleting
  const { data: image } = await supabase
    .from('product_images')
    .select('image_url')
    .eq('id', imageId)
    .single()

  const { error } = await supabase.from('product_images').delete().eq('id', imageId)

  if (error) {
    return { error: error.message }
  }

  // If we just deleted the featured image, clear it or set to next available
  if (image) {
    const { data: product } = await supabase
      .from('products')
      .select('featured_image_url')
      .eq('id', productId)
      .single()
      
    if (product?.featured_image_url === image.image_url) {
      // Find another image to feature
      const { data: nextImage } = await supabase
        .from('product_images')
        .select('image_url')
        .eq('product_id', productId)
        .order('sort_order', { ascending: true })
        .limit(1)
        .single()
        
      await supabase
        .from('products')
        .update({ featured_image_url: nextImage ? nextImage.image_url : null })
        .eq('id', productId)
    }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function setFeaturedImage(
  productId: string,
  imageUrl: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ featured_image_url: imageUrl })
    .eq('id', productId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function reorderProductImages(
  productId: string,
  orderedIds: string[]
): Promise<ActionResult> {
  const supabase = await createClient()

  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from('product_images')
      .update({ sort_order: i })
      .eq('id', orderedIds[i])
      .eq('product_id', productId)
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function updateProductImageColor(
  imageId: string,
  productId: string,
  colorName: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('product_images')
    .update({ color_name: colorName.trim() || null })
    .eq('id', imageId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

// ─── Product Variant CRUD ────────────────────────────────

export async function createProductVariant(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const productId = formData.get('product_id') as string
  const variantName = formData.get('variant_name') as string
  const price = formData.get('price') as string
  const originalPrice = formData.get('original_price') as string
  const stockQuantity = formData.get('stock_quantity') as string
  const isActive = formData.get('is_active') === 'on'

  if (!productId || !variantName || !price) {
    return { error: 'Product ID, Variant Name, and Price are required' }
  }

  const { error } = await supabase.from('product_variants').insert({
    product_id: productId,
    variant_name: variantName,
    price: parseFloat(price),
    original_price: originalPrice ? parseFloat(originalPrice) : null,
    stock_quantity: parseInt(stockQuantity || '0', 10),
    is_active: isActive,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function bulkCreateProductVariants(
  productId: string,
  variants: {
    variant_name: string
    price: number
    original_price: number | null
    stock_quantity: number
    is_active: boolean
  }[]
): Promise<ActionResult> {
  const supabase = await createClient()

  if (!productId || variants.length === 0) {
    return { error: 'Invalid data' }
  }

  const rows = variants.map(v => ({
    product_id: productId,
    ...v
  }))

  const { error } = await supabase.from('product_variants').insert(rows)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function updateProductVariant(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const productId = formData.get('product_id') as string
  const variantName = formData.get('variant_name') as string
  const price = formData.get('price') as string
  const originalPrice = formData.get('original_price') as string
  const stockQuantity = formData.get('stock_quantity') as string
  const isActive = formData.get('is_active') === 'on'

  if (!id || !variantName || !price) {
    return { error: 'Variant ID, Name, and Price are required' }
  }

  const { error } = await supabase
    .from('product_variants')
    .update({
      variant_name: variantName,
      price: parseFloat(price),
      original_price: originalPrice ? parseFloat(originalPrice) : null,
      stock_quantity: parseInt(stockQuantity || '0', 10),
      is_active: isActive,
    })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}

export async function deleteProductVariant(
  id: string,
  productId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.from('product_variants').delete().eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/admin/products/${productId}/edit`)
  return { success: true }
}


export async function saveProductFaqs(
  productId: string,
  items: { id?: string; question: string; answer: string; display_order: number }[]
): Promise<ActionResult> {
  const supabase = await createClient()

  // Delete existing FAQs and re-insert
  const { error: deleteError } = await supabase
    .from('product_faqs')
    .delete()
    .eq('product_id', productId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  if (items.length > 0) {
    const rows = items.map((item, index) => ({
      product_id: productId,
      question: item.question,
      answer: item.answer,
      display_order: index,
    }))

    const { error: insertError } = await supabase
      .from('product_faqs')
      .insert(rows)

    if (insertError) {
      return { error: insertError.message }
    }
  }

  revalidatePath(`/admin/products/${productId}`)
  return { success: true }
}
