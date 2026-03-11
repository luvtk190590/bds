"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginModals() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Đóng modal khi đăng nhập thành công
  useEffect(() => {
    if (!isAuthenticated) return;
    const modal = document.getElementById("modalLogin");
    if (!modal?.classList.contains("show")) return;
    const bsModal = window.bootstrap?.Modal?.getInstance(modal);
    if (bsModal) {
      bsModal.hide();
    } else {
      // Fallback: đóng thủ công
      modal.classList.remove("show");
      modal.style.display = "none";
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
      document.querySelector(".modal-backdrop")?.remove();
    }
  }, [isAuthenticated]);

  // Thông báo xác minh email thành công
  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      toast.success("Email đã xác nhận! Tài khoản của bạn đã được kích hoạt.", { duration: 5000 });
      const p = new URLSearchParams(window.location.search);
      p.delete("verified");
      const newUrl = window.location.pathname + (p.toString() ? "?" + p.toString() : "");
      window.history.replaceState({}, "", newUrl);
    }
    if (searchParams.get("error")) {
      toast.error("Có lỗi xác thực. Vui lòng thử lại.");
      const p = new URLSearchParams(window.location.search);
      p.delete("error");
      window.history.replaceState({}, "", window.location.pathname + (p.toString() ? "?" + p.toString() : ""));
    }
  }, []);

  // Auto-open modal khi URL có ?login=1
  useEffect(() => {
    if (searchParams.get("login") === "1") {
      const tryOpen = () => {
        const modal = document.getElementById("modalLogin");
        if (modal && window.bootstrap?.Modal) {
          const bsModal = window.bootstrap.Modal.getOrCreateInstance(modal);
          bsModal.show();
          // Xóa param khỏi URL
          const p = new URLSearchParams(window.location.search);
          p.delete("login");
          const newUrl = window.location.pathname + (p.toString() ? "?" + p.toString() : "");
          window.history.replaceState({}, "", newUrl);
        } else {
          setTimeout(tryOpen, 200);
        }
      };
      setTimeout(tryOpen, 300);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }

    setLoading(true);
    const { data, error } = await signIn({ email, password });
    setLoading(false);

    if (error) {
      toast.error(error.message || "Đăng nhập thất bại");
      return;
    }

    toast.success("Đăng nhập thành công!");
    const role = data?.user?.user_metadata?.role;
    router.push(role === "admin" ? "/admin" : "/dashboard");
  };

  return (
    <div className="modal modal-account fade" id="modalLogin">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="flat-account">
            <div className="banner-account">
              <Image
                alt="banner"
                src="/images/banner/banner-account1.jpg"
                width={570}
                height={980}
              />
            </div>
            <form onSubmit={handleSubmit} className="form-account">
              <div className="title-box">
                <h4>Đăng nhập</h4>
                <span
                  className="close-modal icon-close2"
                  data-bs-dismiss="modal"
                />
              </div>
              <div className="box">
                <fieldset className="box-fieldset">
                  <label htmlFor="login-email">Email</label>
                  <div className="ip-field">
                    <svg
                      className="icon"
                      width={18}
                      height={18}
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M16.3125 5.0625V12.9375C16.3125 13.3851 16.1347 13.8143 15.8182 14.1307C15.5018 14.4472 15.0726 14.625 14.625 14.625H3.375C2.92745 14.625 2.49822 14.4472 2.18176 14.1307C1.86529 13.8143 1.6875 13.3851 1.6875 12.9375V5.0625M16.3125 5.0625C16.3125 4.61495 16.1347 4.18573 15.8182 3.86926C15.5018 3.55279 15.0726 3.375 14.625 3.375H3.375C2.92745 3.375 2.49822 3.55279 2.18176 3.86926C1.86529 4.18573 1.6875 4.61495 1.6875 5.0625M16.3125 5.0625V5.24475C16.3125 5.53286 16.2388 5.81618 16.0983 6.06772C15.9578 6.31926 15.7553 6.53065 15.51 6.68175L9.885 10.143C9.61891 10.3069 9.31252 10.3937 9 10.3937C8.68748 10.3937 8.38109 10.3069 8.115 10.143L2.49 6.6825C2.24469 6.5314 2.04215 6.32001 1.90168 6.06847C1.7612 5.81693 1.68747 5.53361 1.6875 5.2455V5.0625"
                        stroke="#A3ABB0"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input
                      id="login-email"
                      type="email"
                      className="form-control"
                      placeholder="Nhập email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </fieldset>
                <fieldset className="box-fieldset">
                  <label htmlFor="login-pass">Mật khẩu</label>
                  <div className="ip-field">
                    <svg
                      className="icon"
                      width={18}
                      height={18}
                      viewBox="0 0 18 18"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.375 7.875V5.0625C12.375 4.16739 12.0194 3.30895 11.3865 2.67601C10.7535 2.04308 9.89511 1.6875 9 1.6875C8.10489 1.6875 7.24645 2.04308 6.61351 2.67601C5.98058 3.30895 5.625 4.16739 5.625 5.0625V7.875M5.0625 16.3125H12.9375C13.3851 16.3125 13.8143 16.1347 14.1307 15.8182C14.4472 15.5018 14.625 15.0726 14.625 14.625V9.5625C14.625 9.11495 14.4472 8.68573 14.1307 8.36926C13.8143 8.05279 13.3851 7.875 12.9375 7.875H5.0625C4.61495 7.875 4.18573 8.05279 3.86926 8.36926C3.55279 8.68573 3.375 9.11495 3.375 9.5625V14.625C3.375 15.0726 3.55279 15.5018 3.86926 15.8182C4.18573 16.1347 4.61495 16.3125 5.0625 16.3125Z"
                        stroke="#A3ABB0"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input
                      id="login-pass"
                      type="password"
                      className="form-control"
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="text-forgot text-end">
                    <a href="#">Quên mật khẩu?</a>
                  </div>
                </fieldset>
              </div>
              <div className="box box-btn">
                <button
                  type="submit"
                  className="tf-btn primary w-100"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đăng nhập"}
                </button>
                <div className="text text-center">
                  Chưa có tài khoản?{" "}
                  <a
                    href="#modalRegister"
                    data-bs-toggle="modal"
                    className="text-primary"
                  >
                    Đăng ký
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
