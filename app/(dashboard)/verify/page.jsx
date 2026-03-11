"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import Header2 from "@/components/headers/Header2";
import Link from "next/link";
import toast from "react-hot-toast";
import { Suspense } from "react";

function VerifyContent() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");

  const [docFile, setDocFile] = useState(null);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [verReq, setVerReq] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    if (!loading && !profile) router.replace("/");
  }, [loading, profile]);

  useEffect(() => {
    if (profile?.id) {
      supabase
        .from("verification_requests")
        .select("*")
        .eq("user_id", profile.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setVerReq(data);
          if (data?.status === "approved") setSubmitted(true);
        });
    }
  }, [profile?.id]);

  if (loading || !profile) return null;

  const role = profile.role || roleParam;
  const vstatus = profile.verification_status || "pending";

  const roleLabels = { seller: "Người bán", broker: "Môi giới" };
  const docLabel = role === "broker" ? "Chứng chỉ hành nghề môi giới" : "Giấy tờ pháp lý bất động sản";
  const docHint = role === "broker"
    ? "Upload chứng chỉ môi giới BDS được cấp bởi cơ quan có thẩm quyền"
    : "Upload giấy tờ sở hữu hoặc ủy quyền BDS bạn muốn đăng bán/cho thuê";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!docFile) { toast.error("Vui lòng chọn file tài liệu"); return; }
    setUploading(true);

    // Upload file lên Supabase Storage
    const ext = docFile.name.split(".").pop();
    const path = `verification/${profile.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("documents")
      .upload(path, docFile, { upsert: true });

    if (upErr) {
      // Nếu bucket chưa tồn tại hoặc lỗi, vẫn cho submit với note
      toast.error("Không upload được file. Vui lòng liên hệ admin.");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("documents").getPublicUrl(path);

    const docField = role === "broker" ? "certificate_url" : "property_doc_url";

    // Upsert verification_request
    const { error: vrErr } = await supabase.from("verification_requests").upsert({
      user_id: profile.id,
      role,
      status: "pending",
      email_confirmed: true,
      [docField]: publicUrl,
      note: note.trim() || null,
    }, { onConflict: "user_id" });

    if (vrErr) {
      toast.error("Lỗi gửi yêu cầu: " + vrErr.message);
    } else {
      toast.success("Đã gửi yêu cầu xác minh! Admin sẽ xem xét trong 24-48 giờ.");
      setSubmitted(true);
    }
    setUploading(false);
  }

  // Đã approved → redirect dashboard
  if (vstatus === "verified" || verReq?.status === "approved") {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32 }}>
        <div style={{ fontSize: 48 }}>✓</div>
        <h4 style={{ color: "#166534", fontWeight: 700 }}>Tài khoản đã được xác minh!</h4>
        <p style={{ color: "#64748b" }}>Bạn có thể bắt đầu sử dụng đầy đủ tính năng.</p>
        <Link href="/dashboard" className="tf-btn primary">Vào Dashboard</Link>
      </div>
    );
  }

  // Đã gửi / đang chờ
  if (submitted || vstatus === "pending" && verReq) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 32, textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fef9c3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>⏳</div>
        <h4 style={{ fontWeight: 700, color: "#0f172a" }}>Đang chờ admin xét duyệt</h4>
        <p style={{ color: "#64748b", maxWidth: 420 }}>
          Yêu cầu xác minh <strong>{roleLabels[role] || role}</strong> của bạn đã được gửi.
          Admin sẽ xem xét và phản hồi trong vòng <strong>24–48 giờ</strong>.
        </p>
        {verReq?.admin_note && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 20px", borderRadius: 10, maxWidth: 420 }}>
            <strong>Phản hồi từ admin:</strong> {verReq.admin_note}
          </div>
        )}
        <Link href="/" style={{ color: "#3b82f6", textDecoration: "none" }}>← Về trang chủ</Link>
      </div>
    );
  }

  // Form upload tài liệu
  return (
    <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 20px" }}>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <div style={{ background: "#f8fafc", padding: "20px 24px", borderBottom: "1px solid #e2e8f0" }}>
          <h4 style={{ margin: 0, fontWeight: 700, color: "#0f172a" }}>
            Xác minh tài khoản {roleLabels[role] || role}
          </h4>
          <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: 14 }}>
            Tài khoản của bạn cần được xác minh trước khi đăng tin
          </p>
        </div>

        <div style={{ padding: 24 }}>
          {/* Status info */}
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#1e40af" }}>
            <strong>Email đã xác nhận ✓</strong> — Bước tiếp theo: upload tài liệu để admin duyệt.
          </div>

          <form onSubmit={handleSubmit}>
            {/* Document upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {docLabel} <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <p style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>{docHint}</p>
              <label style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                border: "2px dashed #e2e8f0", borderRadius: 10, padding: "24px 16px",
                cursor: "pointer", background: docFile ? "#f0fdf4" : "#f8fafc",
                borderColor: docFile ? "#86efac" : "#e2e8f0", transition: "all 0.2s"
              }}>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style={{ display: "none" }}
                  onChange={e => setDocFile(e.target.files?.[0] || null)}
                />
                <i className="icon icon-upload" style={{ fontSize: 28, color: docFile ? "#22c55e" : "#94a3b8", marginBottom: 8 }} />
                {docFile ? (
                  <>
                    <span style={{ fontWeight: 600, color: "#166534", fontSize: 14 }}>{docFile.name}</span>
                    <span style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{(docFile.size / 1024).toFixed(0)} KB</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 14, color: "#64748b" }}>Kéo thả hoặc <span style={{ color: "#3b82f6" }}>chọn file</span></span>
                    <span style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>PDF, JPG, PNG, DOC — tối đa 10MB</span>
                  </>
                )}
              </label>
            </div>

            {/* Note */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                Ghi chú thêm (tùy chọn)
              </label>
              <textarea
                style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, resize: "vertical", minHeight: 80, outline: "none", fontFamily: "inherit" }}
                placeholder="Mô tả thêm về tài liệu hoặc thông tin cần admin biết..."
                value={note}
                onChange={e => setNote(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="tf-btn primary w-100"
              disabled={uploading || !docFile}
            >
              {uploading ? "Đang gửi..." : "Gửi yêu cầu xác minh"}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#94a3b8" }}>
            <Link href="/" style={{ color: "#3b82f6", textDecoration: "none" }}>← Về trang chủ</Link>
            {" · "}
            <Link href="/dashboard" style={{ color: "#3b82f6", textDecoration: "none" }}>Dashboard</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <>
      <Header2 />
      <Suspense fallback={null}>
        <VerifyContent />
      </Suspense>
    </>
  );
}
