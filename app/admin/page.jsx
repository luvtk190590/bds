"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentProperties, setRecentProperties] = useState([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [
        { count: totalUsers },
        { count: pendingVerifications },
        { count: pendingProperties },
        { count: totalPosts },
        { count: totalProperties },
        { data: users },
        { data: props },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("verification_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("approval_status", "pending"),
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("properties").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("id, full_name, email, role, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("properties").select("id, title, approval_status, created_at, slug").order("created_at", { ascending: false }).limit(5),
      ]);
      setStats({ totalUsers, pendingVerifications, pendingProperties, totalPosts, totalProperties });
      setRecentUsers(users || []);
      setRecentProperties(props || []);
    }
    load();
  }, []);

  const statCards = stats ? [
    { label: "Tổng người dùng", value: stats.totalUsers, icon: "icon-user2", color: "icon-blue", link: "/admin/users" },
    { label: "Chờ xác minh", value: stats.pendingVerifications, icon: "icon-check-circle", color: "icon-orange", link: "/admin/users?tab=pending" },
    { label: "Tin chờ duyệt", value: stats.pendingProperties, icon: "icon-home-location", color: "icon-purple", link: "/admin/properties?tab=pending" },
    { label: "Tổng tin đăng", value: stats.totalProperties, icon: "icon-listing", color: "icon-cyan", link: "/admin/properties" },
    { label: "Bài viết blog", value: stats.totalPosts, icon: "icon-edit", color: "icon-green", link: "/admin/blog" },
  ] : [];

  function roleBadge(role) {
    const lbl = { admin: "Quản trị", seller: "Người bán", broker: "Môi giới", buyer: "Người mua" };
    return <span className={`admin-badge badge-${role || "buyer"}`}>{lbl[role] || role}</span>;
  }

  function approvalBadge(status) {
    const cls = { pending: "pending", approved: "approved", rejected: "rejected" };
    const lbl = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối" };
    return <span className={`admin-badge badge-${cls[status] || "pending"}`}>{lbl[status] || "Chờ duyệt"}</span>;
  }

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h4>Dashboard</h4>
          <p>Tổng quan hệ thống quản trị</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {statCards.map(s => (
          <Link key={s.label} href={s.link} style={{ textDecoration: "none" }}>
            <div className="admin-stat-card">
              <div className={`stat-icon ${s.color}`}>
                <i className={`icon ${s.icon}`} />
              </div>
              <div className="stat-info">
                <div className="stat-value">{s.value ?? "–"}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent users */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h6>Người dùng mới</h6>
            <Link href="/admin/users" className="admin-btn btn-ghost btn-sm">Xem tất cả</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="td-user">
                        <div className="user-av">{(u.full_name || u.email || "?")[0].toUpperCase()}</div>
                        <div>
                          <div className="user-info-name">{u.full_name || "–"}</div>
                          <div className="user-info-email">{u.email || "–"}</div>
                        </div>
                      </div>
                    </td>
                    <td>{roleBadge(u.role)}</td>
                    <td style={{ fontSize: 13, color: "#64748b" }}>
                      {new Date(u.created_at).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
                {!recentUsers.length && (
                  <tr><td colSpan={3} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Chưa có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent properties */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h6>Tin đăng gần đây</h6>
            <Link href="/admin/properties" className="admin-btn btn-ghost btn-sm">Xem tất cả</Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Trạng thái</th>
                  <th>Ngày đăng</th>
                </tr>
              </thead>
              <tbody>
                {recentProperties.map(p => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/properties?id=${p.id}`} style={{ color: "#0f172a", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                        {p.title?.length > 40 ? p.title.slice(0, 40) + "…" : p.title}
                      </Link>
                    </td>
                    <td>{approvalBadge(p.approval_status || "pending")}</td>
                    <td style={{ fontSize: 13, color: "#64748b" }}>
                      {new Date(p.created_at).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))}
                {!recentProperties.length && (
                  <tr><td colSpan={3} style={{ textAlign: "center", color: "#94a3b8", padding: 24 }}>Chưa có dữ liệu</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
