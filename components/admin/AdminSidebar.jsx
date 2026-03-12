"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";

const NAV = [
  {
    section: "Tổng quan",
    items: [
      { href: "/admin", label: "Dashboard", icon: "icon-dashboard" },
    ],
  },
  {
    section: "Quản trị hệ thống",
    items: [
      { href: "/admin/users",      label: "Tất cả người dùng", icon: "icon-profile" },
      { href: "/admin/properties", label: "Tất cả tin đăng",   icon: "icon-listing" },
      { href: "/admin/blog",       label: "Quản lý blog",       icon: "icon-edit" },
      { href: "/admin/reviews",    label: "Quản lý đánh giá",   icon: "icon-star" },
    ],
  },
  {
    section: "Giao diện & Nội dung",
    items: [
      { href: "/admin/menu",       label: "Menu chính",     icon: "icon-list-dashes" },
      { href: "/admin/footer",     label: "Footer",          icon: "icon-customize" },
      { href: "/admin/categories", label: "Danh mục BĐS",   icon: "icon-categories" },
      { href: "/admin/pages",      label: "Quản lý trang",  icon: "icon-file-text" },
      { href: "/admin/media",      label: "Thư viện Media", icon: "icon-images" },
    ],
  },
  {
    section: "Khác",
    items: [
      { href: "/", label: "Về trang chủ", icon: "icon-arrow-left2" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  function isActive(href) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "A";

  return (
    <aside className="admin-sidebar">
      {/* Logo */}
      <Link href="/admin" className="admin-sidebar-logo">
        <div className="logo-icon">
          <i className="icon icon-home-location" style={{ fontSize: 18 }} />
        </div>
        <div className="logo-text">Home<span>Lengo</span> Admin</div>
      </Link>

      {/* Nav */}
      {NAV.map(group => (
        <div key={group.section} className="admin-sidebar-section">
          <div className="section-label">{group.section}</div>
          {group.items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-item${isActive(item.href) ? " active" : ""}`}
            >
              <i className={`icon ${item.icon} nav-icon`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`nav-badge badge-${item.badgeType || "primary"}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      ))}

      {/* Footer */}
      <div className="admin-sidebar-footer">
        <div className="admin-user-info">
          <div className="user-avatar">{initials}</div>
          <div className="user-meta">
            <div className="user-name">{profile?.full_name || "Admin"}</div>
            <div className="user-role">Quản trị viên</div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="admin-nav-item"
          style={{ width: "100%", border: "none", background: "none", cursor: "pointer", textAlign: "left" }}
        >
          <i className="icon icon-sign-out nav-icon" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
