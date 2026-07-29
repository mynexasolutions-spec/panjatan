import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(path.resolve(".env"));

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} is required.`);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const imageUrl = (slug) =>
  `https://res.cloudinary.com/${cloudName}/image/upload/panjatan/products/${slug}-main.jpg`;

const additionalCategories = [
  {
    slug: "heart-care",
    name: "Heart Care",
    description: "Ayurvedic formulations created to complement everyday heart-conscious wellness.",
    sort_order: 10,
  },
  {
    slug: "weight-management",
    name: "Weight Management",
    description: "Herbal products designed to complement balanced nutrition and an active lifestyle.",
    sort_order: 11,
  },
  {
    slug: "mens-wellness",
    name: "Men's Wellness",
    description: "Traditional Ayurvedic formulations for men's vitality and general wellness.",
    sort_order: 12,
  },
  {
    slug: "general-wellness",
    name: "General Wellness",
    description: "Daily Ayurvedic tonics, teas and formulations for routine wellbeing.",
    sort_order: 13,
  },
];

const products = [
  {
    slug: "panjkalp-syrup",
    name: "Panjkalp Syrup",
    category: "liver-care",
    price: 299,
    oldPrice: 349,
    packSize: "300 ml",
    form: "Syrup",
    short: "Ayurvedic liver and digestive wellness syrup",
    description:
      "A traditional Ayurvedic proprietary syrup with Biranjasif, Makoy and eleven herbs, presented for liver, gall-bladder and digestive wellness. Use according to the product label or a qualified practitioner's advice.",
  },
  {
    slug: "joint-relief-syrup",
    name: "Joint Relief Syrup",
    category: "joint-pain-relief",
    price: 159,
    oldPrice: 190,
    packSize: "200 ml",
    form: "Syrup",
    short: "Daily Ayurvedic support for joint mobility",
    description:
      "An Ayurvedic syrup formulated to complement everyday joint mobility and comfort. Follow the directions printed on the pack.",
  },
  {
    slug: "joint-relief-powder",
    name: "Joint Relief Powder",
    category: "joint-pain-relief",
    price: 249,
    oldPrice: 299,
    packSize: "100 g",
    form: "Powder",
    short: "Herbal powder for joint comfort and mobility",
    description:
      "A traditional herbal powder designed to support a joint-conscious wellness routine. Use according to the product label or practitioner guidance.",
  },
  {
    slug: "kalabansa-raakh",
    name: "Kalabansa Raakh",
    category: "respiratory-care",
    price: 149,
    oldPrice: 179,
    packSize: "10 g",
    form: "Ayurvedic preparation",
    short: "Traditional support for respiratory wellness",
    description:
      "A compact Ayurvedic preparation presented for respiratory and throat wellness. Read the label carefully and use only as directed.",
  },
  {
    slug: "dilnora-syrup",
    name: "Dilnora Sugar Free Syrup",
    category: "heart-care",
    price: 299,
    oldPrice: 349,
    packSize: "300 ml",
    form: "Syrup",
    short: "Sugar-free herbal heart-wellness syrup",
    description:
      "A sugar-free herbal syrup featuring lemon, ginger, garlic, Arjun bark, cinnamon, flaxseed and apple vinegar for a heart-conscious wellness routine.",
  },
  {
    slug: "panjmadhu-tea",
    name: "Panjmadhu Tea",
    category: "general-wellness",
    price: 199,
    oldPrice: 249,
    packSize: "60 g",
    form: "Herbal tea",
    short: "Refreshing Ayurvedic herbal tea blend",
    description:
      "A fragrant Ayurvedic herbal tea blend prepared for everyday refreshment and a balanced wellness routine.",
  },
  {
    slug: "aafiron-tonic",
    name: "Aafiron Tonic",
    category: "general-wellness",
    price: 199,
    oldPrice: 249,
    packSize: "200 ml",
    form: "Tonic",
    short: "Ayurvedic iron and nutritional tonic",
    description:
      "An Ayurvedic tonic with iron and nutritional ingredients, designed to complement daily nutrition and general wellbeing.",
  },
  {
    slug: "body-cover-m",
    name: "Body Cover-M",
    category: "weight-management",
    price: 399,
    oldPrice: 499,
    packSize: "100 g",
    form: "Powder",
    short: "Men's herbal weight-management blend",
    description:
      "A herbal powder for men intended to complement balanced nutrition, regular activity and a sustainable weight-management routine.",
  },
  {
    slug: "body-cover-f",
    name: "Body Cover-F",
    category: "weight-management",
    price: 399,
    oldPrice: 499,
    packSize: "100 g",
    form: "Powder",
    short: "Women's herbal weight-management blend",
    description:
      "A herbal powder for women intended to complement balanced nutrition, regular activity and a sustainable weight-management routine.",
  },
  {
    slug: "rajkesari-prash",
    name: "Rajkesari Prash",
    category: "mens-wellness",
    price: 499,
    oldPrice: 599,
    packSize: "150 g",
    form: "Prash",
    short: "Traditional Ayurvedic vitality prash",
    description:
      "A traditional Ayurvedic prash prepared as a daily wellness supplement for adult vitality, stamina and general wellbeing.",
  },
  {
    slug: "cysto-tan-syrup",
    name: "Cysto-Tan Syrup",
    category: "womens-health",
    price: 299,
    oldPrice: 349,
    packSize: "200 ml",
    form: "Syrup",
    short: "Ayurvedic women's wellness syrup",
    description:
      "An Ayurvedic proprietary syrup developed for women's everyday wellness. Use according to the product label or practitioner advice.",
  },
  {
    slug: "kufa-tan",
    name: "Kufa-Tan Cough Syrup",
    category: "respiratory-care",
    price: 249,
    oldPrice: 299,
    packSize: "100 ml",
    form: "Syrup",
    short: "Tulsi and Banafsha respiratory-wellness syrup",
    description:
      "An Ayurvedic cough syrup with Tulsi and Banafsha, formulated for throat comfort and respiratory wellness. Follow the label directions.",
  },
  {
    slug: "kimiya-gold",
    name: "Kimiya Gold Prash",
    category: "mens-wellness",
    price: 699,
    oldPrice: 899,
    packSize: "Jar",
    form: "Prash",
    short: "Premium Ayurvedic men's vitality prash",
    description:
      "A premium traditional Ayurvedic prash for adult men's vitality and general wellness. Use only as directed on the product label.",
  },
  {
    slug: "royal-feel",
    name: "Royal Feel Capsules",
    category: "mens-wellness",
    price: 599,
    oldPrice: 749,
    packSize: "12 capsules",
    form: "Capsules",
    short: "Ayurvedic men's wellness capsules",
    description:
      "Ayurvedic proprietary capsules prepared for adult men's vitality and general wellness. Follow the directions printed on the pack.",
  },
  {
    slug: "diabetes-powder",
    name: "Panjmadhu Amrit Powder",
    category: "diabetes-care",
    price: 299,
    oldPrice: 349,
    packSize: "200 g",
    form: "Powder",
    short: "Ayurvedic sugar-conscious wellness powder",
    description:
      "A Shilajit-enriched Ayurvedic powder designed to complement a sugar-conscious wellness routine. It is not a replacement for prescribed medical care.",
  },
  {
    slug: "lilac-syrup",
    name: "Lilac Syrup",
    category: "womens-health",
    price: 249,
    oldPrice: 299,
    packSize: "200 ml",
    form: "Syrup",
    short: "Ayurvedic herbal women's wellness syrup",
    description:
      "An Ayurvedic herbal preparation for women's routine wellbeing. Use according to the product label or a qualified practitioner's advice.",
  },
  {
    slug: "viryraj-kheer",
    name: "Viryraj Kheer",
    category: "mens-wellness",
    price: 599,
    oldPrice: 749,
    packSize: "Jar",
    form: "Ayurvedic food supplement",
    short: "Herbal kheer blend for adult vitality",
    description:
      "A traditional Ayurvedic kheer blend featuring saffron, Ashwagandha, Shatavari, Safed Musli and Salab Panja for adult vitality and general wellness.",
  },
];

