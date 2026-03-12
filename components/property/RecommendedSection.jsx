"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useRecommendations, useFavorites } from "@/lib/hooks/useRecommendations";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPriceWithUnit, formatArea } from "@/lib/utils/formatters";

export default function RecommendedSection({ limit = 6, showTitle = true }) {
    const { profile } = useAuth();
    const { recommendations, isLoading } = useRecommendations(profile?.id, limit);
    const { toggleFavorite, isFavorited } = useFavorites(profile?.id);

    if (!profile) return null;
    if (isLoading) return (
        <section className="flat-section">
            <div className="container">
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status" />
                </div>
            </div>
        </section>
    );
    if (recommendations.length === 0) return null;

    const renderCard = (property) => {
        const slug = property.slug || property.id;
        const imageUrl = property.image_url || "/images/home/house-1.jpg";
        const scorePercent = property.score > 0 ? Math.min(Math.round((property.score / 10) * 100), 100) : null;

        return (
            <div className="homelengo-box">
                <div className="archive-top">
                    <Link href={`/property-details/${slug}`} className="images-group">
                        <div className="images-style" style={{ position: "relative", overflow: "hidden" }}>
                            <Image
                                className="lazyload"
                                alt={property.title || "BĐS"}
                                src={imageUrl}
                                width={615}
                                height={405}
                                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                            />
                        </div>
                        <div className="top">
                            <ul className="d-flex gap-6">
                                {scorePercent !== null && (
                                    <li className="flag-tag primary">{scorePercent}% phù hợp</li>
                                )}
                                <li className={`flag-tag ${property.listing_type === "sale" ? "style-1" : "style-2"}`}>
                                    {property.listing_type === "sale" ? "Bán" : "Thuê"}
                                </li>
                            </ul>
                        </div>
                        <div className="bottom">
                            <i className="icon icon-mapPin text-white me-1" />
                            {property.address || "Chưa cập nhật"}
                        </div>
                    </Link>
                    {/* Nút yêu thích */}
                    <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(property.id); }}
                        style={{
                            position: "absolute", top: 10, right: 10,
                            background: "rgba(255,255,255,0.9)", border: "none",
                            borderRadius: "50%", width: 32, height: 32,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 16, cursor: "pointer", zIndex: 2,
                            color: isFavorited(property.id) ? "#e74c3c" : "#999",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                        }}
                    >
                        {isFavorited(property.id) ? "♥" : "♡"}
                    </button>
                </div>

                <div className="archive-bottom">
                    <div className="content-top">
                        <h6 className="text-capitalize" style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            height: "44px",
                            lineHeight: "22px",
                            marginBottom: "10px",
                            wordBreak: "break-word",
                        }}>
                            <Link href={`/property-details/${slug}`} className="link">
                                {property.title}
                            </Link>
                        </h6>

                        {/* Match reasons */}
                        {property.match_reasons && property.match_reasons.length > 0 && (
                            <div className="d-flex flex-wrap gap-1 mb-2">
                                {property.match_reasons.slice(0, 2).map((reason, idx) => (
                                    <span key={idx} style={{
                                        background: "#f0fdf4", color: "#16a34a",
                                        fontSize: "10px", padding: "2px 6px",
                                        borderRadius: "8px", border: "1px solid #dcfce7",
                                    }}>
                                        ✓ {reason}
                                    </span>
                                ))}
                            </div>
                        )}

                        <ul className="meta-list">
                            {property.bedrooms > 0 && (
                                <li className="item">
                                    <i className="icon icon-bed" />
                                    <span className="text-variant-1">P.Ngủ:</span>
                                    <span className="fw-6">{property.bedrooms}</span>
                                </li>
                            )}
                            {property.bathrooms > 0 && (
                                <li className="item">
                                    <i className="icon icon-bath" />
                                    <span className="text-variant-1">P.Tắm:</span>
                                    <span className="fw-6">{property.bathrooms}</span>
                                </li>
                            )}
                            {property.area && (
                                <li className="item">
                                    <i className="icon icon-sqft" />
                                    <span className="text-variant-1">DT:</span>
                                    <span className="fw-6">{property.area} m²</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="content-bottom">
                        <h6 className="price">
                            {formatPriceWithUnit(property.price, property.listing_type)}
                        </h6>
                        <div className="d-flex gap-8 align-items-center">
                            <div className="avatar avt-40 round" style={{ position: "relative", overflow: "hidden" }}>
                                <img
                                    alt="avt"
                                    src={property.owner_avatar || "/images/avatar/avt-1.jpg"}
                                    onError={(e) => { e.currentTarget.src = "/images/avatar/avt-1.jpg"; }}
                                    style={{ width: "40px", height: "40px", objectFit: "cover" }}
                                />
                            </div>
                            <span>{property.owner_name || "Chủ nhà"}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="flat-section" style={{ paddingBottom: 20 }}>
            <div className="container">
                {showTitle && (
                    <div className="box-title">
                        <div className="text-center wow fadeInUp">
                            <div className="text-subtitle text-primary">Dành riêng cho bạn</div>
                            <h3 className="title mt-4">Gợi ý phù hợp</h3>
                        </div>
                    </div>
                )}

                <div className="swiper tf-sw-mobile non-swiper-on-767">
                    <div className="tf-layout-mobile-md xl-col-3 md-col-2 swiper-wrapper">
                        {recommendations.map((property) => (
                            <div key={property.id} className="swiper-slide">
                                {renderCard(property)}
                            </div>
                        ))}
                    </div>
                    <div className="sw-pagination sw-pagination-mb text-center d-md-none d-block" />
                </div>

                <Swiper
                    spaceBetween={30}
                    slidesPerView={1}
                    className="swiper tf-sw-mobile swiper-on-767"
                    modules={[Pagination]}
                    pagination={{ clickable: true, el: ".spb-recommended" }}
                >
                    {recommendations.map((property) => (
                        <SwiperSlide key={property.id}>
                            {renderCard(property)}
                        </SwiperSlide>
                    ))}
                    <div className="sw-pagination spb-recommended sw-pagination-mb text-center d-md-none d-block" />
                </Swiper>

                <div className="text-center sec-btn">
                    <Link href="/properties-map" className="tf-btn btn-view primary size-1 hover-btn-view">
                        Xem tất cả
                        <span className="icon icon-arrow-right2" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
