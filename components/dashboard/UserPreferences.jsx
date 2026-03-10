"use client";
import React from "react";
import { useUserPreferences } from "@/lib/hooks/useRecommendations";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice } from "@/lib/utils/formatters";

export default function UserPreferences() {
    const { profile } = useAuth();
    const { preferences, isLoading } = useUserPreferences(profile?.id);

    if (!profile || profile.role === "admin") return null;

    if (isLoading) {
        return (
            <div className="widget-box-2 mb-4">
                <h6 className="title">📊 Sở thích của bạn</h6>
                <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" />
                </div>
            </div>
        );
    }

    if (!preferences || (!preferences.total_views && !preferences.total_favorites)) {
        return (
            <div className="widget-box-2 mb-4">
                <h6 className="title">📊 Sở thích của bạn</h6>
                <div className="text-center py-3">
                    <p className="text-muted small mb-2">
                        Hệ thống chưa có đủ dữ liệu về sở thích của bạn.
                    </p>
                    <p className="text-muted small">
                        Hãy xem và yêu thích một số BĐS để nhận gợi ý phù hợp!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="widget-box-2 mb-4">
            <h6 className="title">📊 Hồ sơ sở thích</h6>
            <p className="text-muted small mb-3">
                Phân tích từ {preferences.total_favorites || 0} BĐS yêu thích và{" "}
                {preferences.total_views || 0} lượt xem
            </p>

            <div className="row g-2">
                {/* Mức giá */}
                {preferences.avg_price > 0 && (
                    <div className="col-6">
                        <div
                            className="p-2"
                            style={{
                                background: "#fef3c7",
                                borderRadius: "10px",
                                border: "1px solid #fde68a",
                            }}
                        >
                            <div
                                className="text-muted mb-1"
                                style={{ fontSize: "11px" }}
                            >
                                💰 Mức giá quan tâm
                            </div>
                            <div className="fw-bold" style={{ fontSize: "13px" }}>
                                {formatPrice(preferences.avg_price)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Diện tích */}
                {preferences.avg_area > 0 && (
                    <div className="col-6">
                        <div
                            className="p-2"
                            style={{
                                background: "#dbeafe",
                                borderRadius: "10px",
                                border: "1px solid #bfdbfe",
                            }}
                        >
                            <div
                                className="text-muted mb-1"
                                style={{ fontSize: "11px" }}
                            >
                                📐 Diện tích TB
                            </div>
                            <div className="fw-bold" style={{ fontSize: "13px" }}>
                                {Math.round(preferences.avg_area)} m²
                            </div>
                        </div>
                    </div>
                )}

                {/* Phòng ngủ */}
                {preferences.preferred_bedrooms > 0 && (
                    <div className="col-6">
                        <div
                            className="p-2"
                            style={{
                                background: "#f3e8ff",
                                borderRadius: "10px",
                                border: "1px solid #e9d5ff",
                            }}
                        >
                            <div
                                className="text-muted mb-1"
                                style={{ fontSize: "11px" }}
                            >
                                🛏️ Phòng ngủ
                            </div>
                            <div className="fw-bold" style={{ fontSize: "13px" }}>
                                {preferences.preferred_bedrooms} phòng
                            </div>
                        </div>
                    </div>
                )}

                {/* Loại giao dịch */}
                {preferences.preferred_listing_type && (
                    <div className="col-6">
                        <div
                            className="p-2"
                            style={{
                                background:
                                    preferences.preferred_listing_type === "sale"
                                        ? "#fee2e2"
                                        : "#dcfce7",
                                borderRadius: "10px",
                                border: `1px solid ${preferences.preferred_listing_type === "sale"
                                        ? "#fecaca"
                                        : "#bbf7d0"
                                    }`,
                            }}
                        >
                            <div
                                className="text-muted mb-1"
                                style={{ fontSize: "11px" }}
                            >
                                📋 Loại giao dịch
                            </div>
                            <div className="fw-bold" style={{ fontSize: "13px" }}>
                                {preferences.preferred_listing_type === "sale"
                                    ? "Mua"
                                    : "Thuê"}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Loại BĐS yêu thích */}
            {preferences.preferred_property_types &&
                preferences.preferred_property_types.length > 0 && (
                    <div className="mt-3">
                        <div
                            className="text-muted mb-1"
                            style={{ fontSize: "11px" }}
                        >
                            🏠 Loại BĐS yêu thích
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                            {preferences.preferred_property_types.map((pt, idx) => (
                                <span
                                    key={idx}
                                    className="badge"
                                    style={{
                                        background: "#f0fdf4",
                                        color: "#16a34a",
                                        border: "1px solid #dcfce7",
                                        fontSize: "11px",
                                        fontWeight: "normal",
                                    }}
                                >
                                    {pt.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

            {/* Khu vực yêu thích */}
            {preferences.preferred_districts &&
                preferences.preferred_districts.length > 0 && (
                    <div className="mt-2">
                        <div
                            className="text-muted mb-1"
                            style={{ fontSize: "11px" }}
                        >
                            📍 Khu vực quan tâm
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                            {preferences.preferred_districts.map((d, idx) => (
                                <span
                                    key={idx}
                                    className="badge"
                                    style={{
                                        background: "#eff6ff",
                                        color: "#2563eb",
                                        border: "1px solid #dbeafe",
                                        fontSize: "11px",
                                        fontWeight: "normal",
                                    }}
                                >
                                    {d.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

            {/* Tỉnh yêu thích */}
            {preferences.preferred_provinces &&
                preferences.preferred_provinces.length > 0 && (
                    <div className="mt-2">
                        <div
                            className="text-muted mb-1"
                            style={{ fontSize: "11px" }}
                        >
                            🗺️ Tỉnh/TP quan tâm
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                            {preferences.preferred_provinces.map((p, idx) => (
                                <span
                                    key={idx}
                                    className="badge"
                                    style={{
                                        background: "#fef3c7",
                                        color: "#d97706",
                                        border: "1px solid #fde68a",
                                        fontSize: "11px",
                                        fontWeight: "normal",
                                    }}
                                >
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
        </div>
    );
}