for (const category of additionalCategories) {
  const { error } = await supabase.from("categories").upsert(
    {
      ...category,
      image_url: null,
      product_count: 0,
      count: "0",
      is_active: true,
    },
    { onConflict: "slug" },
  );
  if (error) throw error;
}

const { data: categories, error: categoriesError } = await supabase
  .from("categories")
  .select("id, slug");
if (categoriesError) throw categoriesError;
const categoryIds = new Map((categories ?? []).map((category) => [category.slug, category.id]));

for (const [index, product] of products.entries()) {
  const categoryId = categoryIds.get(product.category);
  if (!categoryId) throw new Error(`Missing category: ${product.category}`);
  const featured = ["joint-relief-syrup", "dilnora-syrup", "panjmadhu-tea", "rajkesari-prash", "viryraj-kheer"].includes(product.slug);
  const mainImage = imageUrl(product.slug);
  const now = new Date().toISOString();

  const { data: saved, error: productError } = await supabase
    .from("products")
    .upsert(
      {
        slug: product.slug,
        name: product.name,
        category_slug: product.category,
        category_id: categoryId,
        description: product.description,
        short_description: product.short,
        price: product.price,
        old_price: product.oldPrice,
        oldPrice: product.oldPrice,
        image_url: mainImage,
        featured_image_url: mainImage,
        badge: "New",
        rating: 0,
        reviews_count: 0,
        average_rating: 0,
        review_count: 0,
        is_featured: featured,
        in_stock: true,
        is_active: true,
        sort_order: 20 + index,
        seo_title: `${product.name} | Panjatan Ayurveda`,
        seo_description: product.short,
        updated_at: now,
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (productError) throw productError;

  const { data: existingVariant, error: variantQueryError } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", saved.id)
    .eq("variant_name", "Default")
    .limit(1)
    .maybeSingle();
  if (variantQueryError) throw variantQueryError;

  const variantValues = {
    product_id: saved.id,
    variant_name: "Default",
    price: product.price,
    original_price: product.oldPrice,
    stock_quantity: 50,
    is_active: true,
    updated_at: now,
  };
  const variantResult = existingVariant
    ? await supabase.from("product_variants").update(variantValues).eq("id", existingVariant.id)
    : await supabase.from("product_variants").insert(variantValues);
  if (variantResult.error) throw variantResult.error;

  const { data: existingImage, error: imageQueryError } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", saved.id)
    .order("sort_order")
    .limit(1)
    .maybeSingle();
  if (imageQueryError) throw imageQueryError;
  const imageResult = existingImage
    ? await supabase.from("product_images").update({ image_url: mainImage, sort_order: 0 }).eq("id", existingImage.id)
    : await supabase.from("product_images").insert({ product_id: saved.id, image_url: mainImage, sort_order: 0 });
  if (imageResult.error) throw imageResult.error;

  const { error: deleteInfoError } = await supabase
    .from("product_information")
    .delete()
    .eq("product_id", saved.id);
  if (deleteInfoError) throw deleteInfoError;
  const { error: infoError } = await supabase.from("product_information").insert([
    { product_id: saved.id, label: "Pack size", value: product.packSize, display_order: 0 },
    { product_id: saved.id, label: "Form", value: product.form, display_order: 1 },
    { product_id: saved.id, label: "Brand", value: "Panjatan Ayurveda", display_order: 2 },
  ]);
  if (infoError) throw infoError;

  console.log(`Created or updated: ${product.name} — ₹${product.price}`);
}

const { data: allCategories, error: countCategoryError } = await supabase
  .from("categories")
  .select("id, slug");
if (countCategoryError) throw countCategoryError;
for (const category of allCategories ?? []) {
  const { count, error: countError } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", category.id)
    .eq("is_active", true);
  if (countError) throw countError;
  const { error: updateCountError } = await supabase
    .from("categories")
    .update({ product_count: count ?? 0, count: String(count ?? 0) })
    .eq("id", category.id);
  if (updateCountError) throw updateCountError;
}

console.log(`Catalog seeding complete: ${products.length} approved products are active.`);
