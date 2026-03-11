"use client";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import AvatarUpload from "@/components/common/AvatarUpload";
import toast from "react-hot-toast";

export default function MyProfile() {
  const { profile, updateProfile, user } = useAuth();
  const supabase = createClient();

  const [saving, setSaving] = useState(false);
  const [changingPwd, setChangingPwd] = useState(false);
  const [form, setForm] = useState(null);
  const [pwd, setPwd] = useState({ current: "", newPwd: "", confirm: "" });

  // Initialize form from profile once
  if (profile && form === null) {
    setForm({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      bio: profile.bio || "",
      company_name: profile.company_name || "",
      position: profile.position || "",
      office_phone: profile.office_phone || "",
      office_address: profile.office_address || "",
      website: profile.website || "",
      facebook: profile.facebook || "",
      zalo: profile.zalo || "",
    });
  }

  if (!profile || !form) {
    return (
      <div className="main-content">
        <div className="main-content-inner wrap-dashboard-content-2">
          <p style={{ color: "#94a3b8", padding: 40, textAlign: "center" }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  function set(key, val) {
    setForm(prev => ({ ...prev, [key]: val }));
  }

  async function saveInfo(e) {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateProfile({
      full_name: form.full_name.trim() || null,
      phone: form.phone.trim() || null,
      bio: form.bio.trim() || null,
      company_name: form.company_name.trim() || null,
      position: form.position.trim() || null,
      office_phone: form.office_phone.trim() || null,
      office_address: form.office_address.trim() || null,
      website: form.website.trim() || null,
      facebook: form.facebook.trim() || null,
      zalo: form.zalo.trim() || null,
    });
    if (error) toast.error("Lỗi lưu: " + error.message);
    else toast.success("Đã cập nhật thông tin!");
    setSaving(false);
  }

  async function savePassword(e) {
    e.preventDefault();
    if (!pwd.newPwd) { toast.error("Nhập mật khẩu mới"); return; }
    if (pwd.newPwd !== pwd.confirm) { toast.error("Mật khẩu xác nhận không khớp"); return; }
    if (pwd.newPwd.length < 6) { toast.error("Mật khẩu tối thiểu 6 ký tự"); return; }

    setChangingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: pwd.newPwd });
    if (error) toast.error("Lỗi: " + error.message);
    else {
      toast.success("Đã đổi mật khẩu thành công!");
      setPwd({ current: "", newPwd: "", confirm: "" });
    }
    setChangingPwd(false);
  }

  const roleMap = { admin: "Quản trị viên", seller: "Người bán", broker: "Môi giới", buyer: "Người mua" };
  const verMap = { verified: "Đã xác minh", pending: "Chờ duyệt", unverified: "Chưa xác minh", rejected: "Từ chối" };

  return (
    <div className="main-content">
      <div className="main-content-inner wrap-dashboard-content-2">
        <div className="widget-box-2">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <h5 className="title" style={{ marginBottom: 4 }}>Cài đặt tài khoản</h5>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className={`admin-badge badge-${profile.role}`}>{roleMap[profile.role] || profile.role}</span>
                <span className={`admin-badge badge-${profile.verification_status === "verified" ? "approved" : profile.verification_status === "pending" ? "pending" : "draft"}`}>
                  {verMap[profile.verification_status || "unverified"]}
                </span>
              </div>
            </div>
          </div>

          {/* Avatar section */}
          <div className="box">
            <h6 className="title" style={{ marginBottom: 16 }}>Ảnh đại diện</h6>
            <div className="box-agent-avt">
              <AvatarUpload
                userId={profile.id}
                currentUrl={profile.avatar_url}
                size={100}
              />
            </div>
          </div>

          {/* Info form */}
          <form onSubmit={saveInfo}>
            <h5 className="title" style={{ marginTop: 24, marginBottom: 16 }}>Thông tin cá nhân</h5>

            <div className="box box-fieldset">
              <label>Họ và tên <span>*</span></label>
              <input
                type="text"
                className="form-control style-1"
                value={form.full_name}
                onChange={e => set("full_name", e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="box box-fieldset">
              <label>Email</label>
              <input
                type="email"
                className="form-control style-1"
                value={profile.email || user?.email || ""}
                disabled
                style={{ background: "#f8fafc", color: "#94a3b8" }}
              />
            </div>

            <div className="box grid-4 gap-30">
              <div className="box-fieldset">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  className="form-control style-1"
                  value={form.phone}
                  onChange={e => set("phone", e.target.value)}
                  placeholder="0912345678"
                />
              </div>
              <div className="box-fieldset">
                <label>Công ty</label>
                <input
                  type="text"
                  className="form-control style-1"
                  value={form.company_name}
                  onChange={e => set("company_name", e.target.value)}
                  placeholder="Tên công ty"
                />
              </div>
              <div className="box-fieldset">
                <label>Chức vụ</label>
                <input
                  type="text"
                  className="form-control style-1"
                  value={form.position}
                  onChange={e => set("position", e.target.value)}
                  placeholder="Giám đốc kinh doanh"
                />
              </div>
              <div className="box-fieldset">
                <label>SĐT văn phòng</label>
                <input
                  type="tel"
                  className="form-control style-1"
                  value={form.office_phone}
                  onChange={e => set("office_phone", e.target.value)}
                  placeholder="028 xxxx xxxx"
                />
              </div>
            </div>

            <div className="box box-fieldset">
              <label>Địa chỉ văn phòng</label>
              <input
                type="text"
                className="form-control style-1"
                value={form.office_address}
                onChange={e => set("office_address", e.target.value)}
                placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
              />
            </div>

            <div className="box box-fieldset">
              <label>Giới thiệu bản thân</label>
              <textarea
                rows={4}
                className="form-control style-1"
                value={form.bio}
                onChange={e => set("bio", e.target.value)}
                placeholder="Giới thiệu ngắn về bản thân, kinh nghiệm..."
                style={{ resize: "vertical" }}
              />
            </div>

            <h5 className="title" style={{ marginTop: 8, marginBottom: 16 }}>Mạng xã hội & Website</h5>

            <div className="box grid-4 gap-30">
              <div className="box-fieldset">
                <label>Facebook</label>
                <input
                  type="url"
                  className="form-control style-1"
                  value={form.facebook}
                  onChange={e => set("facebook", e.target.value)}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="box-fieldset">
                <label>Zalo</label>
                <input
                  type="text"
                  className="form-control style-1"
                  value={form.zalo}
                  onChange={e => set("zalo", e.target.value)}
                  placeholder="Số Zalo"
                />
              </div>
              <div className="box-fieldset">
                <label>Website</label>
                <input
                  type="url"
                  className="form-control style-1"
                  value={form.website}
                  onChange={e => set("website", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="box" style={{ marginTop: 8 }}>
              <button type="submit" className="tf-btn primary" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thông tin"}
              </button>
            </div>
          </form>

          {/* Change password */}
          <form onSubmit={savePassword}>
            <h5 className="title" style={{ marginTop: 24, marginBottom: 16 }}>Đổi mật khẩu</h5>
            <div className="box grid-3 gap-30">
              <div className="box-fieldset">
                <label>Mật khẩu mới <span>*</span></label>
                <div className="box-password">
                  <input
                    type="password"
                    className="form-contact style-1 password-field2"
                    placeholder="Mật khẩu mới"
                    value={pwd.newPwd}
                    onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))}
                  />
                </div>
              </div>
              <div className="box-fieldset">
                <label>Xác nhận mật khẩu <span>*</span></label>
                <div className="box-password">
                  <input
                    type="password"
                    className="form-contact style-1 password-field3"
                    placeholder="Nhập lại mật khẩu mới"
                    value={pwd.confirm}
                    onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="box" style={{ marginTop: 8 }}>
              <button type="submit" className="tf-btn primary" disabled={changingPwd}>
                {changingPwd ? "Đang đổi..." : "Đổi mật khẩu"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="footer-dashboard">
        <p>Copyright © 2024 Home Lengo</p>
      </div>
    </div>
  );
}
