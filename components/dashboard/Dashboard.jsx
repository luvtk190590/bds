"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice } from "@/lib/utils/formatters";
import LineChart from "./LineChart";
import UserPreferences from "./UserPreferences";

const STATUS_LABELS = {
  pending:  "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  sold:     "Đã bán",
};
const STATUS_COLORS = {
  pending:  { bg: "#fef9c3", color: "#854d0e" },
  approved: { bg: "#dcfce7", color: "#166534" },
  rejected: { bg: "#fee2e2", color: "#991b1b" },
  sold:     { bg: "#e0e7ff", color: "#3730a3" },
};

export default function Dashboard() {
  const { profile, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [stats, setStats] = useState({ total: 0, pending: 0, reviews: 0 });
  const [recentProps, setRecentProps] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [viewChart, setViewChart] = useState({ labels: [], data: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !profile?.id) {
      if (!authLoading) setLoading(false);
      return;
    }

    async function loadData() {
      const pid = profile.id;

      // Tin đăng: tổng + chờ duyệt + 5 gần nhất
      const [
        { count: total },
        { count: pending },
        { data: propData },
        { data: allPropIds },
      ] = await Promise.all([
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("owner_id", pid),
        supabase.from("properties").select("*", { count: "exact", head: true }).eq("owner_id", pid).eq("approval_status", "pending"),
        supabase
          .from("properties")
          .select("id, title, slug, price, approval_status, created_at, listing_type, property_images(url)")
          .eq("owner_id", pid)
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("properties").select("id").eq("owner_id", pid),
      ]);

      setStats(prev => ({ ...prev, total: total || 0, pending: pending || 0 }));
      setRecentProps(propData || []);

      // Đánh giá trên các tin đăng của user
      const ids = (allPropIds || []).map(p => p.id);
      if (ids.length > 0) {
        const [{ count: reviews }, { data: reviewData }] = await Promise.all([
          supabase
            .from("property_reviews")
            .select("*", { count: "exact", head: true })
            .in("property_id", ids)
            .eq("status", "approved"),
          supabase
            .from("property_reviews")
            .select("id, content, author_name, created_at, property_id, profiles!author_id(full_name, avatar_url)")
            .in("property_id", ids)
            .eq("status", "approved")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);
        setStats(prev => ({ ...prev, reviews: reviews || 0 }));
        setRecentReviews(reviewData || []);
      }

      // ── Views theo tháng (12 tháng gần nhất) ──
      if (ids.length > 0) {
        const now = new Date();
        const from = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString();

        const { data: viewRows } = await supabase
          .from("property_views")
          .select("viewed_at")
          .in("property_id", ids)
          .gte("viewed_at", from);

        // Gom theo tháng
        const counts = {};
        (viewRows || []).forEach(row => {
          const d = new Date(row.viewed_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          counts[key] = (counts[key] || 0) + 1;
        });

        const labels = [];
        const data = [];
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          labels.push(`T${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`);
          data.push(counts[key] || 0);
        }
        setViewChart({ labels, data });
      }

      setLoading(false);
    }

    loadData();
  }, [profile?.id, authLoading]);

  return (
    <div className="main-content">
      <div className="main-content-inner">
        <div className="button-show-hide show-mb">
          <span className="body-1">Show Dashboard</span>
        </div>

        {/* ── Counters ── */}
        <div className="flat-counter-v2 tf-counter">
          <div className="counter-box">
            <div className="box-icon">
              <span className="icon icon-listing" />
            </div>
            <div className="content-box">
              <div className="title-count text-variant-1">Tin đăng của tôi</div>
              <div className="box-count d-flex align-items-end">
                <h3 className="fw-8">{loading ? "—" : stats.total}</h3>
              </div>
            </div>
          </div>

          <div className="counter-box">
            <div className="box-icon">
              <span className="icon icon-pending" />
            </div>
            <div className="content-box">
              <div className="title-count text-variant-1">Chờ duyệt</div>
              <div className="box-count d-flex align-items-end">
                <h3 className="fw-8">{loading ? "—" : stats.pending}</h3>
              </div>
            </div>
          </div>

          <div className="counter-box">
            <div className="box-icon">
              <span className="icon icon-review" />
            </div>
            <div className="content-box">
              <div className="title-count text-variant-1">Đánh giá nhận được</div>
              <div className="d-flex align-items-end">
                <h3 className="fw-8">{loading ? "—" : stats.reviews}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="wrapper-content row">
          <div className="col-xl-9">

            {/* ── Tin đăng gần đây ── */}
            <div className="widget-box-2 wd-listing">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="title" style={{ marginBottom: 0 }}>Tin đăng gần đây</h5>
                <Link href="/my-property" className="tf-btn btn-line" style={{ fontSize: 13, padding: "6px 14px" }}>
                  Xem tất cả
                </Link>
              </div>

              {loading ? (
                <p style={{ color: "#94a3b8", padding: "20px 0" }}>Đang tải...</p>
              ) : recentProps.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center", color: "#94a3b8" }}>
                  <p>Bạn chưa có tin đăng nào.</p>
                  <Link href="/add-property" className="tf-btn primary" style={{ marginTop: 12, display: "inline-block" }}>
                    Đăng tin ngay
                  </Link>
                </div>
              ) : (
                <div className="wrap-table">
                  <div className="table-responsive">
                    <table>
                      <thead>
                        <tr>
                          <th>Tin đăng</th>
                          <th>Trạng thái</th>
                          <th>Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentProps.map(p => {
                          const img = p.property_images?.[0]?.url || "/images/home/house-1.jpg";
                          const statusStyle = STATUS_COLORS[p.approval_status] || STATUS_COLORS.pending;
                          const href = p.slug ? `/property-details/${p.slug}` : "#";
                          return (
                            <tr key={p.id} className="file-delete">
                              <td>
                                <div className="listing-box">
                                  <div className="images" style={{ width: 80, height: 56, flexShrink: 0, borderRadius: 8, overflow: "hidden", position: "relative" }}>
                                    <Image
                                      alt={p.title}
                                      src={img}
                                      fill
                                      sizes="80px"
                                      style={{ objectFit: "cover" }}
                                    />
                                  </div>
                                  <div className="content">
                                    <div className="title">
                                      <Link href={href} className="link" title={p.title}>
                                        {p.title?.length > 45 ? p.title.slice(0, 45) + "…" : p.title}
                                      </Link>
                                    </div>
                                    <div className="text-date">
                                      Đăng: {new Date(p.created_at).toLocaleDateString("vi-VN")}
                                    </div>
                                    <div className="text-btn text-primary">
                                      {formatPrice(p.price)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="status-wrap">
                                  <span
                                    style={{
                                      display: "inline-block",
                                      padding: "4px 12px",
                                      borderRadius: 99,
                                      fontSize: 12,
                                      fontWeight: 600,
                                      background: statusStyle.bg,
                                      color: statusStyle.color,
                                    }}
                                  >
                                    {STATUS_LABELS[p.approval_status] || "Chờ duyệt"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <ul className="list-action">
                                  <li>
                                    {p.approval_status === "approved" ? (
                                      <span
                                        className="item"
                                        title="Tin đã duyệt không thể chỉnh sửa"
                                        style={{ opacity: 0.35, cursor: "not-allowed", pointerEvents: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                                      >
                                        <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                                          <path d="M11.2413 2.9915L12.366 1.86616C12.6005 1.63171 12.9184 1.5 13.25 1.5C13.5816 1.5 13.8995 1.63171 14.134 1.86616C14.3685 2.10062 14.5002 2.4186 14.5002 2.75016C14.5002 3.08173 14.3685 3.39971 14.134 3.63416L4.55467 13.2135C4.20222 13.5657 3.76758 13.8246 3.29 13.9668L1.5 14.5002L2.03333 12.7102C2.17552 12.2326 2.43442 11.7979 2.78667 11.4455L11.242 2.9915H11.2413ZM11.2413 2.9915L13 4.75016" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Sửa
                                      </span>
                                    ) : (
                                      <Link href={`/add-property?edit=${p.id}`} className="item">
                                        <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                                          <path d="M11.2413 2.9915L12.366 1.86616C12.6005 1.63171 12.9184 1.5 13.25 1.5C13.5816 1.5 13.8995 1.63171 14.134 1.86616C14.3685 2.10062 14.5002 2.4186 14.5002 2.75016C14.5002 3.08173 14.3685 3.39971 14.134 3.63416L4.55467 13.2135C4.20222 13.5657 3.76758 13.8246 3.29 13.9668L1.5 14.5002L2.03333 12.7102C2.17552 12.2326 2.43442 11.7979 2.78667 11.4455L11.242 2.9915H11.2413ZM11.2413 2.9915L13 4.75016" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        Sửa
                                      </Link>
                                    )}
                                  </li>
                                </ul>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* ── Chart ── */}
            <div className="widget-box-2 wd-chart">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="title" style={{ marginBottom: 0 }}>Lượt xem tin đăng</h5>
                {!loading && (
                  <span style={{ fontSize: 13, color: "#64748b" }}>
                    Tổng: <strong>{viewChart.data.reduce((a, b) => a + b, 0)}</strong> lượt (12 tháng)
                  </span>
                )}
              </div>
              <div className="chart-box">
                {loading ? (
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>Đang tải...</p>
                ) : (
                  <LineChart data={viewChart.data} labels={viewChart.labels} />
                )}
              </div>
            </div>
          </div>

          <div className="col-xl-3">
            <UserPreferences />

            {/* ── Đánh giá gần đây ── */}
            <div className="widget-box-2 mess-box">
              <h5 className="title">Đánh giá gần đây</h5>
              {loading ? (
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Đang tải...</p>
              ) : recentReviews.length === 0 ? (
                <p style={{ color: "#94a3b8", fontSize: 13 }}>Chưa có đánh giá nào.</p>
              ) : (
                <ul className="list-mess">
                  {recentReviews.map(r => {
                    const name = r.profiles?.full_name || r.author_name || "Ẩn danh";
                    const avatar = r.profiles?.avatar_url;
                    return (
                      <li key={r.id} className="mess-item">
                        <div className="user-box">
                          <div className="avatar">
                            {avatar ? (
                              <Image alt="avt" src={avatar} width={51} height={51} style={{ borderRadius: "50%", objectFit: "cover" }} />
                            ) : (
                              <div style={{ width: 51, height: 51, borderRadius: "50%", background: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, color: "#64748b" }}>
                                {name[0]?.toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="content">
                            <div className="name fw-6">{name}</div>
                            <span className="caption-2 text-variant-3">
                              {new Date(r.created_at).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                        <p style={{ fontSize: 13, color: "#374151", marginTop: 6, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {r.content}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="footer-dashboard">
        <p>Copyright © 2024 Home Lengo</p>
      </div>
    </div>
  );
}
