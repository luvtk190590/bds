"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { USER_ROLES } from "@/lib/constants";
import toast from "react-hot-toast";

const ROLE_INFO = {
  buyer: {
    icon: "🏠",
    title: "Người mua",
    desc: "Tìm kiếm và liên hệ mua/thuê BDS",
    verify: "Xác nhận email → tự động kích hoạt ngay",
    color: "#0ea5e9",
  },
  seller: {
    icon: "📋",
    title: "Người bán",
    desc: "Đăng tin bán/cho thuê BDS của bạn",
    verify: "Cần upload giấy tờ BDS → admin duyệt (24-48h)",
    color: "#f59e0b",
  },
  broker: {
    icon: "🏢",
    title: "Môi giới",
    desc: "Môi giới và quản lý nhiều BDS",
    verify: "Cần upload chứng chỉ môi giới → admin duyệt (24-48h)",
    color: "#8b5cf6",
  },
};

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { signUp } = useAuth();

  function closeModal() {
    const modal = document.getElementById("modalRegister");
    if (modal && window.bootstrap?.Modal) {
      window.bootstrap.Modal.getOrCreateInstance(modal).hide();
    }
  }

  function resetForm() {
    setFullName(""); setEmail(""); setPassword(""); setConfirmPassword("");
    setRole("buyer"); setDone(false);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    const { error } = await signUp({ email, password, fullName, role });
    setLoading(false);

    if (error) {
      if (error.message?.includes("already registered")) {
        toast.error("Email này đã được đăng ký. Vui lòng đăng nhập.");
      } else {
        toast.error(error.message || "Đăng ký thất bại");
      }
      return;
    }

    setDone(true);
  };

  const info = ROLE_INFO[role];

  return (
    <div className="modal modal-account fade" id="modalRegister">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="flat-account">
            <div className="banner-account">
              <Image
                alt="banner"
                src="/images/banner/banner-account2.jpg"
                width={570}
                height={1263}
              />
            </div>

            {/* Success state */}
            {done ? (
              <div className="form-account" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
                <div className="title-box">
                  <h4>Đăng ký thành công!</h4>
                  <span className="close-modal icon-close2" data-bs-dismiss="modal" onClick={resetForm} />
                </div>
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>📧</div>
                  <h5 style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>Kiểm tra hộp thư của bạn</h5>
                  <p style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
                    Chúng tôi đã gửi email xác nhận tới<br />
                    <strong style={{ color: "#0f172a" }}>{email}</strong>
                  </p>
                  {role === "buyer" ? (
                    <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#166534", textAlign: "left" }}>
                      ✓ Click vào link trong email để <strong>kích hoạt tài khoản ngay lập tức</strong>.
                    </div>
                  ) : (
                    <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#854d0e", textAlign: "left" }}>
                      <div style={{ marginBottom: 6 }}>1. Click link trong email để xác nhận</div>
                      <div>2. Upload tài liệu xác minh → Admin duyệt trong <strong>24–48 giờ</strong></div>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="tf-btn primary w-100"
                  onClick={() => { closeModal(); resetForm(); }}
                >
                  Đóng
                </button>
              </div>
            ) : (
              /* Form state */
              <form onSubmit={handleSubmit} className="form-account">
                <div className="title-box">
                  <h4>Đăng ký tài khoản</h4>
                  <span className="close-modal icon-close2" data-bs-dismiss="modal" />
                </div>

                <div className="box">
                  {/* Role Selection */}
                  <fieldset className="box-fieldset">
                    <label>Bạn là</label>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      {USER_ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          style={{
                            flex: 1, padding: "8px 4px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                            border: `2px solid ${role === r.value ? ROLE_INFO[r.value].color : "#e2e8f0"}`,
                            background: role === r.value ? `${ROLE_INFO[r.value].color}15` : "#fff",
                            color: role === r.value ? ROLE_INFO[r.value].color : "#64748b",
                            cursor: "pointer", transition: "all 0.2s", textAlign: "center",
                          }}
                        >
                          <div style={{ fontSize: 16, marginBottom: 2 }}>{ROLE_INFO[r.value].icon}</div>
                          {r.label}
                        </button>
                      ))}
                    </div>
                    {/* Role info */}
                    <div style={{
                      background: `${info.color}10`, border: `1px solid ${info.color}40`,
                      borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "#475569"
                    }}>
                      <div style={{ marginBottom: 3 }}>{info.desc}</div>
                      <div style={{ color: info.color, fontWeight: 600 }}>🔑 {info.verify}</div>
                    </div>
                  </fieldset>

                  {/* Full Name */}
                  <fieldset className="box-fieldset">
                    <label htmlFor="reg-name">Họ và tên</label>
                    <div className="ip-field">
                      <svg className="icon" width={18} height={18} viewBox="0 0 18 18" fill="none">
                        <path d="M13.4869 14.0435C12.9628 13.3497 12.2848 12.787 11.5063 12.3998C10.7277 12.0126 9.86989 11.8115 9.00038 11.8123C8.13086 11.8115 7.27304 12.0126 6.49449 12.3998C5.71594 12.787 5.03793 13.3497 4.51388 14.0435M13.4869 14.0435C14.5095 13.1339 15.2307 11.9349 15.5563 10.6056C15.8818 9.27625 15.7956 7.87934 15.309 6.60014C14.8224 5.32093 13.9584 4.21986 12.8317 3.44295C11.7049 2.66604 10.3686 2.25 9 2.25C7.63137 2.25 6.29508 2.66604 5.16833 3.44295C4.04158 4.21986 3.17762 5.32093 2.69103 6.60014C2.20443 7.87934 2.11819 9.27625 2.44374 10.6056C2.76929 11.9349 3.49125 13.1339 4.51388 14.0435M13.4869 14.0435C12.2524 15.1447 10.6546 15.7521 9.00038 15.7498C7.3459 15.7523 5.74855 15.1448 4.51388 14.0435M11.2504 7.31228C11.2504 7.90902 11.0133 8.48131 10.5914 8.90327C10.1694 9.32523 9.59711 9.56228 9.00038 9.56228C8.40364 9.56228 7.83134 9.32523 7.40939 8.90327C6.98743 8.48131 6.75038 7.90902 6.75038 7.31228C6.75038 6.71554 6.98743 6.14325 7.40939 5.72129C7.83134 5.29933 8.40364 5.06228 9.00038 5.06228C9.59711 5.06228 10.1694 5.29933 10.5914 5.72129C11.0133 6.14325 11.2504 6.71554 11.2504 7.31228Z" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input id="reg-name" type="text" className="form-control" placeholder="Nhập họ và tên" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                  </fieldset>

                  {/* Email */}
                  <fieldset className="box-fieldset">
                    <label htmlFor="reg-email">Email</label>
                    <div className="ip-field">
                      <svg className="icon" width={18} height={18} viewBox="0 0 18 18" fill="none">
                        <path d="M16.3125 5.0625V12.9375C16.3125 13.3851 16.1347 13.8143 15.8182 14.1307C15.5018 14.4472 15.0726 14.625 14.625 14.625H3.375C2.92745 14.625 2.49822 14.4472 2.18176 14.1307C1.86529 13.8143 1.6875 13.3851 1.6875 12.9375V5.0625M16.3125 5.0625C16.3125 4.61495 16.1347 4.18573 15.8182 3.86926C15.5018 3.55279 15.0726 3.375 14.625 3.375H3.375C2.92745 3.375 2.49822 3.55279 2.18176 3.86926C1.86529 4.18573 1.6875 4.61495 1.6875 5.0625M16.3125 5.0625V5.24475C16.3125 5.53286 16.2388 5.81618 16.0983 6.06772C15.9578 6.31926 15.7553 6.53065 15.51 6.68175L9.885 10.143C9.61891 10.3069 9.31252 10.3937 9 10.3937C8.68748 10.3937 8.38109 10.3069 8.115 10.143L2.49 6.6825C2.24469 6.5314 2.04215 6.32001 1.90168 6.06847C1.7612 5.81693 1.68747 5.53361 1.6875 5.2455V5.0625" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input id="reg-email" type="email" className="form-control" placeholder="Nhập email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </fieldset>

                  {/* Password */}
                  <fieldset className="box-fieldset">
                    <label htmlFor="reg-pass">Mật khẩu</label>
                    <div className="ip-field">
                      <svg className="icon" width={18} height={18} viewBox="0 0 18 18" fill="none">
                        <path d="M12.375 7.875V5.0625C12.375 4.16739 12.0194 3.30895 11.3865 2.67601C10.7535 2.04308 9.89511 1.6875 9 1.6875C8.10489 1.6875 7.24645 2.04308 6.61351 2.67601C5.98058 3.30895 5.625 4.16739 5.625 5.0625V7.875M5.0625 16.3125H12.9375C13.3851 16.3125 13.8143 16.1347 14.1307 15.8182C14.4472 15.5018 14.625 15.0726 14.625 14.625V9.5625C14.625 9.11495 14.4472 8.68573 14.1307 8.36926C13.8143 8.05279 13.3851 7.875 12.9375 7.875H5.0625C4.61495 7.875 4.18573 8.05279 3.86926 8.36926C3.55279 8.68573 3.375 9.11495 3.375 9.5625V14.625C3.375 15.0726 3.55279 15.5018 3.86926 15.8182C4.18573 16.1347 4.61495 16.3125 5.0625 16.3125Z" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input id="reg-pass" type="password" className="form-control" placeholder="Ít nhất 6 ký tự" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                    </div>
                  </fieldset>

                  {/* Confirm Password */}
                  <fieldset className="box-fieldset">
                    <label htmlFor="reg-confirm">Xác nhận mật khẩu</label>
                    <div className="ip-field">
                      <svg className="icon" width={18} height={18} viewBox="0 0 18 18" fill="none">
                        <path d="M12.375 7.875V5.0625C12.375 4.16739 12.0194 3.30895 11.3865 2.67601C10.7535 2.04308 9.89511 1.6875 9 1.6875C8.10489 1.6875 7.24645 2.04308 6.61351 2.67601C5.98058 3.30895 5.625 4.16739 5.625 5.0625V7.875M5.0625 16.3125H12.9375C13.3851 16.3125 13.8143 16.1347 14.1307 15.8182C14.4472 15.5018 14.625 15.0726 14.625 14.625V9.5625C14.625 9.11495 14.4472 8.68573 14.1307 8.36926C13.8143 8.05279 13.3851 7.875 12.9375 7.875H5.0625C4.61495 7.875 4.18573 8.05279 3.86926 8.36926C3.55279 8.68573 3.375 9.11495 3.375 9.5625V14.625C3.375 15.0726 3.55279 15.5018 3.86926 15.8182C4.18573 16.1347 4.61495 16.3125 5.0625 16.3125Z" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input id="reg-confirm" type="password" className="form-control" placeholder="Nhập lại mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    </div>
                  </fieldset>
                </div>

                <div className="box box-btn">
                  <button type="submit" className="tf-btn primary w-100" disabled={loading}>
                    {loading ? "Đang xử lý..." : "Đăng ký"}
                  </button>
                  <div className="text text-center">
                    Đã có tài khoản?{" "}
                    <a href="#modalLogin" data-bs-toggle="modal" data-bs-dismiss="modal" className="text-primary">
                      Đăng nhập
                    </a>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
