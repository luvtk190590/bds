/**
 * Migration runner
 * Chạy: node scripts/migrate.mjs
 *
 * Yêu cầu: DATABASE_URL trong .env.local
 * Lấy từ: Supabase Dashboard → Project Settings → Database → Connection string → URI
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = path.join(__dirname, "../.env.local");
const envContent = fs.readFileSync(envPath, "utf8");
for (const line of envContent.split("\n")) {
  const [key, ...val] = line.split("=");
  if (key && !key.startsWith("#") && val.length) {
    process.env[key.trim()] = val.join("=").trim();
  }
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ Thiếu DATABASE_URL trong .env.local");
  console.error("   Lấy từ: Supabase Dashboard → Settings → Database → URI");
  process.exit(1);
}

const migrationsDir = path.join(__dirname, "../supabase/migrations");

// Lấy danh sách file migration, bỏ qua file RUN_ALL_PENDING
const files = fs
  .readdirSync(migrationsDir)
  .filter(f => f.endsWith(".sql") && !f.startsWith("RUN_ALL_PENDING"))
  .sort();

const { Client } = pg;
const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  await client.connect();
  console.log("✓ Kết nối database thành công\n");

  // Tạo bảng tracking migrations nếu chưa có
  await client.query(`
    CREATE TABLE IF NOT EXISTS public._migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT UNIQUE NOT NULL,
      run_at TIMESTAMPTZ DEFAULT now()
    );
  `);

  // Lấy danh sách đã chạy
  const { rows: ran } = await client.query("SELECT filename FROM public._migrations");
  const ranSet = new Set(ran.map(r => r.filename));

  let newCount = 0;
  for (const file of files) {
    if (ranSet.has(file)) {
      console.log(`  ⏭  ${file} (đã chạy)`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    console.log(`  ▶  Đang chạy ${file}...`);
    try {
      await client.query(sql);
      await client.query("INSERT INTO public._migrations (filename) VALUES ($1)", [file]);
      console.log(`  ✓  ${file} — OK`);
      newCount++;
    } catch (err) {
      console.error(`  ✗  ${file} — LỖI: ${err.message}`);
      // Tiếp tục chạy các migration còn lại
    }
  }

  await client.end();

  console.log(`\n${newCount === 0 ? "✓ Không có migration mới cần chạy." : `✓ Đã chạy ${newCount} migration mới.`}`);
}

run().catch(err => {
  console.error("Lỗi:", err.message);
  process.exit(1);
});
