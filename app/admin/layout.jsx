"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import "@/public/scss/admin.scss";

export default function AdminLayout({ children }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/");
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.7s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#64748b", fontSize: 14 }}>Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="admin-wrapper">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
