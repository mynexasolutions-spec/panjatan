import fs from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
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

const sourceDir = process.env.PANJATAN_SOURCE_DIR;
const required = [
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "NEXT_PUBLIC_CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

if (!sourceDir || !fs.existsSync(sourceDir)) {
  throw new Error("PANJATAN_SOURCE_DIR must point to the folder containing the product photographs.");
}
for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} is required.`);
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const prefix = "WhatsApp Image 2026-07-23 at ";
const approvedPackShots = [
  ["panjkalp-syrup", "Panjkalp Syrup", `${prefix}4.20.09 PM (1).jpeg`],
  ["pachan-plus-chatni", "Pachan Plus Chatni", `${prefix}4.20.09 PM (2).jpeg`],
  ["joint-relief-syrup", "Joint Relief Syrup", `${prefix}4.24.44 PM.jpeg`],
  ["joint-relief-powder", "Joint Relief Powder", `${prefix}4.20.17 PM (1).jpeg`],
  ["kalabansa-raakh", "Kalabansa Raakh", `${prefix}4.20.11 PM (1).jpeg`],
  ["dilnora-syrup", "Dilnora Syrup", `${prefix}4.20.11 PM.jpeg`],
  ["panjmadhu-tea", "Panjmadhu Tea", `${prefix}4.20.12 PM (2).jpeg`],
  ["aafiron-tonic", "Aafiron Tonic", `${prefix}4.20.12 PM.jpeg`],
  ["body-cover-m", "Body Cover-M", `${prefix}4.20.13 PM (1).jpeg`],
  ["body-cover-f", "Body Cover-F", `${prefix}4.20.14 PM.jpeg`],
  ["rajkesari-prash", "Rajkesari Prash", `${prefix}4.20.13 PM.jpeg`],
  ["cysto-tan-syrup", "Cysto-Tan Syrup", `${prefix}4.20.14 PM (1).jpeg`],
  ["kufa-tan", "Kufa-Tan", `${prefix}4.20.15 PM (1).jpeg`],
  ["kimiya-gold", "Kimiya Gold", `${prefix}4.24.45 PM.jpeg`],
  ["royal-feel", "Royal Feel", `${prefix}4.20.16 PM.jpeg`],
  ["diabetes-powder", "Diabetes Powder", `${prefix}4.20.16 PM (1).jpeg`],
  ["lilac-syrup", "Lilac Syrup", `${prefix}4.20.17 PM.jpeg`],
  ["viryraj-kheer", "Viryraj Kheer", `${prefix}4.24.44 PM (1).jpeg`],
];

async function uploadMainImage(source, publicId, displayName) {
  const result = await cloudinary.uploader.upload(source, {
    folder: "panjatan/products",
    public_id: `${publicId}-main`,
    overwrite: true,
    invalidate: true,
    resource_type: "image",
    transformation: [
      {
        width: 1200,
        height: 1200,
        crop: "pad",
        background: "#faf8f1",
        quality: "auto:good",
      },
    ],
    tags: ["panjatan", "product", "main-image"],
    context: { caption: displayName, source: "approved-product-pack-shot" },
  });
  return result.secure_url;
}

const uploaded = new Map();
for (const [slug, displayName, filename] of approvedPackShots) {
  const source = path.join(sourceDir, filename);
  if (!fs.existsSync(source)) throw new Error(`Missing approved image: ${filename}`);
  const secureUrl = await uploadMainImage(source, slug, displayName);
  uploaded.set(slug, secureUrl);
  console.log(`Uploaded approved pack shot: ${displayName}`);
}

const { data: products, error: productsError } = await supabase
  .from("products")
  .select("id, name, slug, image_url, featured_image_url")
  .order("id");
if (productsError) throw productsError;

const localOverrides = new Map([
  ["pachan-plus-powder", path.resolve("public/products/pachan-plus-powder.webp")],
  ["rog-mukt-syrup", path.resolve("public/products/rog-mukt-syrup.webp")],
]);

for (const product of products ?? []) {
  let secureUrl = uploaded.get(product.slug);
  if (!secureUrl) {
    const source =
      localOverrides.get(product.slug) ??
      product.featured_image_url ??
      product.image_url;
    if (!source) {
      console.warn(`Skipped ${product.name}: no image source`);
      continue;
    }
    secureUrl = await uploadMainImage(source, product.slug, product.name);
  }

  const { error: updateProductError } = await supabase
    .from("products")
    .update({ image_url: secureUrl, featured_image_url: secureUrl })
    .eq("id", product.id);
  if (updateProductError) throw updateProductError;

  const { data: imageRows, error: imageQueryError } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", product.id)
    .order("sort_order")
    .limit(1);
  if (imageQueryError) throw imageQueryError;

  if (imageRows?.[0]) {
    const { error } = await supabase
      .from("product_images")
      .update({ image_url: secureUrl, sort_order: 0 })
      .eq("id", imageRows[0].id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("product_images")
      .insert({ product_id: product.id, image_url: secureUrl, sort_order: 0 });
    if (error) throw error;
  }
  console.log(`Synced storefront product: ${product.name}`);
}

console.log(`Cloudinary sync complete: ${uploaded.size} approved pack shots and ${products?.length ?? 0} storefront products.`);
