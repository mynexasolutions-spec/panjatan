import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductViewSection from './_components/ProductViewSection'
import ProductReviews from './_components/ProductReviews'
import Products from '@/components/Products'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { createClient } from "@/lib/supabase/server"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { id } = await params;

  // Try fetching by ID first, then fallback to slug if the URL uses a slug
  let { data: productData } = await supabase
    .from("products")
    .select(`
      id, name, slug, category_id, is_active, badge, rating, short_description, description, fabric, stitching, featured_image_url, color_group_id, color_name, color_hex,
      product_images ( image_url, color_name ),
      product_variants ( id, variant_name, price, original_price, stock_quantity ),
      product_information ( label, value, display_order ),
      product_faqs ( question, answer, display_order )
    `)
    .eq("id", id)
    .single();

  if (!productData) {
    const { data: slugProduct } = await supabase
      .from("products")
      .select(`
        id, name, slug, category_id, is_active, badge, rating, short_description, description, fabric, stitching, featured_image_url, color_group_id, color_name, color_hex,
        product_images ( image_url, color_name ),
        product_variants ( id, variant_name, price, original_price, stock_quantity ),
        product_information ( label, value, display_order ),
        product_faqs ( question, answer, display_order )
      `)
      .eq("slug", id)
      .single();

    productData = slugProduct;
  }

  if (!productData || !productData.is_active) notFound();

  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("id", productData.category_id)
    .single();

  const categoryName = category?.name || productData.category_id;

  // Compile image array
  let images: { image_url: string; color_name?: string | null }[] = []
  if (productData.product_images && productData.product_images.length > 0) {
    images = productData.product_images
  } else if (productData.featured_image_url) {
    images = [{ image_url: productData.featured_image_url }]
  }

  // Compile information
  let information = productData.product_information || []
  if (productData.fabric) {
    information.push({ label: 'Fabric Details', value: productData.fabric, display_order: -2 })
  }
  if (productData.stitching) {
    information.push({ label: 'Stitching Details', value: productData.stitching, display_order: -1 })
  }
  information.sort((a: any, b: any) => a.display_order - b.display_order)

  let faqs = productData.product_faqs || []
  // Add a default FAQ if none exist just to populate the section as requested
  if (faqs.length === 0) {
    faqs.push({
      question: "How long does shipping take?",
      answer: "We typically process and ship orders within 2-3 business days. Delivery times vary based on your location.",
      display_order: 1
    })
    faqs.push({
      question: "What is your return policy?",
      answer: "We offer a 7-day return policy for unused items in their original packaging.",
      display_order: 2
    })
  }
  faqs.sort((a: any, b: any) => a.display_order - b.display_order)

  // Filter out inactive or out-of-stock variants if we want to be strict,
  // but let's just pass them down and disable out-of-stock ones
  const variants = productData.product_variants || []

  // Fetch other colors of this same design (color group)
  let colorOptions: any[] = []
  if (productData.color_group_id) {
    const { data: colorGroupProducts } = await supabase
      .from("products")
      .select(`
        id, name, color_name, color_hex, featured_image_url,
        product_images ( image_url )
      `)
      .eq("color_group_id", productData.color_group_id)
      .eq("is_active", true)
      .order("created_at", { ascending: true })

    colorOptions = (colorGroupProducts || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      color_name: p.color_name,
      color_hex: p.color_hex,
      image_url: p.product_images?.[0]?.image_url || p.featured_image_url || "/image.png",
    }))
  }

  // Fetch similar products
  const { data: similarProductsData } = await supabase
    .from("products")
    .select(`
      id, name, slug, category_id, is_active, badge, rating, featured_image_url,
      product_images ( image_url ),
      product_variants ( price, original_price )
    `)
    .eq("is_active", true)
    .eq("category_id", productData.category_id)
    .neq("id", productData.id)
    .limit(4);

  const similarProducts = similarProductsData?.map((p: any) => ({
    id: p.id,
    name: p.name,
    category_id: p.category_id,
    image_url: p.featured_image_url || (p.product_images?.[0]?.image_url) || "/image.png",
    badge: p.badge,
    price: p.product_variants?.[0]?.price || 0,
    oldPrice: p.product_variants?.[0]?.original_price || undefined
  })) || [];

  // Fetch Reviews
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select(`
      id, rating, comment, created_at,
      profiles:user_id ( full_name )
    `)
    .eq('product_id', productData.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false });

  const reviews = reviewsData || [];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cream pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="max-w-wrap mx-auto px-5 md:px-8">

          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-ink/50 font-medium mb-8">
            <Link href="/" className="hover:text-emerald transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/shop" className="hover:text-emerald transition-colors">Shop</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/shop?category=${productData.category_id}`} className="hover:text-emerald transition-colors capitalize">
              {categoryName}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-ink font-semibold truncate max-w-[200px]">{productData.name}</span>
          </div>

          <ProductViewSection
            product={{
              id: productData.id,
              name: productData.name,
              badge: productData.badge,
              rating: productData.rating,
              short_description: productData.short_description,
            }}
            images={images}
            variants={variants}
            information={information}
            categoryName={categoryName}
          />

          <div className="space-y-6 pt-6 border-t border-cream-line/50">
                {productData.description && (
                  <div>
                    <h3 className="font-display font-semibold text-xl text-ink mb-4">Product Details</h3>
                    <div className="font-body text-ink/75 text-base leading-relaxed whitespace-pre-wrap">
                      {productData.description}
                    </div>
                  </div>
                )}

                {faqs.length > 0 && (
                  <div className="pt-4">
                    <h3 className="font-display font-semibold text-xl text-ink mb-4">Common Questions</h3>
                    <div className="space-y-3">
                      {faqs.map((faq: any, idx: number) => (
                        <details key={idx} className="group bg-white rounded-2xl border border-cream-line shadow-sm overflow-hidden open:bg-cream-deep/30 transition-colors">
                          <summary className="font-display font-semibold text-ink text-[15px] px-5 py-4 cursor-pointer flex justify-between items-center outline-none list-none hover:text-emerald transition-colors">
                            {faq.question}
                            <span className="text-ink/50 transition-transform group-open:rotate-180 group-open:text-emerald">
                              <svg fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18"><polyline points="6 9 12 15 18 9"/></svg>
                            </span>
                          </summary>
                          <div className="px-5 pb-5 text-ink/70 text-sm leading-relaxed border-t border-cream-line/50 mx-5 pt-3">
                            {faq.answer}
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-cream-line">
            <Products
              products={similarProducts}
              categories={[{ id: productData.category_id, name: categoryName }]}
              title="You might also like"
              subtitle="Explore similar styles from this collection."
            />
          </div>
        )}

        </div>

        {/* Product Reviews */}
        <section className="mt-20 pt-10 border-t border-cream-line bg-cream">
          <div className="max-w-wrap mx-auto px-5 md:px-8">
            <div className="text-center max-w-xl mx-auto mb-10">
              <div className="eyebrow justify-center inline-flex items-center gap-2">
                <span className="h-px w-6 bg-gold" />
                Customer Voices
                <span className="h-px w-6 bg-gold" />
              </div>
              <h2 className="section-heading mt-4">Ratings &amp; Reviews</h2>
            </div>
            <ProductReviews productId={productData.id} initialReviews={reviews} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
