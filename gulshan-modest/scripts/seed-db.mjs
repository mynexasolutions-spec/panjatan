import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zzololnincjsrcekzteb.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6b2xvbG5pbmNqc3JjZWt6dGViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDkwNzMyMSwiZXhwIjoyMTAwNDgzMzIxfQ.U3nykODJbLKzB8E6H4iI_oStNMbLE5bfVrDZsem9fbA";

const db = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── SEED DATA ──────────────────────────────────────────────────────────────

const categories = [
  {
    slug: "digestive-care",
    name: "Digestive Care",
    description: "Natural herbal formulations for acidity, bloating, and indigestion",
    image_url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80",
    product_count: 12,
    sort_order: 1,
  },
  {
    slug: "joint-pain-relief",
    name: "Joint & Pain Relief",
    description: "Ayurvedic oils and supplements for joint flexibility and pain relief",
    image_url: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&q=80",
    product_count: 8,
    sort_order: 2,
  },
  {
    slug: "womens-health",
    name: "Women's Health",
    description: "Hormonal balance and overall vitality care for women",
    image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    product_count: 10,
    sort_order: 3,
  },
  {
    slug: "diabetes-care",
    name: "Diabetes Care",
    description: "Herbal support for maintaining healthy blood sugar levels",
    image_url: "https://images.unsplash.com/photo-1576671081837-49000212a370?w=400&q=80",
    product_count: 6,
    sort_order: 4,
  },
  {
    slug: "immunity-booster",
    name: "Immunity Booster",
    description: "Pure herbs to strengthen body defense and overall wellness",
    image_url: "https://images.unsplash.com/photo-1498842812179-c81beecf902c?w=400&q=80",
    product_count: 9,
    sort_order: 5,
  },
  {
    slug: "liver-care",
    name: "Liver Care",
    description: "Detoxifying Ayurvedic remedies for optimal liver health",
    image_url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&q=80",
    product_count: 5,
    sort_order: 6,
  },
  {
    slug: "hair-care",
    name: "Hair Care",
    description: "Nourishing herbal oils & powders for strong and healthy hair",
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80",
    product_count: 7,
    sort_order: 7,
  },
  {
    slug: "skin-care",
    name: "Skin Care",
    description: "Natural herbal glow formulations and skin purifying herbs",
    image_url: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80",
    product_count: 8,
    sort_order: 8,
  },
  {
    slug: "respiratory-care",
    name: "Respiratory Care",
    description: "Herbal syrups & powders for lung and cough relief",
    image_url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=80",
    product_count: 6,
    sort_order: 9,
  },
];

const products = [
  {
    slug: "pachan-plus-chatni",
    name: "Pachan Plus Chatni",
    category_slug: "digestive-care",
    description: "Complete Digestive Care – A powerful Ayurvedic chatni blend with natural herbs that aid in digestion, relieve acidity, bloating and constipation.",
    short_description: "Complete Digestive Care",
    price: 230,
    old_price: 280,
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
    badge: "Best Seller",
    rating: 5,
    reviews_count: 240,
    is_featured: true,
    in_stock: true,
    sort_order: 1,
  },
  {
    slug: "pachan-plus-powder",
    name: "Pachan Plus Powder",
    category_slug: "digestive-care",
    description: "Improves Digestion & Relief – Fine herbal powder formulation for complete digestive wellness, reduces gas and bloating naturally.",
    short_description: "Improves Digestion & Relief",
    price: 210,
    old_price: 250,
    image_url: "https://images.unsplash.com/photo-1587552132297-08c25ffb7085?w=500&q=80",
    badge: "Popular",
    rating: 5,
    reviews_count: 190,
    is_featured: true,
    in_stock: true,
    sort_order: 2,
  },
  {
    slug: "diabex-plus-capsule",
    name: "Diabex Plus Capsule",
    category_slug: "diabetes-care",
    description: "Helps Manage Blood Sugar – Formulated with Karela, Jamun, Methi and other potent herbs known to support healthy blood glucose levels.",
    short_description: "Helps Manage Blood Sugar",
    price: 290,
    old_price: 350,
    image_url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80",
    badge: "New",
    rating: 5,
    reviews_count: 210,
    is_featured: true,
    in_stock: true,
    sort_order: 3,
  },
  {
    slug: "livoplus-capsule",
    name: "Livoplus Capsule",
    category_slug: "liver-care",
    description: "Supports Liver Health – Contains Bhumi Amla, Kutki, and Kasni extracts for liver detoxification and regeneration.",
    short_description: "Supports Liver Health",
    price: 275,
    old_price: 320,
    image_url: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=500&q=80",
    badge: "Top Rated",
    rating: 5,
    reviews_count: 180,
    is_featured: true,
    in_stock: true,
    sort_order: 4,
  },
  {
    slug: "rog-mukt-syrup",
    name: "Rog Mukt Syrup",
    category_slug: "immunity-booster",
    description: "Immunity Booster – A powerful immunity-boosting syrup with Giloy, Tulsi, Ashwagandha and Amla for complete body defense.",
    short_description: "Immunity Booster",
    price: 200,
    old_price: 240,
    image_url: "https://images.unsplash.com/photo-1559181567-c3190bfa4f25?w=500&q=80",
    badge: "Popular",
    rating: 5,
    reviews_count: 160,
    is_featured: true,
    in_stock: true,
    sort_order: 5,
  },
  {
    slug: "ashwagandha-capsule",
    name: "Ashwagandha Capsule",
    category_slug: "immunity-booster",
    description: "Pure Ashwagandha extract capsules for stress relief, energy boost and overall vitality. Adaptogenic herb used in Ayurveda for centuries.",
    short_description: "Stress Relief & Vitality",
    price: 249,
    old_price: 299,
    image_url: "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=500&q=80",
    badge: null,
    rating: 4,
    reviews_count: 135,
    is_featured: false,
    in_stock: true,
    sort_order: 6,
  },
  {
    slug: "hair-growth-oil",
    name: "Herbal Hair Growth Oil",
    category_slug: "hair-care",
    description: "Bhringraj, Amla and Neem oil blend for deep nourishment, reducing hair fall and promoting thick, lustrous hair growth.",
    short_description: "Reduces Hair Fall",
    price: 185,
    old_price: 220,
    image_url: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500&q=80",
    badge: null,
    rating: 4,
    reviews_count: 98,
    is_featured: false,
    in_stock: true,
    sort_order: 7,
  },
  {
    slug: "neem-face-pack",
    name: "Neem Glow Face Pack",
    category_slug: "skin-care",
    description: "Pure Neem, Multani Mitti and Haldi based face pack for clear, glowing skin. Removes pimples, dark spots and excess oil.",
    short_description: "Clear & Glowing Skin",
    price: 150,
    old_price: 180,
    image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500&q=80",
    badge: null,
    rating: 4,
    reviews_count: 75,
    is_featured: false,
    in_stock: true,
    sort_order: 8,
  },
];

