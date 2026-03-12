"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";

const STATUS_MAP = {
  approved: { label: "Đã duyệt",   cls: "badge-published" },
  pending:  { label: "Chờ duyệt",  cls: "badge-pending"   },
  rejected: { label: "Từ chối",    cls: "badge-rejected"  },
};

function StarRow({ rating }) {
  if (!rating) return null;
  return (
    <ul className="list-star" style={{ display: "flex", gap: 2, listStyle: "none", padding: 0, margin: "4px 0 0" }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className={`icon ${i < rating ? "icon-star" : "icon-star1"}`}
          style={{ color: i < rating ? "#f59e0b" : "#d1d5db", fontSize: 13 }} />
      ))}
    </ul>
  );
}

export default function Reviews() {
  const supabase = createClient();
  const { profile } = useAuth();

  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState("all"); // all | pending | approved | rejected
  const [search, setSearch]     = useState("");

  useEffect(() => {
    if (!profile?.id) return;

    async function load() {
      setLoading(true);
      // Lấy danh sách property_id thuộc user này
      const { data: myProps } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", profile.id);

      if (!myProps || myProps.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }

      const propIds = myProps.map(p => p.id);

      const { data, error } = await supabase
        .from("property_reviews")
        .select(`
          id,
          content,
          rating,
          status,
          created_at,
          author_name,
          property_id,
          properties (
            id, title, slug,
            images:property_images(url, is_primary)
          ),
          author:profiles!author_id (
            id, full_name, avatar_url
          )
        `)
        .in("property_id", propIds)
        .order("created_at", { ascending: false });

      if (!error) setReviews(data || []);
      setLoading(false);
    }
    load();
  }, [profile?.id]);

  // Filter
  const filtered = reviews.filter(r => {
    if (tab !== "all" && r.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.content?.toLowerCase().includes(q) ||
        r.properties?.title?.toLowerCase().includes(q) ||
        (r.author?.full_name || r.author_name || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all:      reviews.length,
    pending:  reviews.filter(r => r.status === "pending").length,
    approved: reviews.filter(r => r.status === "approved").length,
    rejected: reviews.filter(r => r.status === "rejected").length,
  };

  const TABS = [
    { key: "all",      label: "Tất cả" },
    { key: "pending",  label: "Chờ duyệt" },
    { key: "approved", label: "Đã duyệt" },
    { key: "rejected", label: "Từ chối" },
  ];

  return (
    <div className="main-content">
      <div className="main-content-inner">
        <div className="button-show-hide show-mb">
          <span className="body-1">Show Dashboard</span>
        </div>

        <div className="widget-box-2">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h5 className="title mb-0">Đánh giá tin đăng của tôi</h5>
            {/* Search */}
            <div style={{ position: "relative", minWidth: 220 }}>
              <i className="icon icon-search" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 14 }} />
              <input
                type="text"
                placeholder="Tìm theo nội dung, tin đăng..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32, paddingRight: 12, height: 36, border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 13, width: "100%" }}
              />
            </div>
          </div>

          {/* Stats cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: "12px",
                  border: `1px solid ${tab === t.key ? "#6366f1" : "#e2e8f0"}`,
                  borderRadius: 10,
                  background: tab === t.key ? "#eff6ff" : "#fff",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 700, color: tab === t.key ? "#6366f1" : "#0f172a" }}>
                  {counts[t.key]}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{t.label}</div>
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>Đang tải đánh giá...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <i className="icon icon-star1" style={{ fontSize: 32, color: "#e2e8f0" }} />
              <p style={{ color: "#94a3b8", marginTop: 8, fontSize: 14 }}>
                {tab === "all" ? "Tin đăng của bạn chưa có đánh giá nào" : `Không có đánh giá nào ở trạng thái "${STATUS_MAP[tab]?.label}"`}
              </p>
            </div>
          ) : (
            <ul className="list-mess" style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {filtered.map(review => {
                const propertyThumb = review.properties?.images?.find(img => img.is_primary)?.url
                  || review.properties?.images?.[0]?.url;
                const authorName   = review.author?.full_name || review.author_name || "Người dùng";
                const authorAvatar = review.author?.avatar_url;
                const status       = STATUS_MAP[review.status] || STATUS_MAP.pending;

                return (
                  <li key={review.id} className="mess-item" style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 16, marginBottom: 16 }}>
                    {/* Property info */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: "8px 12px", background: "#f8fafc", borderRadius: 8 }}>
                      {propertyThumb && (
                        <img src={propertyThumb} alt="" style={{ width: 48, height: 36, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {review.properties?.title || "Tin đăng"}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>Tin đăng</div>
                      </div>
                      <span className={`tf-badge ${status.cls}`} style={{
                        fontSize: 11, padding: "2px 8px", borderRadius: 20, fontWeight: 600,
                        background: review.status === "approved" ? "#dcfce7" : review.status === "pending" ? "#fef9c3" : "#fee2e2",
                        color:      review.status === "approved" ? "#166534" : review.status === "pending" ? "#854d0e"  : "#991b1b",
                        flexShrink: 0,
                      }}>
                        {status.label}
                      </span>
                    </div>

                    {/* Author + review */}
                    <div className="user-box" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div className="avatar" style={{ flexShrink: 0 }}>
                        {authorAvatar ? (
                          <Image alt={authorName} src={authorAvatar} width={44} height={44} style={{ borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#6366f1" }}>
                            {authorName[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span className="name fw-6" style={{ fontSize: 14 }}>{authorName}</span>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>
                            {new Date(review.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </span>
                        </div>
                        {review.rating && <StarRow rating={review.rating} />}
                        <p style={{ marginTop: 6, fontSize: 14, color: "#374151", lineHeight: 1.6 }}>{review.content}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="footer-dashboard footer-dashboard-2">
        <p>Copyright © {new Date().getFullYear()} Home Lengo</p>
      </div>
    </div>
  );
}
