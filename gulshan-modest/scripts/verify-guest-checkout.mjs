import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required.");

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query("begin");
  const variantResult = await client.query(`
    select variants.id, variants.stock_quantity
    from public.product_variants variants
    join public.products products on products.id = variants.product_id
    where variants.is_active and products.is_active and variants.stock_quantity > 1
    order by variants.id
    limit 1
  `);
  if (!variantResult.rows[0]) throw new Error("No in-stock variant is available for checkout verification.");

  const variant = variantResult.rows[0];
  const key = `verification-${crypto.randomUUID()}`;
  const args = [
    "Checkout Verification",
    "9999999999",
    JSON.stringify({
      full_name: "Checkout Verification",
      phone: "9999999999",
      address_line_1: "1 Transaction Test Road",
      city: "Jaipur",
      state: "Rajasthan",
      postal_code: "302001",
      country: "India",
    }),
    JSON.stringify([{ variantId: variant.id, quantity: 1 }]),
    "online",
    key,
    null,
  ];

  const sql = "select public.place_guest_order($1,$2,$3::jsonb,$4::jsonb,$5,$6,$7) as order_data";
  const first = (await client.query(sql, args)).rows[0].order_data;
  const retry = (await client.query(sql, args)).rows[0].order_data;
  const stock = (await client.query(
    "select stock_quantity from public.product_variants where id = $1",
    [variant.id]
  )).rows[0].stock_quantity;

  if (first.id !== retry.id) throw new Error("Idempotent retry created a second order.");
  if (first.paymentStatus !== "simulated" || first.paymentMethod !== "online") {
    throw new Error("Simulated-online payment status is incorrect.");
  }
  if (stock !== variant.stock_quantity - 1) {
    throw new Error("Inventory was not decremented exactly once.");
  }

  await client.query("rollback");
  console.log("Guest checkout transaction, idempotency, simulated payment, and stock checks passed (rolled back).");
} catch (error) {
  await client.query("rollback").catch(() => {});
  throw error;
} finally {
  await client.end();
}
