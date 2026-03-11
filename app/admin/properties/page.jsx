"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import PropertyApprovalActions from "@/components/admin/properties/PropertyApprovalActions";
import { formatPrice } from "@/lib/utils/formatters";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);   // single item for approval panel
  const [checked, setChecked] = useState(new Set()); // multi-select ids
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState(null);
  const supabase = createClient();

  const tab = searchParams.get("tab") || "pending";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const q = searchParams.get("q") || "";

  function setParam(key, val) {
    const p = new URLSearchParams(searchParams.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/properties?${p.toString()}`);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setChecked(new Set());
    let query = supabase
      .from("properties")
      .select(`
        id, title, price, area, listing_type, approval_status, approval_note, created_at, slug,
        property_images ( url, is_primary, sort_order ),
        profiles:owner_id ( full_name, email )
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (tab !== "all") query = query.eq("approval_status", tab);
    if (q) query = query.ilike("title", `%${q}%`);

    const { data, count, error: qErr } = await query;
    if (qErr && qErr.name === "AbortError") {
      setTimeout(() => load(), 300);
      return;
    }
    if (qErr) setError(qErr.message);
    setProperties(data || []);
    setTotal(count || 0);
    setSelected(null);
    setLoading(false);
  }, [tab, page, q]);

  useEffect(() => { load(); }, [load]);

  // Checkbox helpers
  const allIds = properties.map(p => p.id);
  const allChecked = allIds.length > 0 && allIds.every(id => checked.has(id));
  const someChecked = checked.size > 0;

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
  async function bulkApprove() {
    setBulkLoading(true);
    const { error } = await supabase
      .from("properties")
      .update({ approval_status: "approved", approved_at: new Date().toISOString() })
      .in("id", [...checked]);
    if (error) toast.error("Lỗi: " + error.message);
    else { toast.success(`Đã duyệt ${checked.size} tin đăng`); load(); }
    setBulkLoading(false);
  }

  async function bulkReject() {
    setBulkLoading(true);
    const { error } = await supabase
      .from("properties")
      .update({ approval_status: "rejected", approved_at: new Date().toISOString() })
      .in("id", [...checked]);
    if (error) toast.error("Lỗi: " + error.message);
    else { toast.success(`Đã từ chối ${checked.size} tin đăng`); load(); }
    setBulkLoading(false);
  }

  async function bulkDelete() {
    if (!confirm(`Xóa ${checked.size} tin đăng? Không thể hoàn tác.`)) return;
    setBulkLoading(true);
    const { error } = await supabase.from("properties").delete().in("id", [...checked]);
    if (error) toast.error("Lỗi: " + error.message);
    else { toast.success(`Đã xóa ${checked.size} tin đăng`); load(); }
    setBulkLoading(false);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const TABS = [
    { v: "pending", l: "Chờ duyệt" },
    { v: "approved", l: "Đã duyệt" },
    { v: "rejected", l: "Từ chối" },
    { v: "all", l: "Tất cả" },
  ];

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h4>Quản lý tin đăng</h4>
          <p>Xét duyệt tin đăng bất động sản</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px 16px", borderRadius: 10, marginBottom: 16, fontSize: 14 }}>
          <strong>Lỗi truy vấn:</strong> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 380px" : "1fr", gap: 20, alignItems: "start" }}>
        <div className="admin-card">
          {/* Toolbar */}
          <div className="admin-card-header">
            <div className="admin-toolbar" style={{ marginBottom: 0 }}>
              <div className="admin-tab-pills">
                {TABS.map(t => (
                  <button key={t.v} className={`tab-pill${tab === t.v ? " active" : ""}`} onClick={() => setParam("tab", t.v)}>{t.l}</button>
                ))}
              </div>
              <div className="admin-search">
                <i className="icon icon-search search-icon" />
                <input type="text" placeholder="Tìm theo tiêu đề..." defaultValue={q}
                  onKeyDown={e => { if (e.key === "Enter") setParam("q", e.target.value); }} />
              </div>
            </div>
          </div>

          {/* Bulk action bar */}
          {someChecked && (
            <div className="bulk-action-bar">
              <span><span className="bulk-count">{checked.size}</span> tin đã chọn</span>
              <div className="bulk-sep" />
              <button className="admin-btn btn-success btn-sm" onClick={bulkApprove} disabled={bulkLoading}>
                <i className="icon icon-check-circle" /> Duyệt tất cả
              </button>
              <button className="admin-btn btn-outline btn-sm" onClick={bulkReject} disabled={bulkLoading}>
                <i className="icon icon-close" /> Từ chối tất cả
              </button>
              <div className="bulk-sep" />
              <button className="admin-btn btn-danger btn-sm" onClick={bulkDelete} disabled={bulkLoading}>
                <i className="icon icon-trash" /> Xóa {checked.size} tin
              </button>
              <button className="admin-btn btn-ghost btn-sm" onClick={() => setChecked(new Set())}>Bỏ chọn</button>
            </div>
          )}

          {/* List */}
          {loading ? (
            <div style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>Đang tải...</div>
          ) : properties.length === 0 ? (
            <div className="admin-empty-state">
              <div className="empty-icon"><i className="icon icon-home-location" /></div>
              <div className="empty-title">Không có tin đăng nào</div>
            </div>
          ) : (
            <>
              {/* Select-all row */}
              <div style={{ padding: "8px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, background: "#fafafa" }}>
                <input type="checkbox" className="admin-checkbox" checked={allChecked} onChange={toggleAll} />
                <span style={{ fontSize: 13, color: "#64748b" }}>Chọn tất cả trang này ({properties.length})</span>
              </div>

              {properties.map(p => {
                const imgs = p.property_images?.sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order);
                const img = imgs?.[0]?.url || "/images/home/house-1.jpg";
                const isApprovalOpen = selected?.id === p.id;
                const isChecked = checked.has(p.id);
                return (
                  <div key={p.id} className={`admin-prop-card${isChecked ? " is-checked" : ""}`} style={{ background: isApprovalOpen && !isChecked ? "#f0f7ff" : undefined }}>
                    <input type="checkbox" className="admin-checkbox prop-check" checked={isChecked} onChange={() => toggleOne(p.id)} />
                    <Image src={img} alt={p.title} width={120} height={80} className="prop-img" style={{ objectFit: "cover" }} />
                    <div className="prop-info">
                      <div className="prop-title">{p.title}</div>
                      <div className="prop-meta">
                        {formatPrice(p.price)} · {p.area}m² ·
                        <span style={{ marginLeft: 4 }}>{p.listing_type === "rent" ? "Cho thuê" : "Bán"}</span>
                        {p.profiles && <span style={{ marginLeft: 4 }}>· {p.profiles.full_name || p.profiles.email}</span>}
                      </div>
                      <div className="prop-actions">
                        <span className={`admin-badge badge-${p.approval_status || "pending"}`}>{{ pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối" }[p.approval_status] || "Chờ duyệt"}</span>
                        <button className="admin-btn btn-outline btn-sm" onClick={() => setSelected(isApprovalOpen ? null : p)}>
                          {isApprovalOpen ? "Đóng" : "Xét duyệt"}
                        </button>
                        <button className="admin-btn btn-ghost btn-sm" onClick={() => router.push(`/admin/properties/${p.id}`)}>
                          <i className="icon icon-edit" /> Xem/Sửa
                        </button>
                        {p.slug && p.approval_status === "approved" && (
                          <a href={`/property-details/${p.slug}`} target="_blank" rel="noopener noreferrer" className="admin-btn btn-ghost btn-sm">Xem trang</a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}

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

        {selected && (
          <PropertyApprovalActions property={selected} onDone={() => { setSelected(null); load(); }} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="admin-content"><p style={{ color: "#94a3b8" }}>Đang tải...</p></div>}>
      <PropertiesContent />
    </Suspense>
  );
}