// ─── TABLE CREATION SQL ─────────────────────────────────────────────────────

const { default: pg } = await import("pg");
const { Client } = pg;

const client = new Client({
  connectionString:
    "postgresql://postgres.zzololnincjsrcekzteb:Panjatan%400302@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log("✅  Connected to PostgreSQL\n");

// Create categories table
await client.query(`
  CREATE TABLE IF NOT EXISTS public.categories (
    id          SERIAL PRIMARY KEY,
    slug        TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    description TEXT,
    image_url   TEXT,
    product_count INT DEFAULT 0,
    sort_order  INT DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  );
`);
console.log("✅  categories table ready");

// Create products table
await client.query(`
  CREATE TABLE IF NOT EXISTS public.products (
    id                SERIAL PRIMARY KEY,
    slug              TEXT UNIQUE NOT NULL,
    name              TEXT NOT NULL,
    category_slug     TEXT REFERENCES public.categories(slug) ON DELETE SET NULL,
    description       TEXT,
    short_description TEXT,
    price             NUMERIC(10,2) NOT NULL,
    old_price         NUMERIC(10,2),
    image_url         TEXT,
    badge             TEXT,
    rating            NUMERIC(2,1) DEFAULT 5.0,
    reviews_count     INT DEFAULT 0,
    is_featured       BOOLEAN DEFAULT FALSE,
    in_stock          BOOLEAN DEFAULT TRUE,
    sort_order        INT DEFAULT 0,
    is_active         BOOLEAN DEFAULT TRUE,
    created_at        TIMESTAMPTZ DEFAULT NOW(),
    updated_at        TIMESTAMPTZ DEFAULT NOW()
  );
`);
console.log("✅  products table ready");

// Enable RLS but allow public reads
await client.query(`ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;`).catch(() => {});
await client.query(`ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;`).catch(() => {});

await client.query(`
  DROP POLICY IF EXISTS "public can read categories" ON public.categories;
  CREATE POLICY "public can read categories"
    ON public.categories FOR SELECT USING (true);
`).catch(() => {});

await client.query(`
  DROP POLICY IF EXISTS "public can read products" ON public.products;
  CREATE POLICY "public can read products"
    ON public.products FOR SELECT USING (true);
`).catch(() => {});

// Seed categories
console.log("\n📦  Seeding categories...");
for (const cat of categories) {
  await client.query(
    `INSERT INTO public.categories (slug, name, description, image_url, product_count, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (slug) DO UPDATE SET
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       image_url = EXCLUDED.image_url,
       product_count = EXCLUDED.product_count,
       sort_order = EXCLUDED.sort_order,
       updated_at = NOW()`,
    [cat.slug, cat.name, cat.description, cat.image_url, cat.product_count, cat.sort_order]
  );
  console.log(`   ✓ ${cat.name}`);
}

// Seed products
console.log("\n🛍️  Seeding products...");
for (const prod of products) {
  await client.query(
    `INSERT INTO public.products
       (slug, name, category_slug, description, short_description, price, old_price, image_url, badge, rating, reviews_count, is_featured, in_stock, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     ON CONFLICT (slug) DO UPDATE SET
       name = EXCLUDED.name,
       category_slug = EXCLUDED.category_slug,
       description = EXCLUDED.description,
       short_description = EXCLUDED.short_description,
       price = EXCLUDED.price,
       old_price = EXCLUDED.old_price,
       image_url = EXCLUDED.image_url,
       badge = EXCLUDED.badge,
       rating = EXCLUDED.rating,
       reviews_count = EXCLUDED.reviews_count,
       is_featured = EXCLUDED.is_featured,
       in_stock = EXCLUDED.in_stock,
       sort_order = EXCLUDED.sort_order,
       updated_at = NOW()`,
    [
      prod.slug, prod.name, prod.category_slug, prod.description,
      prod.short_description, prod.price, prod.old_price, prod.image_url,
      prod.badge, prod.rating, prod.reviews_count, prod.is_featured,
      prod.in_stock, prod.sort_order,
    ]
  );
  console.log(`   ✓ ${prod.name}`);
}

await client.end();

console.log(`
╔══════════════════════════════════════════════╗
║        ✅  Database Seeded Successfully      ║
╠══════════════════════════════════════════════╣
║  Categories : ${String(categories.length).padEnd(29)} ║
║  Products   : ${String(products.length).padEnd(29)} ║
╚══════════════════════════════════════════════╝
`);
