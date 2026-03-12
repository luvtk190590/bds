"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice, formatPriceWithUnit, formatArea } from "@/lib/utils/formatters";

export default function PropertyCard({ property, onFavoriteToggle, isFavorited = false }) {
    const imageUrl =
        property.image_url ||
        property.images?.find((i) => i.is_primary)?.url ||
        property.images?.[0]?.url ||
        "/images/home/house-1.jpg";

    const slug = property.slug || property.id;

    return (
        <div className="homeya-box">
            <div className="archive-top">
                <Link href={`/property-details/${slug}`}>
                    <div className="images-group" style={{ position: "relative", width: "100%", aspectRatio: "4/3", overflow: "hidden", borderRadius: "12px" }}>
                        <Image
                            src={imageUrl}
                            alt={property.title || "BĐS"}
                            fill
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                </Link>
                <div className="content">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                        <div className="h7 text-capitalize fw-7">
                            <Link href={`/property-details/${slug}`}>
                                {property.title}
                            </Link>
                        </div>
                        {onFavoriteToggle && (
                            <button
                                className="btn btn-sm p-0"
                                onClick={() => onFavoriteToggle(property.id)}
                                style={{
                                    fontSize: "20px",
                                    color: isFavorited ? "#e74c3c" : "#ccc",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                                title={isFavorited ? "Bỏ yêu thích" : "Thêm yêu thích"}
                            >
                                {isFavorited ? "♥" : "♡"}
                            </button>
                        )}
                    </div>
                    <div className="desc">
                        <i className="fs-16 icon-mapPin" />
                        <p>{property.address || "Chưa cập nhật"}</p>
                    </div>
                    <ul className="meta-list">
                        {property.bedrooms > 0 && (
                            <li className="item">
                                <i className="icon-bed" />
                                <span>{property.bedrooms} PN</span>
                            </li>
                        )}
                        {property.bathrooms > 0 && (
                            <li className="item">
                                <i className="icon-bathtub" />
                                <span>{property.bathrooms} PT</span>
                            </li>
                        )}
                        {property.area && (
                            <li className="item">
                                <i className="icon-ruler" />
                                <span>{formatArea(property.area)}</span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            <div className="archive-bottom d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-1">
                    {property.listing_type && (
                        <span
                            className="badge"
                            style={{
                                background:
                                    property.listing_type === "sale" ? "#fee2e2" : "#dcfce7",
                                color:
                                    property.listing_type === "sale" ? "#dc2626" : "#16a34a",
                                fontSize: "11px",
                            }}
                        >
                            {property.listing_type === "sale" ? "Bán" : "Cho thuê"}
                        </span>
                    )}
                    <h6 className="price" style={{ color: "#e74c3c", margin: 0 }}>
                        {formatPriceWithUnit(property.price, property.listing_type)}
                    </h6>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    {property.owner_name && (
                        <span className="small text-muted">{property.owner_name}</span>
                    )}
                    {property.property_type_name && (
                        <span
                            className="badge bg-light text-dark"
                            style={{ fontSize: "11px" }}
                        >
                            {property.property_type_name}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
