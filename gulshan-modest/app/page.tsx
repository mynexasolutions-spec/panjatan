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
import { fetchCategories, fetchFeaturedProducts, DbCategory, DbProduct } from "@/lib/queries";

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
  return {
    id: p.slug,
    name: p.name,
    category: p.category_slug ?? "",
    description: p.short_description ?? p.description ?? "",
    price: Number(p.price),
    oldPrice: p.old_price ? Number(p.old_price) : undefined,
    image: p.image_url ?? "/products/default.png",
    badge: p.badge ?? undefined,
    rating: Number(p.rating),
    reviewsCount: p.reviews_count,
  };
}

export default async function Home() {
  // Fetch live from Supabase in parallel
  const [dbCategories, dbProducts] = await Promise.all([
    fetchCategories(),
    fetchFeaturedProducts(),
  ]);

  const categories = dbCategories.map(toComponentCategory);
  const featuredProducts = dbProducts.map(toComponentProduct);

  return (
    <main className="min-h-screen bg-[#F8F6F0] overflow-x-hidden text-gray-900">
      <Header />
      <Hero />
      <FeatureBar />
      <Story />
      <Categories categories={categories} />
      <Products products={featuredProducts} />
      <WhyUs />
      <GoodnessOfNature />
      <Testimonials />
      <Certifications />
      <Footer />
      <FloatingWhatsApp />
    </main>
  );
}
