"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRecommendations } from "@/lib/hooks/useRecommendations";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFavorites } from "@/lib/hooks/useRecommendations";
import { formatPriceWithUnit, formatArea } from "@/lib/utils/formatters";

export default function RecommendedSection({ limit = 8, showTitle = true }) {
    const { profile } = useAuth();
    const { recommendations, isLoading } = useRecommendations(profile?.id, limit);
    const { toggleFavorite, isFavorited } = useFavorites(profile?.id);

    if (!profile) return null;
    if (isLoading) {
        return (
            <section className="flat-section pt-0">
                <div className="container">
                    {showTitle && (
                        <div className="flat-title">
                            <h4>Gợi ý cho bạn</h4>
                        </div>
                    )}
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary" />
                    </div>
                </div>
            </section>
        );
    }

    if (recommendations.length === 0) return null;

    return (
        <section className="flat-section pt-0">
            <div className="container">
                {showTitle && (
                    <div className="flat-title d-flex justify-content-between align-items-center">
                        <div>
                            <h4>✨ Gợi ý cho bạn</h4>
                            <p className="text-muted small">
                                Dựa trên {recommendations[0]?.match_reasons?.length > 0 ? "sở thích của bạn" : "BĐS mới nhất"}
                            </p>
                        </div>
                        <Link href="/properties-map" className="btn btn-outline-primary btn-sm">
                            Xem tất cả →
                        </Link>
                    </div>
                )}

                <div className="row g-3">
                    {recommendations.map((property) => (
                        <div key={property.id} className="col-lg-3 col-md-4 col-sm-6">
                            <RecommendedCard
                                property={property}
                                onFavorite={() => toggleFavorite(property.id)}
                                isFav={isFavorited(property.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function RecommendedCard({ property, onFavorite, isFav }) {
    const imageUrl = property.image_url || "/images/home/house-1.jpg";
    const slug = property.slug || property.id;
    const scorePercent = Math.min(Math.round((property.score / 10) * 100), 100);

    return (
        <div
            className="homeya-box"
            style={{
                border: scorePercent > 70 ? "2px solid #e74c3c22" : "1px solid #eee",
                transition: "transform 0.2s, box-shadow 0.2s",
            }}
        >
            <div className="archive-top">
                <Link href={`/property-details/${slug}`}>
                    <div
                        style={{
                            position: "relative",
                            height: "180px",
                            overflow: "hidden",
                            borderRadius: "12px 12px 0 0",
                        }}
                    >
                        <Image
                            src={imageUrl}
                            alt={property.title || "BĐS"}
                            fill
                            style={{ objectFit: "cover" }}
                        />
                        {/* Score badge */}
                        {property.score > 0 && (
                            <div
                                style={{
                                    position: "absolute",
                                    top: 8,
                                    left: 8,
                                    background:
                                        scorePercent > 70
                                            ? "linear-gradient(135deg, #e74c3c, #c0392b)"
                                            : scorePercent > 40
                                                ? "linear-gradient(135deg, #f39c12, #e67e22)"
                                                : "linear-gradient(135deg, #3498db, #2980b9)",
                                    color: "#fff",
                                    padding: "3px 10px",
                                    borderRadius: "12px",
                                    fontSize: "11px",
                                    fontWeight: "bold",
                                }}
                            >
                                {scorePercent}% phù hợp
                            </div>
                        )}
                        {/* Favorite btn */}
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onFavorite();
                            }}
                            style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                background: "rgba(255,255,255,0.9)",
                                border: "none",
                                borderRadius: "50%",
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "16px",
                                color: isFav ? "#e74c3c" : "#999",
                                cursor: "pointer",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                            }}
                        >
                            {isFav ? "♥" : "♡"}
                        </button>
                    </div>
                </Link>

                <div className="content p-3">
                    <h6
                        className="mb-1"
                        style={{
                            fontSize: "14px",
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            height: '40px',
                            lineHeight: '20px',
                            wordBreak: 'break-word'
                        }}
                    >
                        <Link href={`/property-details/${slug}`}>{property.title}</Link>
                    </h6>
                    <p
                        className="text-muted mb-2"
                        style={{
                            fontSize: "12px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <i className="icon-mapPin me-1" />
                        {property.address || "Chưa cập nhật"}
                    </p>

                    {/* Match reasons */}
                    {property.match_reasons && property.match_reasons.length > 0 && (
                        <div className="d-flex flex-wrap gap-1 mb-2">
                            {property.match_reasons.slice(0, 2).map((reason, idx) => (
                                <span
                                    key={idx}
                                    style={{
                                        background: "#f0fdf4",
                                        color: "#16a34a",
                                        fontSize: "10px",
                                        padding: "2px 6px",
                                        borderRadius: "8px",
                                        border: "1px solid #dcfce7",
                                    }}
                                >
                                    ✓ {reason}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Quick stats */}
                    <div className="d-flex gap-2 mb-2" style={{ fontSize: "12px" }}>
                        {property.bedrooms > 0 && (
                            <span className="text-muted">
                                <i className="icon-bed me-1" />
                                {property.bedrooms} PN
                            </span>
                        )}
                        {property.area && (
                            <span className="text-muted">{formatArea(property.area)}</span>
                        )}
                    </div>

                    {/* Owner Info */}
                    <div className="d-flex align-items-center gap-2 pt-2 border-top">
                        <div
                            className="avatar round overflow-hidden"
                            style={{ width: '24px', height: '24px', position: 'relative' }}
                        >
                            <img
                                src={property.owner_avatar || "/images/avatar/avt-1.jpg"}
                                alt="avt"
                                onError={(e) => { e.currentTarget.src = "/images/avatar/avt-1.jpg" }}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                        <span className="text-muted" style={{ fontSize: '11px' }}>
                            {property.owner_name || "Chủ nhà"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="archive-bottom d-flex justify-content-between align-items-center px-3 pb-3">
                {property.listing_type && (
                    <span
                        className="badge"
                        style={{
                            background:
                                property.listing_type === "sale" ? "#fee2e2" : "#dcfce7",
                            color:
                                property.listing_type === "sale" ? "#dc2626" : "#16a34a",
                            fontSize: "10px",
                        }}
                    >
                        {property.listing_type === "sale" ? "Bán" : "Cho thuê"}
                    </span>
                )}
                <strong style={{ color: "#e74c3c", fontSize: "14px" }}>
                    {formatPriceWithUnit(property.price, property.listing_type)}
                </strong>
            </div>
        </div >
    );
}
