import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://rqjapqhhsdenshlhxskw.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxamFwcWhoc2RlbnNobGh4c2t3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAzNjA1MiwiZXhwIjoyMDg4NjEyMDUyfQ.3-iNeyyTFLfOclnIEiJPxvWzRh5XTyqJkJ9ATVdU9cM";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const ALL_AMENITIES = [
  "WiFi",
  "TV / Smart TV",
  "Không gian làm việc",
  "Bếp đầy đủ",
  "Tủ lạnh",
  "Lò vi sóng",
  "Điều hòa",
  "Máy giặt",
  "Nội thất đầy đủ",
  "Nội thất cao cấp",
  "Ban công",
  "Sân vườn",
  "Sân thượng",
  "Khu BBQ",
  "Thang máy",
  "Phòng gym",
  "Hồ bơi",
  "Phòng xông hơi",
  "Bãi đỗ xe",
  "Bảo vệ 24/7",
  "Camera an ninh",
  "Gần trường học",
  "Gần chợ / siêu thị",
  "Gần bệnh viện",
  "Gần công viên",
  "Gần metro / xe buýt",
  "View sông",
  "View biển",
  "View thành phố",
];

function pickRandom(arr, min, max) {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function main() {
  // Lấy tất cả property IDs
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id");

  if (error) {
    console.error("Lỗi lấy properties:", error.message);
    process.exit(1);
  }

  console.log(`Tìm thấy ${properties.length} BĐS. Đang cập nhật...`);

  let updated = 0;
  for (const { id } of properties) {
    const amenities = pickRandom(ALL_AMENITIES, 4, 12);
    const { error: updateErr } = await supabase
      .from("properties")
      .update({ amenities })
      .eq("id", id);

    if (updateErr) {
      console.error(`  [FAIL] id=${id}: ${updateErr.message}`);
    } else {
      updated++;
      console.log(`  [OK] id=${id} → ${amenities.length} tiện nghi`);
    }
  }

  console.log(`\nHoàn tất: ${updated}/${properties.length} BĐS đã cập nhật.`);
}

main();
