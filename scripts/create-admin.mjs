import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || "Panjatan Admin";
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

if (
  !SUPABASE_URL ||
  !SERVICE_ROLE_KEY ||
  !DATABASE_URL ||
  !ADMIN_EMAIL ||
  !ADMIN_PASSWORD ||
  !ADMIN_USER_ID
) {
  throw new Error(
    "Supabase, database, and admin environment variables are required."
  );
}

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("🔧  Creating profiles table via RPC (raw SQL)...");

  // Step 1: Create profiles table if it doesn't exist using Supabase's rpc
  const { error: rpcError } = await adminClient.rpc("exec_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        role TEXT NOT NULL DEFAULT 'customer',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
      CREATE POLICY "Service role can manage all profiles"
        ON public.profiles FOR ALL
        USING (true)
        WITH CHECK (true);

      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES (
        '${ADMIN_USER_ID}',
        '${ADMIN_EMAIL}',
        '${ADMIN_NAME}',
        'admin'
      )
      ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = EXCLUDED.full_name, updated_at = NOW();
    `,
  });

  if (rpcError) {
    console.log("⚠️  exec_sql RPC not available, trying pg direct...");
    await createTableViaPg();
  } else {
    console.log("✅  Table created & admin inserted via RPC.");
    printCredentials();
  }
}

async function createTableViaPg() {
  // Use pg package to run SQL directly via the connection string
  const { default: pg } = await import("pg");
  const { Client } = pg;

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("🔗  Connecting directly to PostgreSQL...");
    await client.connect();
    console.log("✅  Connected.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT,
        role TEXT NOT NULL DEFAULT 'customer',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅  profiles table ready.");

    await client.query(`ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;`).catch(() => {});

    await client.query(`
      DROP POLICY IF EXISTS "Admins can manage all" ON public.profiles;
      CREATE POLICY "Admins can manage all"
        ON public.profiles FOR ALL USING (true) WITH CHECK (true);
    `).catch(() => {});

    await client.query(`
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES ($1, $2, $3, 'admin')
      ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = EXCLUDED.full_name, updated_at = NOW();
    `, [ADMIN_USER_ID, ADMIN_EMAIL, ADMIN_NAME]);

    console.log("✅  Admin profile inserted/updated.");
    printCredentials();
  } catch (err) {
    console.error("❌  Direct PG error:", err.message);
  } finally {
    await client.end();
  }
}

function printCredentials() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║         ✅ Admin Credentials Ready       ║");
  console.log("╠══════════════════════════════════════════╣");
  console.log(`║  Email   : ${ADMIN_EMAIL.padEnd(30)} ║`);
  console.log(`║  Password: ${ADMIN_PASSWORD.padEnd(30)} ║`);
  console.log(`║  Role    : admin                          ║`);
  console.log("╚══════════════════════════════════════════╝");
  console.log("\n🌐  Login at: http://localhost:3000/admin/login");
}

main().catch((err) => {
  console.error("\n❌  Fatal error:", err.message);
  process.exit(1);
});
