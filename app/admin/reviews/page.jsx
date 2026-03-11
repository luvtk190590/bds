"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const PAGE_SIZE = 20;

const STATUS_LABEL = { pending: "Chờ duyệt", approved: "Đã duyệt", rejected: "Từ chối" };
const STATUS_BADGE = { pending: "badge-pending", approved: "badge-published", rejected: "badge-rejected" };

function ReviewsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const tab = searchParams.get("tab") || "pending";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  function setParam(key, val) {
    const p = new URLSearchParams(searchParams.toString());
    if (val) p.set(key, val); else p.delete(key);
    p.delete("page");
    router.push(`/admin/reviews?${p.toString()}`);
  }

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("property_reviews")
      .select(`
        id, content, author_name, status, created_at, rejection_note,
        profiles!property_reviews_author_id_fkey(full_name),
        properties!property_reviews_property_id_fkey(title, slug)
      `, { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    if (tab !== "all") query = query.eq("status", tab);

    const { data, count, error } = await query;
    if (error && error.name === "AbortError") { setTimeout(load, 300); return; }
    if (error) toast.error("Lỗi tải dữ liệu: " + error.message);

    setReviews(data || []);
    setTotal(count || 0);
    setLoading(false);
  }, [tab, page]);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id, status, note = null) {
    setActionLoading(id + status);
    const update = { status, approved_at: status === "approved" ? new Date().toISOString() : null };
    if (note) update.rejection_note = note;

    const { error } = await supabase.from("property_reviews").update(update).eq("id", id);
    if (error) {
      toast.error("Lỗi: " + error.message);
    } else {
      toast.success(status === "approved" ? "Đã duyệt đánh giá." : "Đã từ chối đánh giá.");
      load();
    }
    setActionLoading(null);
  }

  async function handleReject(id) {
    const note = prompt("Lý do từ chối (tuỳ chọn):");
    if (note === null) return; // bấm Cancel
    await updateStatus(id, "rejected", note || null);
  }

  async function handleDelete(id) {
    if (!confirm("Xóa đánh giá này? Không thể hoàn tác.")) return;
    setActionLoading(id + "delete");
    const { error } = await supabase.from("property_reviews").delete().eq("id", id);
    if (error) toast.error("Lỗi: " + error.message);
    else { toast.success("Đã xóa."); load(); }
    setActionLoading(null);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const TABS = [
    { v: "pending", l: "Chờ duyệt" },
    { v: "approved", l: "Đã duyệt" },
    { v: "rejected", l: "Đã từ chối" },
    { v: "all", l: "Tất cả" },
  ];

  return (
    <div className="admin-content">
      <div className="admin-page-header">
        <div>
          <h4>Quản lý đánh giá</h4>
          <p>Duyệt, từ chối và quản lý đánh giá của người dùng</p>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div className="admin-toolbar" style={{ marginBottom: 0 }}>
            <div className="admin-tab-pills">
              {TABS.map(t => (
                <button
                  key={t.v}
                  className={`tab-pill${tab === t.v ? " active" : ""}`}
                  onClick={() => setParam("tab", t.v === "all" ? "" : t.v)}
                >
                  {t.l}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 13, color: "#64748b" }}>
              {total} đánh giá
            </span>
          </div>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tác giả</th>
                <th>Tin đăng</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
                <th>Ngày gửi</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Đang tải...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: "center", padding: 32, color: "#94a3b8" }}>Không có đánh giá nào</td></tr>
              ) : reviews.map(r => {
                const authorName = r.profiles?.full_name || r.author_name || "Ẩn danh";
                const propTitle = r.properties?.title || "—";
                const propSlug = r.properties?.slug;
                const busy = actionLoading?.startsWith(r.id);

                return (
                  <tr key={r.id}>
                    <td style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{authorName}</td>
                    <td style={{ fontSize: 13, maxWidth: 180 }}>
                      {propSlug ? (
                        <a href={`/property-details/${propSlug}`} target="_blank" rel="noopener noreferrer"
                          style={{ color: "#1563df", textDecoration: "none" }}
                          title={propTitle}>
                          {propTitle.length > 40 ? propTitle.slice(0, 40) + "…" : propTitle}
                        </a>
                      ) : (
                        <span>{propTitle.length > 40 ? propTitle.slice(0, 40) + "…" : propTitle}</span>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: "#374151", maxWidth: 320 }}>
                      <div style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {r.content}
                      </div>
                      {r.rejection_note && (
                        <div style={{ marginTop: 4, fontSize: 12, color: "#ef4444" }}>
                          Lý do: {r.rejection_note}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`admin-badge ${STATUS_BADGE[r.status] || "badge-draft"}`}>
                        {STATUS_LABEL[r.status] || r.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: "#64748b", whiteSpace: "nowrap" }}>
                      {new Date(r.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
                        {r.status !== "approved" && (
                          <button
                            className="admin-btn btn-success btn-sm"
                            onClick={() => updateStatus(r.id, "approved")}
                            disabled={busy}
                          >
                            Duyệt
                          </button>
                        )}
                        {r.status !== "rejected" && (
                          <button
                            className="admin-btn btn-outline btn-sm"
                            onClick={() => handleReject(r.id)}
                            disabled={busy}
                          >
                            Từ chối
                          </button>
                        )}
                        <button
                          className="admin-btn btn-danger btn-sm"
                          onClick={() => handleDelete(r.id)}
                          disabled={busy}
                        >
                          <i className="icon icon-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
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

export default function ReviewsPage() {
  return (
    <Suspense fallback={<div className="admin-content"><p style={{ color: "#94a3b8" }}>Đang tải...</p></div>}>
      <ReviewsContent />
    </Suspense>
  );
}
