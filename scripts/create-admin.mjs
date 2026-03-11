import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://rqjapqhhsdenshlhxskw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxamFwcWhoc2RlbnNobGh4c2t3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzAzNjA1MiwiZXhwIjoyMDg4NjEyMDUyfQ.3-iNeyyTFLfOclnIEiJPxvWzRh5XTyqJkJ9ATVdU9cM"
);

const EMAIL = "admin@homelengo.vn";
const PASSWORD = "123123123";

async function main() {
  // 1. Tạo auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Admin", role: "admin" },
  });

  if (authErr) {
    // Nếu đã tồn tại thì lấy user ID
    if (authErr.message?.includes("already")) {
      console.log("User đã tồn tại, đang cập nhật role...");
      const { data: users } = await supabase.auth.admin.listUsers();
      const existing = users?.users?.find(u => u.email === EMAIL);
      if (existing) {
        await updateProfile(existing.id);
      }
    } else {
      console.error("Lỗi tạo auth user:", authErr.message);
    }
    return;
  }

  console.log("✓ Auth user tạo thành công:", authData.user.id);
  await updateProfile(authData.user.id);
}

async function updateProfile(authUserId) {
  // Kiểm tra profile đã có chưa
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("profiles")
      .update({ role: "admin", verification_status: "verified", full_name: "Admin" })
      .eq("auth_user_id", authUserId);
    if (error) console.error("Lỗi update profile:", error.message);
    else console.log("✓ Profile đã được cập nhật thành admin");
  } else {
    const { error } = await supabase.from("profiles").insert({
      auth_user_id: authUserId,
      email: EMAIL,
      full_name: "Admin",
      role: "admin",
      verification_status: "verified",
    });
    if (error) console.error("Lỗi tạo profile:", error.message);
    else console.log("✓ Profile admin đã được tạo");
  }

  console.log("\n=== TÀI KHOẢN ADMIN ===");
  console.log("Email:    ", EMAIL);
  console.log("Password: ", PASSWORD);
  console.log("URL:      http://localhost:3002/admin");
  console.log("======================");
}

main();
