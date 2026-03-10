/**
 * Script áp dụng migration SQL trực tiếp lên Supabase
 * Dùng pg (postgres) qua connection string
 * Chạy: node scripts/apply-migration.mjs <file.sql>
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

const SUPABASE_URL = "https://rqjapqhhsdenshlhxskw.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxamFwcWhoc2RlbnNobGh4c2t3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAzNjA1MiwiZXhwIjoyMDg4NjEyMDUyfQ.3-iNeyyTFLfOclnIEiJPxvWzRh5XTyqJkJ9ATVdU9cM";

const file = process.argv[2];
if (!file) { console.error("Usage: node apply-migration.mjs <file.sql>"); process.exit(1); }

const sql = readFileSync(file, "utf8");

// Supabase Edge Function hoặc RPC exec_sql không khả dụng
// → Dùng pg-gateway qua fetch đến Supabase REST /pg
// Thực tế: dùng supabase.rpc nếu có hàm, hoặc thông qua direct pg connection

// Cách đơn giản: tách SQL thành các statements và gọi qua rpc nếu có
// Nhưng cách tốt nhất là dùng pg package với connection string
// Connection string: postgres://postgres.[ref]:[password]@aws-0-...pooler.supabase.com:6543/postgres

// Fallback: hỏi user
console.log("=".repeat(60));
console.log("Không thể kết nối DB trực tiếp từ script này.");
console.log("Hãy chạy SQL sau trong Supabase SQL Editor:");
console.log("https://supabase.com/dashboard/project/rqjapqhhsdenshlhxskw/sql");
console.log("=".repeat(60));
console.log(sql);
