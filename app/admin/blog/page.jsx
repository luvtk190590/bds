"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import toast from "react-hot-toast";
import DeletePostBtn from "@/components/admin/blog/DeletePostBtn";

const PAGE_SIZE = 15;

function BlogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checked, setChecked] = useState(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);
  const supabase = createClient();

  const tab = searchParams.get("tab") || "all";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const q = searchParams.get("q") || "";

  function setParam(key, val) {
    const p = new URLSearchParams(searchParams.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/blog?${p.toString()}`);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setChecked(new Set());
    let query = supabase
      .from("posts")
      .select("id, title, slug, status, category, created_at, reading_time, focus_keyword", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (tab !== "all") query = query.eq("status", tab);
    if (q) query = query.ilike("title", `%${q}%`);

    const { data, count, error: qErr } = await query;
    if (qErr && qErr.name === "AbortError") {
      setTimeout(() => load(), 300);
      return;
    }
    if (qErr) setError(qErr.message);
    setPosts(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [tab, page, q]);

  useEffect(() => { load(); }, [load]);

  // Checkbox helpers
  const allIds = posts.map(p => p.id);
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
  async function bulkSetStatus(status) {
    setBulkLoading(true);
    const { error } = await supabase
      .from("posts")
      .update({ status })
      .in("id", [...checked]);
    if (error) toast.error("Lỗi: " + error.message);
    else { toast.success(`Đã cập nhật ${checked.size} bài viết`); load(); }
    setBulkLoading(false);
  }

  async function bulkDelete() {
    if (!confirm(`Xóa ${checked.size} bài viết? Không thể hoàn tác.`)) return;
    setBulkLoading(true);
    const { error } = await supabase.from("posts").delete().in("id", [...checked]);
    if (error) toast.error("Lỗi: " + error.message);
    else { toast.success(`Đã xóa ${checked.size} bài viết`); load(); }
    setBulkLoading(false);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const TABS = [
    { v: "all", l: "Tất cả" },
    { v: "published", l: "Đã đăng" },
    { v: "draft", l: "Nháp" },
    { v: "archived", l: "Lưu trữ" },
  ];

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h4>Quản lý bài viết</h4>
          <p>Viết, chỉnh sửa và tối ưu SEO cho bài blog</p>
        </div>
        <Link href="/admin/blog/new" className="admin-btn btn-primary">
          <i className="icon icon-add" /> Viết bài mới
        </Link>
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
              {TABS.map(t => (
                <button key={t.v} className={`tab-pill${tab === t.v ? " active" : ""}`}
                  onClick={() => setParam("tab", t.v === "all" ? "" : t.v)}>{t.l}</button>
              ))}
            </div>
            <div className="admin-search">
              <i className="icon icon-search search-icon" />
              <input type="text" placeholder="Tìm bài viết..." defaultValue={q}
                onKeyDown={e => { if (e.key === "Enter") setParam("q", e.target.value); }} />
            </div>
          </div>
        </div>

        {/* Bulk action bar */}
        {checked.size > 0 && (
          <div className="bulk-action-bar">
            <span><span className="bulk-count">{checked.size}</span> bài đã chọn</span>
            <div className="bulk-sep" />
            <button className="admin-btn btn-success btn-sm" onClick={() => bulkSetStatus("published")} disabled={bulkLoading}>
              <i className="icon icon-send" /> Đăng tất cả
            </button>
            <button className="admin-btn btn-outline btn-sm" onClick={() => bulkSetStatus("draft")} disabled={bulkLoading}>
              Về nháp
            </button>
            <button className="admin-btn btn-outline btn-sm" onClick={() => bulkSetStatus("archived")} disabled={bulkLoading}>
              Lưu trữ
            </button>
            <div className="bulk-sep" />
            <button className="admin-btn btn-danger btn-sm" onClick={bulkDelete} disabled={bulkLoading}>
              <i className="icon icon-trash" /> Xóa {checked.size} bài
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
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Focus Keyword</th>
                <th>Đọc</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Đang tải...</td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Không có bài viết nào</td></tr>
              ) : posts.map(p => (
                <tr key={p.id} style={{ background: checked.has(p.id) ? "#eff6ff" : undefined }}>
                  <td className="td-check">
                    <input type="checkbox" className="admin-checkbox" checked={checked.has(p.id)} onChange={() => toggleOne(p.id)} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>
                      {p.title?.length > 50 ? p.title.slice(0, 50) + "…" : p.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{p.slug}</div>
                  </td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>{p.category || "–"}</td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>{p.focus_keyword || "–"}</td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>{p.reading_time ? `${p.reading_time} phút` : "–"}</td>
                  <td><span className={`admin-badge badge-${p.status || "draft"}`}>{{ published: "Đã đăng", draft: "Nháp", archived: "Lưu trữ" }[p.status] || "Nháp"}</span></td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>{new Date(p.created_at).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link href={`/admin/blog/${p.id}/edit`} className="admin-btn btn-outline btn-sm">Sửa</Link>
                      {p.slug && (
                        <a href={`/blogs/${p.slug}`} target="_blank" rel="noopener noreferrer" className="admin-btn btn-ghost btn-sm">Xem</a>
                      )}
                      <DeletePostBtn postId={p.id} postTitle={p.title} onDeleted={load} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="admin-pagination">
            <button className="page-btn" disabled={page <= 1} onClick={() => setParam("page", String(page - 1))}>‹</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pp => (
              <button key={pp} className={`page-btn${pp === page ? " active" : ""}`} onClick={() => setParam("page", String(pp))}>{pp}</button>
            ))}
            <button className="page-btn" disabled={page >= totalPages} onClick={() => setParam("page", String(page + 1))}>›</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <Suspense fallback={<div className="admin-content"><p style={{ color: "#94a3b8" }}>Đang tải...</p></div>}>
      <BlogContent />
    </Suspense>
  );
}
