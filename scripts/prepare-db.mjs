// Selects the Prisma datasource provider based on DATABASE_URL so the same
// schema works locally (SQLite, zero-config) and in production (PostgreSQL on
// Vercel/Supabase/Neon). Runs during `postinstall` and the Vercel build.
import fs from "node:fs";
import path from "node:path";

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
const url = process.env.DATABASE_URL || "";

let provider = "sqlite";
if (/^postgres(ql)?:\/\//i.test(url)) provider = "postgresql";
else if (/^mysql:\/\//i.test(url)) provider = "mysql";

const schema = fs.readFileSync(schemaPath, "utf8");
// Only replaces the datasource provider (values: sqlite | postgresql | mysql),
// never the generator's "prisma-client-js".
const updated = schema.replace(/provider\s*=\s*"(sqlite|postgresql|mysql)"/, `provider = "${provider}"`);

if (updated !== schema) fs.writeFileSync(schemaPath, updated);
console.log(`[prepare-db] Prisma datasource provider = ${provider}`);
