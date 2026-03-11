"use client";
import { useRef, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { uploadImageAsWebP } from "@/lib/utils/imageUpload";
import toast from "react-hot-toast";

// ── Helpers ─────────────────────────────────────────────────────
export function getModalStep(profile) {
  const vs = profile?.verification_status;
  const role = profile?.role;

  if (vs === "verified") {
    // Đã verified nhưng chưa thấy thông báo → hiện thông báo 1 lần
    if (!profile?.verified_notified) return "notify_verified";
    return "can_post"; // đã thấy rồi → không mở modal nữa
  }
  if (vs === "rejected") {
    // Bị từ chối, chưa thấy lý do → hiện lý do 1 lần
    if (!profile?.rejection_notified) return "notify_rejected";
    // Đã thấy → cho phép gửi lại form
    return "select";
  }
  if (vs === "pending") return "pending";
  // unverified
  return "select";
}

// ── Chọn vai trò ────────────────────────────────────────────────
function RoleSelect({ onSelect }) {
  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <i className="icon icon-lockbox" style={{ fontSize: 44, color: "#3b82f6", display: "block", marginBottom: 12 }} />
        <h5 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Bạn cần xác thực để đăng tin</h5>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 0 }}>
          Chọn loại tài khoản phù hợp để tiếp tục
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { role: "seller", icon: "icon-sale-home", color: "#f59e0b", bg: "#fffbeb", label: "Người bán", desc: "Đăng tin bán/cho thuê BDS của bạn", sub: "Upload ảnh Sổ đỏ" },
          { role: "broker", icon: "icon-profile", color: "#8b5cf6", bg: "#f5f3ff", label: "Môi giới", desc: "Đăng tin và quản lý nhiều BDS", sub: "Upload Chứng chỉ môi giới" },
        ].map(item => (
          <button
            key={item.role}
            type="button"
            onClick={() => onSelect(item.role)}
            style={{ padding: "20px 16px", border: "2px solid #e2e8f0", borderRadius: 12, background: "#fff", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = item.color; e.currentTarget.style.background = item.bg; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#fff"; }}
          >
            <i className={`icon ${item.icon}`} style={{ fontSize: 36, color: item.color, display: "block", marginBottom: 10 }} />
            <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5, marginBottom: 8 }}>{item.desc}</div>
            <div style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{item.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Form đăng ký ─────────────────────────────────────────────────
function VerifyForm({ role, profile, onSuccess }) {
  const supabase = createClient();
  const { updateProfile } = useAuth();
  const docRef = useRef(null);
  const isBroker = role === "broker";

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [address, setAddress] = useState("");
  const [docFile, setDocFile] = useState(null);
  const [docPreview, setDocPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleDocChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFile(file);
    setDocPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fullName.trim()) { toast.error("Vui lòng nhập họ tên"); return; }
    if (!phone.trim()) { toast.error("Vui lòng nhập số điện thoại"); return; }
    if (!isBroker && !address.trim()) { toast.error("Vui lòng nhập địa chỉ tài sản"); return; }
    if (!docFile) { toast.error(isBroker ? "Vui lòng upload ảnh chứng chỉ" : "Vui lòng upload ảnh sổ đỏ"); return; }

    setSubmitting(true);
    try {
      // Bước 1: Upload ảnh giấy tờ
      toast.loading("Đang upload giấy tờ...", { id: "ver-upload" });
      const folder = isBroker ? "certificates" : "property-docs";
      const docUrl = await uploadImageAsWebP(docFile, supabase, "documents", folder, 2000, 0.88);
      toast.dismiss("ver-upload");

      // Bước 2: Cập nhật profile
      toast.loading("Đang lưu thông tin...", { id: "ver-save" });
      const { error: profileErr } = await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
        role,
        verification_status: "pending",
        rejection_notified: false,
        verified_notified: false,
      });
      if (profileErr) throw profileErr;

      // Bước 3: Gửi yêu cầu xác minh
      const { error: vrErr } = await supabase
        .from("verification_requests")
        .upsert({
          user_id: profile.id,
          role,
          status: "pending",
          note: isBroker
            ? `Đăng ký môi giới - SĐT: ${phone}`
            : `Đăng ký người bán - Địa chỉ: ${address}`,
          ...(isBroker ? { certificate_url: docUrl } : { property_doc_url: docUrl }),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (vrErr) throw vrErr;

      toast.dismiss("ver-save");
      onSuccess();
    } catch (err) {
      toast.dismiss("ver-upload");
      toast.dismiss("ver-save");
      toast.error("Lỗi: " + (err.message || "Không xác định"), { duration: 5000 });
      console.error("[VerificationModal]", err);
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <i className={`icon ${isBroker ? "icon-profile" : "icon-sale-home"}`}
          style={{ fontSize: 32, color: isBroker ? "#8b5cf6" : "#f59e0b", flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 4 }}>
            Đăng ký {isBroker ? "Môi giới" : "Người bán"}
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>
            {isBroker ? "Upload chứng chỉ môi giới để xác minh" : "Upload ảnh sổ đỏ để xác minh"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Họ và tên <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nguyễn Văn A"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            Số điện thoại <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0912 345 678"
            style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
        </div>

        {!isBroker && (
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Địa chỉ tài sản cần bán <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          </div>
        )}

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
            {isBroker ? "Ảnh chứng chỉ môi giới" : "Ảnh sổ đỏ / giấy tờ BDS"} <span style={{ color: "#ef4444" }}>*</span>
          </label>
          {docPreview ? (
            <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", marginBottom: 8 }}>
              <img src={docPreview} alt="preview" style={{ width: "100%", maxHeight: 180, objectFit: "contain", background: "#f8fafc", display: "block" }} />
              <button type="button"
                onClick={() => { setDocFile(null); setDocPreview(null); if (docRef.current) docRef.current.value = ""; }}
                style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>
                ✕
              </button>
            </div>
          ) : (
            <div onClick={() => docRef.current?.click()}
              style={{ border: "2px dashed #e2e8f0", borderRadius: 8, padding: "24px 16px", textAlign: "center", cursor: "pointer", color: "#94a3b8", transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}>
              <i className="icon icon-file-text" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
              <div style={{ fontSize: 13, marginBottom: 4 }}>Nhấn để chọn {isBroker ? "ảnh chứng chỉ" : "ảnh sổ đỏ"}</div>
              <div style={{ fontSize: 11 }}>JPG, PNG, WEBP · Tối đa 20MB</div>
            </div>
          )}
          <input ref={docRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleDocChange} />
        </div>
      </div>

      <button type="submit" disabled={submitting}
        style={{ width: "100%", marginTop: 20, padding: "12px", border: "none", borderRadius: 8, background: isBroker ? "#8b5cf6" : "#f59e0b", color: "#fff", fontWeight: 700, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
        {submitting ? "Đang gửi..." : "Gửi yêu cầu xác minh"}
      </button>
    </form>
  );
}

// ── Chờ duyệt ────────────────────────────────────────────────────
function PendingState({ onClose }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <i className="icon icon-clock-countdown" style={{ fontSize: 52, color: "#f59e0b", display: "block", marginBottom: 14 }} />
      <h5 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Đơn đăng ký đã được gửi</h5>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
        Yêu cầu của bạn đang chờ admin xem xét.<br />
        Thường mất <strong>24–48 giờ</strong>. Bạn sẽ nhận thông báo khi được duyệt.
      </p>
      <button type="button" onClick={onClose}
        style={{ padding: "10px 28px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
        Đã hiểu
      </button>
    </div>
  );
}

// ── Đã xác minh (hiện 1 lần) ─────────────────────────────────────
function VerifiedNotifyState({ profile, onDone }) {
  const supabase = createClient();
  const { updateProfile } = useAuth();

  async function handleAck() {
    await updateProfile({ verified_notified: true });
    onDone();
  }

  const roleLabel = profile?.role === "broker" ? "Môi giới" : "Người bán";

  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <i className="icon icon-check-circle" style={{ fontSize: 52, color: "#22c55e", display: "block", marginBottom: 14 }} />
      <h5 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Tài khoản đã được xác minh!</h5>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 6, lineHeight: 1.6 }}>
        Chúc mừng! Tài khoản <strong>{roleLabel}</strong> của bạn đã được admin xác minh thành công.
      </p>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Bạn có thể đăng tin bất động sản ngay bây giờ.
      </p>
      <button type="button" onClick={handleAck}
        style={{ padding: "11px 32px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
        <i className="icon icon-send" style={{ marginRight: 6 }} />
        Đăng tin ngay
      </button>
    </div>
  );
}

// ── Bị từ chối (hiện 1 lần + cho gửi lại) ───────────────────────
function RejectedNotifyState({ profile, onResubmit }) {
  const { updateProfile } = useAuth();
  const supabase = createClient();

  async function handleResubmit() {
    // Reset rejection_notified → true (đã thấy), cho phép gửi lại
    await updateProfile({ rejection_notified: true });
    onResubmit();
  }

  const adminNote = profile?.admin_note || "Không có lý do cụ thể.";

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <i className="icon icon-close2" style={{ fontSize: 48, color: "#ef4444", display: "block", marginBottom: 12 }} />
        <h5 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>Yêu cầu bị từ chối</h5>
        <p style={{ color: "#64748b", fontSize: 14, marginBottom: 0 }}>
          Rất tiếc, yêu cầu xác minh của bạn không được chấp thuận.
        </p>
      </div>

      <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 16px", marginBottom: 20 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#991b1b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>
          Lý do từ chối
        </div>
        <div style={{ fontSize: 14, color: "#7f1d1d", lineHeight: 1.6 }}>{adminNote}</div>
      </div>

      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.6, textAlign: "center" }}>
        Bạn có thể chỉnh sửa hồ sơ và gửi lại yêu cầu xác minh.
      </p>

      <button type="button" onClick={handleResubmit}
        style={{ width: "100%", padding: "11px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
        Gửi lại yêu cầu
      </button>
    </div>
  );
}

// ── Gửi thành công ────────────────────────────────────────────────
function SuccessState({ onClose }) {
  return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <i className="icon icon-send" style={{ fontSize: 48, color: "#3b82f6", display: "block", marginBottom: 14 }} />
      <h5 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Đã gửi yêu cầu thành công!</h5>
      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
        Admin sẽ xem xét và xác minh tài khoản của bạn trong <strong>24–48 giờ</strong>.
      </p>
      <button type="button" onClick={onClose}
        style={{ padding: "10px 28px", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
        Đóng
      </button>
    </div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────
export default function VerificationModal({ open, onClose, profile, onPostAllowed }) {
  const initialStep = getModalStep(profile);
  const [step, setStep] = useState(null); // null = chưa khởi tạo
  const [selectedRole, setSelectedRole] = useState(null);

  // Khởi tạo step khi mở modal
  const currentStep = step ?? initialStep;

  if (!open) return null;
  // Trường hợp đã verified_notified → không cần mở modal, vào thẳng
  if (currentStep === "can_post") {
    onPostAllowed?.();
    return null;
  }

  function handleRoleSelect(role) {
    setSelectedRole(role);
    setStep("form");
  }

  function handleFormSuccess() {
    setStep("submitted");
  }

  function handleVerifiedAck() {
    onPostAllowed?.();
    onClose();
  }

  function handleResubmit() {
    setStep("select");
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 99999, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)", position: "relative" }}>
        {/* Close */}
        <button type="button" onClick={onClose}
          style={{ position: "absolute", top: 14, right: 16, background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#94a3b8", lineHeight: 1 }}>
          ✕
        </button>

        {/* Back trên form */}
        {currentStep === "form" && (
          <button type="button" onClick={() => setStep("select")}
            style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", fontSize: 13, marginBottom: 12, padding: 0 }}>
            ← Quay lại
          </button>
        )}

        {currentStep === "select"    && <RoleSelect onSelect={handleRoleSelect} />}
        {currentStep === "form"      && <VerifyForm role={selectedRole} profile={profile} onSuccess={handleFormSuccess} />}
        {currentStep === "submitted" && <PendingState onClose={onClose} />}
        {currentStep === "pending"   && <PendingState onClose={onClose} />}
        {currentStep === "notify_verified" && <VerifiedNotifyState profile={profile} onDone={handleVerifiedAck} />}
        {currentStep === "notify_rejected" && <RejectedNotifyState profile={profile} onResubmit={handleResubmit} />}
      </div>
    </div>
  );
}
