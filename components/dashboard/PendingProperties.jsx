"use client";
import React, { useState } from "react";
import Image from "next/image";
import { usePendingProperties, approveProperty, rejectProperty } from "@/lib/hooks/useProperties";
import { useAuth } from "@/lib/hooks/useAuth";
import { formatPrice, formatArea, formatRelativeTime } from "@/lib/utils/formatters";
import { PROPERTY_STATUSES } from "@/lib/constants";
import toast from "react-hot-toast";

export default function PendingProperties() {
    const { isAdmin } = useAuth();
    const { properties, isLoading, error, mutate } = usePendingProperties();
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [processingId, setProcessingId] = useState(null);

    if (!isAdmin) {
        return (
            <div className="main-content">
                <div className="main-content-inner">
                    <div className="alert alert-danger">
                        Bạn không có quyền truy cập trang này.
                    </div>
                </div>
            </div>
        );
    }

    const handleApprove = async (propertyId) => {
        setProcessingId(propertyId);
        const { error } = await approveProperty(propertyId);
        setProcessingId(null);

        if (error) {
            toast.error("Lỗi khi duyệt: " + error.message);
            return;
        }

        toast.success("Đã duyệt bất động sản thành công!");
        mutate();
    };

    const handleReject = async (propertyId) => {
        if (!rejectReason.trim()) {
            toast.error("Vui lòng nhập lý do từ chối");
            return;
        }

        setProcessingId(propertyId);
        const { error } = await rejectProperty(propertyId, rejectReason);
        setProcessingId(null);

        if (error) {
            toast.error("Lỗi khi từ chối: " + error.message);
            return;
        }

        toast.success("Đã từ chối bất động sản.");
        setRejectingId(null);
        setRejectReason("");
        mutate();
    };

    return (
        <div className="main-content">
            <div className="main-content-inner">
                <div className="flat-counter-v2 tf-section">
                    <div className="counter-box">
                        <div className="box-icon w-68">
                            <span className="icon icon-list-dashes" />
                        </div>
                        <div className="content-box">
                            <div className="title-count">Chờ duyệt</div>
                            <div className="d-flex align-items-end">
                                <h6 className="number">{properties.length}</h6>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="widget-box-2 wd-listing">
                    <h6 className="title">Bất động sản chờ duyệt</h6>

                    {isLoading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger">
                            Lỗi tải dữ liệu: {error.message}
                        </div>
                    )}

                    {!isLoading && properties.length === 0 && (
                        <div className="text-center py-5">
                            <p className="text-muted">Không có bất động sản nào đang chờ duyệt.</p>
                        </div>
                    )}

                    {properties.map((property) => (
                        <div
                            key={property.id}
                            className="box-listings mb-4 p-3"
                            style={{
                                border: "1px solid #e8e8e8",
                                borderRadius: "12px",
                                background: "#fff",
                            }}
                        >
                            <div className="row">
                                {/* Image */}
                                <div className="col-md-3">
                                    <div
                                        className="position-relative overflow-hidden"
                                        style={{ borderRadius: "8px", height: "180px" }}
                                    >
                                        {property.images?.find((i) => i.is_primary)?.url ||
                                            property.images?.[0]?.url ? (
                                            <Image
                                                src={
                                                    property.images.find((i) => i.is_primary)?.url ||
                                                    property.images[0].url
                                                }
                                                alt={property.title}
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div
                                                className="d-flex align-items-center justify-content-center h-100"
                                                style={{ background: "#f0f0f0" }}
                                            >
                                                <span className="text-muted">Chưa có ảnh</span>
                                            </div>
                                        )}
                                        <span
                                            className="position-absolute top-0 start-0 m-2 badge"
                                            style={{
                                                background:
                                                    PROPERTY_STATUSES[property.status]?.bgColor,
                                                color: PROPERTY_STATUSES[property.status]?.color,
                                            }}
                                        >
                                            {PROPERTY_STATUSES[property.status]?.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="col-md-5">
                                    <h6 className="mb-1">{property.title}</h6>
                                    <p className="text-muted small mb-1">
                                        <i className="icon-mapPin me-1" />
                                        {property.address}
                                    </p>
                                    <div className="d-flex gap-3 mb-2">
                                        <span className="small">
                                            <strong>{formatPrice(property.price)}</strong>
                                        </span>
                                        {property.area && (
                                            <span className="small text-muted">
                                                {formatArea(property.area)}
                                            </span>
                                        )}
                                        {property.bedrooms > 0 && (
                                            <span className="small text-muted">
                                                {property.bedrooms} PN
                                            </span>
                                        )}
                                    </div>
                                    <p className="small text-muted mb-1">
                                        {property.description?.substring(0, 150)}
                                        {property.description?.length > 150 ? "..." : ""}
                                    </p>
                                    <div className="d-flex align-items-center gap-2 small">
                                        <span className="text-muted">
                                            Đăng bởi: <strong>{property.owner?.full_name}</strong> (
                                            {property.owner?.role === "seller"
                                                ? "Người bán"
                                                : "Môi giới"}
                                            )
                                        </span>
                                        <span className="text-muted">•</span>
                                        <span className="text-muted">
                                            {formatRelativeTime(property.created_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-md-4 d-flex flex-column justify-content-center gap-2">
                                    {rejectingId === property.id ? (
                                        <>
                                            <textarea
                                                className="form-control form-control-sm"
                                                rows={2}
                                                placeholder="Nhập lý do từ chối..."
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                            />
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-danger btn-sm flex-fill"
                                                    onClick={() => handleReject(property.id)}
                                                    disabled={processingId === property.id}
                                                >
                                                    {processingId === property.id
                                                        ? "Đang xử lý..."
                                                        : "Xác nhận từ chối"}
                                                </button>
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => {
                                                        setRejectingId(null);
                                                        setRejectReason("");
                                                    }}
                                                >
                                                    Hủy
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleApprove(property.id)}
                                                disabled={processingId === property.id}
                                            >
                                                {processingId === property.id
                                                    ? "Đang duyệt..."
                                                    : "✓ Duyệt tin"}
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => setRejectingId(property.id)}
                                            >
                                                ✕ Từ chối
                                            </button>
                                            <a
                                                href={`/property-details/${property.slug || property.id}`}
                                                target="_blank"
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                Xem chi tiết
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
