"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import toast from "react-hot-toast";

const PAGE_SIZE = 20;
const ROLE_OPTIONS = ["all", "admin", "seller", "broker", "buyer"];

function UsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checked, setChecked] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const supabase = createClient();

  const tab = searchParams.get("tab") || "all";
  const role = searchParams.get("role") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const q = searchParams.get("q") || "";

  function setParam(key, val) {
    const p = new URLSearchParams(searchParams.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/users?${p.toString()}`);
  }

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setChecked(new Set());
    let query = supabase
      .from("profiles")
      .select("id, full_name, email, role, verification_status, created_at, phone", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (role !== "all") query = query.eq("role", role);
    if (tab === "pending") query = query.eq("verification_status", "pending");
    if (q) query = query.ilike("full_name", `%${q}%`);

    const { data, count, error: qErr } = await query;
    // AbortError là lỗi tạm thời từ React StrictMode / Supabase Web Lock — bỏ qua, retry sau
    if (qErr && qErr.name === "AbortError") {
      setTimeout(() => loadUsers(), 300);
      return;
    }
    if (qErr) setError(qErr.message);
    setUsers(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [page, role, tab, q]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // Checkbox helpers
  const allIds = users.map(u => u.id);
  const allChecked = allIds.length > 0 && allIds.every(id => checked.has(id));

  function toggleAll() {
    if (allChecked) setChecked(new Set());
    else setChecked(new Set(allIds));
  }

  function toggleOne(id) {
    setChecked(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  // Bulk actions
  async function bulkVerify() {
    setBulkLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ verification_status: "verified" })
      .in("id", [...checked]);
    if (error) toast.error("Lỗi: " + error.message);
    else { toast.success(`Đã xác minh ${checked.size} tài khoản`); loadUsers(); }
    setBulkLoading(false);
  }

  async function bulkReject() {
    setBulkLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ verification_status: "rejected" })
      .in("id", [...checked]);
    if (error) toast.error("Lỗi: " + error.message);
    else { toast.success(`Đã từ chối ${checked.size} tài khoản`); loadUsers(); }
    setBulkLoading(false);
  }

  async function bulkDelete() {
    if (!confirm(`Xóa ${checked.size} người dùng? Thao tác này không thể hoàn tác.`)) return;
    setBulkLoading(true);
    const { error } = await supabase.from("profiles").delete().in("id", [...checked]);
    if (error) toast.error("Lỗi: " + error.message);
    else { toast.success(`Đã xóa ${checked.size} người dùng`); loadUsers(); }
    setBulkLoading(false);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function roleBadge(r) {
    const lbl = { admin: "Quản trị", seller: "Người bán", broker: "Môi giới", buyer: "Người mua" };
    return <span className={`admin-badge badge-${r}`}>{lbl[r] || r}</span>;
  }

  function statusBadge(status) {
    const map = { unverified: "draft", pending: "pending", verified: "approved", rejected: "rejected" };
    const labels = { unverified: "Chưa xác minh", pending: "Chờ duyệt", verified: "Đã xác minh", rejected: "Từ chối" };
    return <span className={`admin-badge badge-${map[status] || "draft"}`}>{labels[status] || status}</span>;
  }

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h4>Quản lý người dùng</h4>
          <p>Danh sách và xét duyệt tài khoản người dùng</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
          <strong>Lỗi truy vấn:</strong> {error}
        </div>
      )}

      <div className="admin-card">
        {/* Toolbar */}
        <div className="admin-card-header">
          <div className="admin-toolbar" style={{ marginBottom: 0 }}>
            <div className="admin-tab-pills">
              {[{ v: "all", l: "Tất cả" }, { v: "pending", l: "Chờ xác minh" }].map(t => (
                <button key={t.v} className={`tab-pill${tab === t.v ? " active" : ""}`}
                  onClick={() => setParam("tab", t.v === "all" ? "" : t.v)}>{t.l}</button>
              ))}
            </div>
            <select className="admin-filter-select" value={role}
              onChange={e => setParam("role", e.target.value === "all" ? "" : e.target.value)}>
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r === "all" ? "Tất cả vai trò" : r}</option>)}
            </select>
            <div className="admin-search">
              <i className="icon icon-search search-icon" />
              <input type="text" placeholder="Tìm theo tên..." defaultValue={q}
                onKeyDown={e => { if (e.key === "Enter") setParam("q", e.target.value); }} />
            </div>
          </div>
        </div>

        {/* Bulk action bar */}
        {checked.size > 0 && (
          <div className="bulk-action-bar">
            <span><span className="bulk-count">{checked.size}</span> người dùng đã chọn</span>
            <div className="bulk-sep" />
            <button className="admin-btn btn-success btn-sm" onClick={bulkVerify} disabled={bulkLoading}>
              <i className="icon icon-check-circle" /> Xác minh tất cả
            </button>
            <button className="admin-btn btn-outline btn-sm" onClick={bulkReject} disabled={bulkLoading}>
              <i className="icon icon-close" /> Từ chối tất cả
            </button>
            <div className="bulk-sep" />
            <button className="admin-btn btn-danger btn-sm" onClick={bulkDelete} disabled={bulkLoading}>
              <i className="icon icon-trash" /> Xóa {checked.size} người dùng
            </button>
            <button className="admin-btn btn-ghost btn-sm" onClick={() => setChecked(new Set())}>Bỏ chọn</button>
          </div>
        )}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="th-check">
                  <input type="checkbox" className="admin-checkbox" checked={allChecked} onChange={toggleAll} />
                </th>
                <th>Người dùng</th>
                <th>SĐT</th>
                <th>Vai trò</th>
                <th>Xác minh</th>
                <th>Ngày tạo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Đang tải...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Không có dữ liệu</td></tr>
              ) : users.map(u => (
                <tr key={u.id} style={{ background: checked.has(u.id) ? "#eff6ff" : undefined }}>
                  <td className="td-check">
                    <input type="checkbox" className="admin-checkbox" checked={checked.has(u.id)} onChange={() => toggleOne(u.id)} />
                  </td>
                  <td>
                    <div className="td-user">
                      <div className="user-av">{(u.full_name || u.email || "?")[0].toUpperCase()}</div>
                      <div>
                        <div className="user-info-name">{u.full_name || "–"}</div>
                        <div className="user-info-email">{u.email || "–"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "#64748b", fontSize: 13 }}>{u.phone || "–"}</td>
                  <td>{roleBadge(u.role)}</td>
                  <td>{statusBadge(u.verification_status || "unverified")}</td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>{new Date(u.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <Link href={`/admin/users/${u.id}`} className="admin-btn btn-outline btn-sm">Chi tiết</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="admin-pagination">
            <button className="page-btn" disabled={page <= 1} onClick={() => setParam("page", String(page - 1))}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`page-btn${p === page ? " active" : ""}`} onClick={() => setParam("page", String(p))}>{p}</button>
            ))}
            <button className="page-btn" disabled={page >= totalPages} onClick={() => setParam("page", String(page + 1))}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="admin-content"><p style={{ color: "#94a3b8" }}>Đang tải...</p></div>}>
      <UsersContent />
    </Suspense>
  );
}
