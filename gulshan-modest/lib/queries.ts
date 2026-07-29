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
  id: number;
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
  return data ?? [];
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
