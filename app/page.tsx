import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureBar from "@/components/FeatureBar";
import Story from "@/components/Story";
import Categories from "@/components/Categories";
import Products from "@/components/Products";
import WhyUs from "@/components/WhyUs";
import GoodnessOfNature from "@/components/GoodnessOfNature";
import Testimonials from "@/components/Testimonials";
import Certifications from "@/components/Certifications";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { fetchCategories, fetchFeaturedProducts, fetchHeroSlides, DbCategory, DbProduct } from "@/lib/queries";
import { getHomepageSections, getStorefrontShell } from "@/lib/cms";

// Convert DB types to the shapes our components expect
function toComponentCategory(c: DbCategory) {
  return {
    id: c.slug,
    name: c.name,
    description: c.description ?? "",
    image: c.image_url ?? "/categories/default.png",
    count: `${c.product_count} products`,
  };
}

function toComponentProduct(p: DbProduct) {
  const variant = p.product_variants?.find((item) => item.is_active !== false && item.stock_quantity > 0)
    || p.product_variants?.find((item) => item.is_active !== false);
  const image = [...(p.product_images || [])].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))[0]?.image_url
    || p.image_url;
  return {
    id: p.id,
    product_id: p.id,
    slug: p.slug,
    variant_id: variant?.id,
    variant_name: variant?.variant_name,
    name: p.name,
    category: p.category_slug ?? "",
    description: p.short_description ?? p.description ?? "",
    price: Number(variant?.price ?? p.price),
    oldPrice: variant?.original_price ? Number(variant.original_price) : (p.old_price ? Number(p.old_price) : undefined),
    image: image ?? "/products/default.png",
    image_url: image ?? "/products/default.png",
    badge: p.badge ?? undefined,
    rating: Number(p.rating),
    reviewsCount: p.reviews_count,
  };
}

export default async function Home() {
  // Fetch live from Supabase in parallel
  const [dbCategories, dbProducts, homepageSections, shell, heroSlides] = await Promise.all([
    fetchCategories(),
    fetchFeaturedProducts(),
    getHomepageSections(),
    getStorefrontShell(),
    fetchHeroSlides(),
  ]);

  const categories = dbCategories.map(toComponentCategory);
  const featuredProducts = dbProducts.map(toComponentProduct).filter((product) => !!product.variant_id);
  const heroRightSlides = heroSlides.filter((slide) => slide.position === "right");
  return (
    <main className="min-h-screen bg-[#F8F6F0] overflow-x-hidden text-gray-900">
      <Header />
      {homepageSections.map((section) => {
        switch (section.section_key) {
          case 'hero':
            return <Hero key={section.id} section={section} heroSlides={heroRightSlides} />;
          case 'feature-bar':
            return <FeatureBar key={section.id} section={section} />;
          case 'story':
            return <Story key={section.id} section={section} />;
          case 'categories':
            return <Categories key={section.id} categories={categories} title={section.heading} />;
          case 'featured-products':
            return <Products key={section.id} products={featuredProducts} title={section.heading} subtitle={section.subheading || section.body} />;
          case 'why-us':
            return <WhyUs key={section.id} section={section} />;
          case 'goodness-of-nature':
            return <GoodnessOfNature key={section.id} section={section} settings={shell.settings} />;
          case 'testimonials':
            return <Testimonials key={section.id} section={section} />;
          case 'certifications':
            return <Certifications key={section.id} section={section} />;
          default:
            return null;
        }
      })}
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
