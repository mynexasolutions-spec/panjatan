import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client for fetching public data.
 * Uses the anon key – RLS policies allow public reads.
 */
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type DbCategory = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  product_count: number;
  sort_order: number;
  is_active: boolean;
};

export type DbProduct = {
  id: string | number;
  slug: string;
  name: string;
  category_slug: string | null;
  description: string | null;
  short_description: string | null;
  price: number;
  old_price: number | null;
  image_url: string | null;
  badge: string | null;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  in_stock: boolean;
  sort_order: number;
  is_active: boolean;
  product_images?: { product_id?: string | number; image_url: string; sort_order?: number }[];
  product_variants?: {
    id: string;
    product_id?: string | number;
    variant_name: string;
    price: number;
    original_price: number | null;
    stock_quantity: number;
    is_active: boolean;
  }[];
};

export type DbHeroSlide = {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  text_mode: string;
  position: "left" | "right";
  is_active: boolean;
  display_order: number;
};

// ─── Fetchers ────────────────────────────────────────────────────────────────

export async function fetchCategories(): Promise<DbCategory[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[fetchCategories] Supabase error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchFeaturedProducts(): Promise<DbProduct[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[fetchFeaturedProducts] Supabase error:", error.message);
    return [];
  }
  const products = (data ?? []) as DbProduct[];
  if (products.length === 0) return [];

  const productIds = products.map((product) => product.id);
  const [imagesResult, variantsResult] = await Promise.all([
    supabase.from("product_images").select("product_id, image_url, sort_order").in("product_id", productIds),
    supabase
      .from("product_variants")
      .select("id, product_id, variant_name, price, original_price, stock_quantity, is_active")
      .in("product_id", productIds)
      .eq("is_active", true),
  ]);

  if (imagesResult.error) console.error("[fetchFeaturedProducts] product images error:", imagesResult.error.message);
  if (variantsResult.error) console.error("[fetchFeaturedProducts] product variants error:", variantsResult.error.message);

  return products.map((product) => ({
    ...product,
    product_images: (imagesResult.data || []).filter((image) => String(image.product_id) === String(product.id)),
    product_variants: (variantsResult.data || []).filter((variant) => String(variant.product_id) === String(product.id)),
  }));
}

export async function fetchHeroSlides(): Promise<DbHeroSlide[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("is_active", true)
    .order("position", { ascending: true })
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[fetchHeroSlides] Supabase error:", error.message);
    return [];
  }
  return data ?? [];
}

export type DbHomeBannerImage = {
  id: string;
  image_url: string;
  link_url: string | null;
  device_type: "desktop" | "mobile";
  is_active: boolean;
  display_order: number;
};

// Homepage hero banner (full-width, admin-managed, auto-sliding). Replaces
// the old two-column text+image hero — see components/HeroBanner.tsx.
export async function fetchHomeBannerImages(): Promise<{ enabled: boolean; images: DbHomeBannerImage[] }> {
  const supabase = getSupabase();
  const [settingsResult, imagesResult] = await Promise.all([
    supabase.from("settings").select("home_banner_enabled").eq("id", "global-settings-id").maybeSingle(),
    supabase
      .from("home_banner_images")
      .select("*")
      .eq("is_active", true)
      .order("device_type", { ascending: true })
      .order("display_order", { ascending: true }),
  ]);

  if (imagesResult.error) {
    console.error("[fetchHomeBannerImages] Supabase error:", imagesResult.error.message);
    return { enabled: false, images: [] };
  }

  return {
    enabled: !!settingsResult.data?.home_banner_enabled,
    images: imagesResult.data ?? [],
  };
}

export async function fetchAllProducts(): Promise<DbProduct[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[fetchAllProducts] Supabase error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchProductBySlug(slug: string): Promise<DbProduct | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("[fetchProductBySlug] Supabase error:", error.message);
    return null;
  }
  return data;
}

export async function fetchProductsByCategory(categorySlug: string): Promise<DbProduct[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_slug", categorySlug)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[fetchProductsByCategory] Supabase error:", error.message);
    return [];
  }
  return data ?? [];
}
