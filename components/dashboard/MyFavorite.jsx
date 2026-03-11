"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFavorites } from "@/lib/hooks/useRecommendations";
import { formatPriceWithUnit } from "@/lib/utils/formatters";

export default function MyFavorite() {
  const { profile, loading: authLoading } = useAuth();
  const { favorites, isLoading, toggleFavorite } = useFavorites(profile?.id);

  return (
    <div className="main-content">
      <div className="main-content-inner">
        <div className="button-show-hide show-mb">
          <span className="body-1">Show Dashboard</span>
        </div>

        <div className="widget-box-2 wd-listing">
          <h5 className="title">Tin đăng yêu thích</h5>

          {authLoading || isLoading ? (
            <p style={{ color: "#94a3b8", padding: "20px 0" }}>Đang tải...</p>
          ) : !profile ? (
            <p style={{ color: "#94a3b8", padding: "20px 0" }}>
              Vui lòng <Link href="/?login=1">đăng nhập</Link> để xem danh sách yêu thích.
            </p>
          ) : favorites.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#94a3b8" }}>
              <p>Bạn chưa có tin đăng yêu thích nào.</p>
              <Link href="/properties" className="tf-btn primary" style={{ marginTop: 12, display: "inline-block" }}>
                Khám phá ngay
              </Link>
            </div>
          ) : (
            <div className="wrap-table">
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Tin đăng</th>
                      <th>Loại</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {favorites.map(fav => {
                      const p = fav.property;
                      if (!p) return null;
                      const img =
                        p.images?.find(i => i.is_primary)?.url ||
                        p.images?.[0]?.url ||
                        "/images/home/house-1.jpg";
                      const href = p.slug ? `/property-details/${p.slug}` : "#";
                      return (
                        <tr key={fav.id} className="file-delete">
                          <td>
                            <div className="listing-box">
                              <div
                                className="images"
                                style={{ width: 80, height: 56, flexShrink: 0, borderRadius: 8, overflow: "hidden", position: "relative" }}
                              >
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
                                    {p.title?.length > 50 ? p.title.slice(0, 50) + "…" : p.title}
                                  </Link>
                                </div>
                                <div className="text-date">
                                  {p.address || "Chưa cập nhật địa chỉ"}
                                </div>
                                <div className="text-btn text-primary">
                                  {formatPriceWithUnit(p.price, p.listing_type)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{
                              display: "inline-block", padding: "4px 10px", borderRadius: 99,
                              fontSize: 12, fontWeight: 600,
                              background: p.listing_type === "sale" ? "#fee2e2" : "#dcfce7",
                              color: p.listing_type === "sale" ? "#991b1b" : "#166534",
                            }}>
                              {p.listing_type === "sale" ? "Bán" : "Cho thuê"}
                            </span>
                          </td>
                          <td>
                            <ul className="list-action">
                              <li>
                                <Link href={href} className="item" title="Xem chi tiết">
                                  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                                    <path d="M1 8C1 8 3.5 3 8 3C12.5 3 15 8 15 8C15 8 12.5 13 8 13C3.5 13 1 8 1 8Z" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z" stroke="#A3ABB0" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                  Xem
                                </Link>
                              </li>
                              <li>
                                <button
                                  className="item remove-file"
                                  onClick={() => toggleFavorite(p.id)}
                                  title="Hủy yêu thích"
                                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", gap: 4 }}
                                >
                                  <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
                                    <path
                                      d="M13.5 5.5C13.5 4.09 12.41 3 11 3C10.04 3 9.21 3.54 8.77 4.33L8 5.68L7.23 4.33C6.79 3.54 5.96 3 5 3C3.59 3 2.5 4.09 2.5 5.5C2.5 6.54 3.02 7.45 3.82 8L8 12.5L12.18 8C12.98 7.45 13.5 6.54 13.5 5.5Z"
                                      stroke="#ef4444" fill="#fee2e2" strokeLinecap="round" strokeLinejoin="round"
                                    />
                                  </svg>
                                  Bỏ yêu thích
                                </button>
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
      </div>

      <div className="footer-dashboard">
        <p>Copyright © 2024 Home Lengo</p>
      </div>
    </div>
  );
}
