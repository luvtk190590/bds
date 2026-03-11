"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import VerificationActions from "@/components/admin/users/VerificationActions";

export default function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [verRequest, setVerRequest] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  async function load() {
    const [
      { data: u },
      { data: vr },
      { data: props },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", id).single(),
      supabase.from("verification_requests").select("*").eq("user_id", id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("properties").select("id, title, approval_status, created_at").eq("owner_id", id).order("created_at", { ascending: false }).limit(10),
    ]);
    setUser(u);
    setVerRequest(vr);
    setProperties(props || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  if (loading) return <div className="admin-content"><p style={{ color: "#94a3b8" }}>Đang tải...</p></div>;
  if (!user) return <div className="admin-content"><p style={{ color: "#ef4444" }}>Không tìm thấy người dùng.</p></div>;

  const initials = user.full_name
    ? user.full_name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  const statusLabels = { unverified: "Chưa xác minh", pending: "Chờ duyệt", verified: "Đã xác minh", rejected: "Từ chối" };
  const statusClasses = { unverified: "draft", pending: "pending", verified: "approved", rejected: "rejected" };
  const vstatus = user.verification_status || "unverified";

  return (
    <div className="admin-content">
      <Link href="/admin/users" className="admin-back-link">
        <i className="icon icon-arrow-left2" /> Quay lại danh sách
      </Link>

      <div className="admin-detail-grid">
        {/* Left: Profile info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="admin-card admin-profile-card">
            <div className="admin-card-body">
              <div className="profile-header">
                <div className="profile-avatar">{initials}</div>
                <div>
                  <div className="profile-name">{user.full_name || "–"}</div>
                  <div className="profile-email">{user.email || "–"}</div>
                </div>
              </div>
              {[
                { label: "Vai trò", value: <span className={`admin-badge badge-${user.role}`}>{{ admin: "Quản trị", seller: "Người bán", broker: "Môi giới", buyer: "Người mua" }[user.role] || user.role}</span> },
                { label: "Xác minh", value: <span className={`admin-badge badge-${statusClasses[vstatus]}`}>{statusLabels[vstatus]}</span> },
                { label: "SĐT", value: user.phone || "–" },
                { label: "Địa chỉ", value: user.address || "–" },
                { label: "Ngày tạo", value: new Date(user.created_at).toLocaleDateString("vi-VN") },
                { label: "Ghi chú admin", value: user.admin_note || "–" },
              ].map(row => (
                <div key={row.label} className="profile-row">
                  <span className="row-label">{row.label}</span>
                  <span className="row-value">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Properties */}
          {properties.length > 0 && (
            <div className="admin-card">
              <div className="admin-card-header"><h6>Tin đăng ({properties.length})</h6></div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr><th>Tiêu đề</th><th>Trạng thái</th><th>Ngày đăng</th></tr>
                  </thead>
                  <tbody>
                    {properties.map(p => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600, fontSize: 14 }}>{p.title}</td>
                        <td><span className={`admin-badge badge-${p.approval_status || "pending"}`}>{{ pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối" }[p.approval_status] || "Chờ duyệt"}</span></td>
                        <td style={{ fontSize: 13, color: "#64748b" }}>{new Date(p.created_at).toLocaleDateString("vi-VN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Verification actions */}
        <VerificationActions
          user={user}
          verRequest={verRequest}
          onRefresh={load}
        />
      </div>
    </div>
  );
}
