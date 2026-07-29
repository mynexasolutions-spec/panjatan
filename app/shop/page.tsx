import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ShopGrid from './_components/ShopGrid'
import { createClient } from "@/lib/supabase/server";
import Image from 'next/image'
import { getStorefrontShell } from '@/lib/cms'

export const metadata = {
  title: 'Shop Collection | Panjatan Ayurveda',
  description: 'Browse Panjatan Ayurveda medicines and natural herbal wellness products.',
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; featured?: string }
}) {
  const supabase = await createClient();
  const { settings } = await getStorefrontShell();

  const resolvedSearchParams = await searchParams;
  const searchQuery = resolvedSearchParams.search || '';
  const featuredOnly = resolvedSearchParams.featured === 'true';

  let productsQuery = supabase
    .from("products")
    .select(`
      id, name, slug, category_id, is_active, badge, rating, price, oldPrice, featured_image_url, color_group_id, color_name, created_at,
      product_images ( image_url ),
      product_variants ( id, variant_name, price, original_price, stock_quantity, is_active )
    `)
    .eq("is_active", true)
    .order('created_at', { ascending: false });

  if (searchQuery) {
    productsQuery = productsQuery.ilike('name', `%${searchQuery}%`);
  }

  if (featuredOnly) {
    productsQuery = productsQuery.eq('is_featured', true);
  }

  const { data: productsData } = await productsQuery;

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true);

  const colorGroupCounts = (productsData || []).reduce((acc: any, p: any) => {
    if (p.color_group_id) acc[p.color_group_id] = (acc[p.color_group_id] || 0) + 1;
    return acc;
  }, {});

  // Helper to parse colors list
  const parseProductColors = (colorNameField: string | null) => {
    if (!colorNameField) return []
    try {
      if (colorNameField.startsWith('[')) {
        const parsed = JSON.parse(colorNameField) as { name: string; hex: string }[]
        return parsed.map(c => ({ name: c.name.trim(), hex: c.hex || '#E6DAC4' })).filter(c => c.name)
      }
    } catch (e) {}
    return colorNameField.split(',').map(c => ({ name: c.trim(), hex: '#E6DAC4' })).filter(c => c.name)
  }

  const products = (productsData || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category_id: p.category_id,
    image_url: p.product_images?.[0]?.image_url || p.featured_image_url || "/image.png",
    price: p.product_variants?.find((variant: any) => variant.is_active !== false && variant.stock_quantity > 0)?.price || p.product_variants?.[0]?.price || p.price || 0,
    oldPrice: p.product_variants?.find((variant: any) => variant.is_active !== false && variant.stock_quantity > 0)?.original_price || p.product_variants?.[0]?.original_price || p.oldPrice || undefined,
    variant_id: p.product_variants?.find((variant: any) => variant.is_active !== false && variant.stock_quantity > 0)?.id || p.product_variants?.[0]?.id,
    variant_name: p.product_variants?.find((variant: any) => variant.is_active !== false && variant.stock_quantity > 0)?.variant_name || p.product_variants?.[0]?.variant_name,
    badge: p.badge,
    rating: p.rating || 5,
    colors: parseProductColors(p.color_name),
    colorCount: p.color_group_id ? colorGroupCounts[p.color_group_id] || 1 : 1,
  }));

  const categories = categoriesData || [];
  const selectedCategory = resolvedSearchParams.category || ''

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-[72px] md:pt-[84px]">
        
        {/* Shop Hero Banner */}
        <section className="relative w-full h-[250px] md:h-[340px] bg-emerald-deep flex items-center justify-center overflow-hidden border-b border-cream-line">
          <Image
            src="/shop-banner.webp"
            alt="Panjatan Ayurveda product collection"
            fill
            className="object-cover opacity-80 mix-blend-luminosity"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink/90 via-emerald-deep/60 to-ink/90" />
          
          <div className="relative z-10 text-center px-5">
            <div className="eyebrow justify-center inline-flex items-center gap-2 mb-3 text-gold-light">
              <span className="h-px w-6 bg-gold" />
              Ayurvedic Wellness
              <span className="h-px w-6 bg-gold" />
            </div>
            <h1 className="font-display font-bold text-3xl md:text-5xl text-cream tracking-wide">
              {settings.shop_banner_title}
            </h1>
            <p className="mt-4 text-cream/70 font-body text-sm md:text-base max-w-lg mx-auto">
              {settings.shop_banner_description}
            </p>
          </div>
        </section>

        <div className="max-w-wrap mx-auto px-5 md:px-8 py-10 md:py-16">

          <ShopGrid 
            initialProducts={products} 
            categories={categories} 
            selectedCategory={selectedCategory} 
          />

        </div>
      </main>
      <Footer />
    </>
  )
}
