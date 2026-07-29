import { readFile } from "node:fs/promises";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL;
const migrationPath = process.argv[2];
const shouldApply = process.argv.includes("--apply");

if (!databaseUrl || !migrationPath) {
  throw new Error("Usage: DATABASE_URL=... node scripts/validate-migration.mjs <migration.sql>");
}

const sql = await readFile(migrationPath, "utf8");
const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query("begin");
  await client.query(sql);
  await client.query(shouldApply ? "commit" : "rollback");
  console.log(
    shouldApply
      ? `Applied ${migrationPath}.`
      : `Validated ${migrationPath} in a rolled-back transaction.`
  );
} catch (error) {
  await client.query("rollback").catch(() => {});
  throw error;
} finally {
  await client.end();
}
