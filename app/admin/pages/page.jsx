"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import toast from "react-hot-toast";

const PAGE_SIZE = 20;

function PagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pages, setPages] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
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
    router.push(`/admin/pages?${p.toString()}`);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setChecked(new Set());
    let query = supabase
      .from("site_pages")
      .select("id, title, slug, status, template, sort_order, updated_at", { count: "exact" })
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (tab !== "all") query = query.eq("status", tab);
    if (q) query = query.ilike("title", `%${q}%`);

    const { data, count, error } = await query;
    if (error) toast.error(error.message);
    setPages(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [tab, page, q]);

  useEffect(() => { load(); }, [load]);

  const allIds = pages.map(p => p.id);
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

  async function bulkSetStatus(status) {
    setBulkLoading(true);
    const { error } = await supabase.from("site_pages").update({ status }).in("id", [...checked]);
    if (error) toast.error(error.message);
    else { toast.success(`Đã cập nhật ${checked.size} trang`); load(); }
    setBulkLoading(false);
  }

  async function bulkDelete() {
    if (!confirm(`Xóa ${checked.size} trang? Không thể hoàn tác.`)) return;
    setBulkLoading(true);
    const { error } = await supabase.from("site_pages").delete().in("id", [...checked]);
    if (error) toast.error(error.message);
    else { toast.success(`Đã xóa ${checked.size} trang`); load(); }
    setBulkLoading(false);
  }

  async function deletePage(id, title) {
    if (!confirm(`Xóa trang "${title}"?`)) return;
    const { error } = await supabase.from("site_pages").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Đã xóa trang"); load(); }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const TABS = [
    { v: "all",       l: "Tất cả" },
    { v: "published", l: "Đã xuất bản" },
    { v: "draft",     l: "Nháp" },
  ];

  const TEMPLATES = {
    "default":    "Mặc định",
    "full-width": "Full width",
    "sidebar":    "Có sidebar",
    "blank":      "Blank",
  };

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h4>Quản lý trang</h4>
          <p>Tạo và chỉnh sửa các trang tĩnh của website</p>
        </div>
        <Link href="/admin/pages/new" className="admin-btn btn-primary">
          <i className="icon icon-plus" /> Trang mới
        </Link>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-toolbar" style={{ marginBottom: 0 }}>
            <div className="admin-tab-pills">
              {TABS.map(t => (
                <button key={t.v} className={`tab-pill${tab === t.v ? " active" : ""}`}
                  onClick={() => setParam("tab", t.v === "all" ? "" : t.v)}>{t.l}
                </button>
              ))}
            </div>
            <div className="admin-search">
              <i className="icon icon-search search-icon" />
              <input type="text" placeholder="Tìm trang..." defaultValue={q}
                onKeyDown={e => { if (e.key === "Enter") setParam("q", e.target.value); }} />
            </div>
          </div>
        </div>

        {checked.size > 0 && (
          <div className="bulk-action-bar">
            <span><span className="bulk-count">{checked.size}</span> trang đã chọn</span>
            <div className="bulk-sep" />
            <button className="admin-btn btn-success btn-sm" onClick={() => bulkSetStatus("published")} disabled={bulkLoading}>
              Xuất bản tất cả
            </button>
            <button className="admin-btn btn-outline btn-sm" onClick={() => bulkSetStatus("draft")} disabled={bulkLoading}>
              Về nháp
            </button>
            <div className="bulk-sep" />
            <button className="admin-btn btn-danger btn-sm" onClick={bulkDelete} disabled={bulkLoading}>
              <i className="icon icon-trash" /> Xóa {checked.size} trang
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
                <th>Slug / URL</th>
                <th>Template</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Đang tải...</td></tr>
              ) : pages.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Không có trang nào</td></tr>
              ) : pages.map(pg => (
                <tr key={pg.id} style={{ background: checked.has(pg.id) ? "#eff6ff" : undefined }}>
                  <td className="td-check">
                    <input type="checkbox" className="admin-checkbox" checked={checked.has(pg.id)} onChange={() => toggleOne(pg.id)} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>
                      {pg.title?.length > 55 ? pg.title.slice(0, 55) + "…" : pg.title}
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: 12, color: "#6366f1" }}>/p/{pg.slug}</code>
                  </td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>
                    {TEMPLATES[pg.template] || pg.template}
                  </td>
                  <td>
                    <span className={`admin-badge badge-${pg.status === "published" ? "published" : "draft"}`}>
                      {pg.status === "published" ? "Đã xuất bản" : "Nháp"}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: "#64748b" }}>
                    {pg.updated_at ? new Date(pg.updated_at).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link href={`/admin/pages/${pg.id}/edit`} className="admin-btn btn-outline btn-sm">Sửa</Link>
                      {pg.status === "published" && (
                        <a href={`/p/${pg.slug}`} target="_blank" rel="noopener noreferrer" className="admin-btn btn-ghost btn-sm">Xem ↗</a>
                      )}
                      <button className="admin-btn btn-danger btn-sm" onClick={() => deletePage(pg.id, pg.title)}>Xóa</button>
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

export default function PagesPage() {
  return (
    <Suspense fallback={<div className="admin-content"><p style={{ color: "#94a3b8" }}>Đang tải...</p></div>}>
      <PagesContent />
    </Suspense>
  );
}
