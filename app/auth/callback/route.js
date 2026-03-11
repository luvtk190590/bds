import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  const supabase = createClient();

  // Đổi code lấy session
  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
  if (sessionError) {
    return NextResponse.redirect(`${origin}/?error=auth_failed`);
  }

  // Lấy user hiện tại
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/?error=no_user`);
  }

  // Lấy profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, verification_status")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return NextResponse.redirect(`${origin}/?error=no_profile`);
  }

  // Đã xác nhận email rồi thì xử lý theo role
  if (profile.role === "buyer") {
    // Buyer: tự động approve
    await supabase
      .from("profiles")
      .update({ verification_status: "verified" })
      .eq("id", profile.id);

    // Tạo verification_request đã approved
    await supabase.from("verification_requests").upsert({
      user_id: profile.id,
      role: "buyer",
      status: "approved",
      email_confirmed: true,
      admin_note: "Tự động xác minh qua email",
    }, { onConflict: "user_id" });

    return NextResponse.redirect(`${origin}/?verified=1`);
  }

  // Seller / Broker: pending, cần admin duyệt
  if (profile.verification_status === "unverified") {
    await supabase
      .from("profiles")
      .update({ verification_status: "pending" })
      .eq("id", profile.id);

    await supabase.from("verification_requests").upsert({
      user_id: profile.id,
      role: profile.role,
      status: "pending",
      email_confirmed: true,
    }, { onConflict: "user_id" });
  }

  return NextResponse.redirect(`${origin}/verify?role=${profile.role}`);
}
