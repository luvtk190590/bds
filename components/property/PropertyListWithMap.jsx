"use client";
import React, { useState, useEffect } from "react";
import PropertyMap from "@/components/map/PropertyMap";
import PropertyFilter from "@/components/property/PropertyFilter";
import PropertyCard from "@/components/property/PropertyCard";
import { useProperties } from "@/lib/hooks/useProperties";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFavorites } from "@/lib/hooks/useRecommendations";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PropertyListWithMap() {
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [viewMode, setViewMode] = useState("split"); // split, list, map
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        searchQuery: "",
        listingType: searchParams.get("listing") || null,
        propertyType: null,
        minPrice: null,
        maxPrice: null,
        minArea: null,
        maxArea: null,
        minBedrooms: null,
        province: null,
        district: null,
        sortBy: "newest",
    });

    // Resolve slug from URL to propertyType ID if present
    useEffect(() => {
        const typeSlug = searchParams.get("type");
        if (typeSlug) {
            supabase
                .from("property_types")
                .select("id")
                .eq("slug", typeSlug)
                .single()
                .then(({ data }) => {
                    if (data) {
                        setFilters(prev => ({ ...prev, propertyType: data.id }));
                    }
                });
        }
    }, [searchParams]);

    const { properties, totalCount, totalPages, isLoading } = useProperties({
        searchQuery: filters.searchQuery,
        filterType: filters.propertyType,
        filterListing: filters.listingType,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        filterProvince: filters.province,
        filterDistrict: filters.district,
        sortBy: filters.sortBy,
        page,
        pageSize: 12,
    });

    const { profile } = useAuth();
    const { toggleFavorite, isFavorited } = useFavorites(profile?.id);

    return (
        <div className="container-fluid px-0">
            {/* Top bar */}
            <div className="d-flex justify-content-between align-items-center px-3 py-2 bg-white border-bottom">
                <div>
                    <span className="fw-bold">{totalCount}</span>{" "}
                    <span className="text-muted">bất động sản</span>
                </div>
                <div className="d-flex gap-2">
                    <button
                        className={`btn btn-sm ${viewMode === "split" ? "btn-primary" : "btn-outline-secondary"
                            }`}
                        onClick={() => setViewMode("split")}
                        title="Bản đồ + Danh sách"
                    >
                        ⟐
                    </button>
                    <button
                        className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-outline-secondary"
                            }`}
                        onClick={() => setViewMode("list")}
                        title="Danh sách"
                    >
                        ☰
                    </button>
                    <button
                        className={`btn btn-sm ${viewMode === "map" ? "btn-primary" : "btn-outline-secondary"
                            }`}
                        onClick={() => setViewMode("map")}
                        title="Bản đồ"
                    >
                        🗺
                    </button>
                </div>
            </div>

            <div className="row g-0">
                {/* Filter Sidebar */}
                <div className="col-lg-3 bg-white border-end p-3" style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
                    <PropertyFilter filters={filters} onFilterChange={setFilters} />
                </div>

                {/* Main Content */}
                <div className="col-lg-9">
                    {viewMode === "split" ? (
                        <div className="row g-0" style={{ height: "calc(100vh - 100px)" }}>
                            {/* Map */}
                            <div className="col-md-6" style={{ height: "100%" }}>
                                <PropertyMap filters={filters} height="100%" />
                            </div>
                            {/* List */}
                            <div
                                className="col-md-6 p-3"
                                style={{ height: "100%", overflowY: "auto" }}
                            >
                                <PropertyList
                                    properties={properties}
                                    isLoading={isLoading}
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                    toggleFavorite={profile ? toggleFavorite : null}
                                    isFavorited={isFavorited}
                                />
                            </div>
                        </div>
                    ) : viewMode === "map" ? (
                        <PropertyMap filters={filters} height="calc(100vh - 100px)" />
                    ) : (
                        <div className="p-3" style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
                            <PropertyList
                                properties={properties}
                                isLoading={isLoading}
                                page={page}
                                totalPages={totalPages}
                                onPageChange={setPage}
                                toggleFavorite={profile ? toggleFavorite : null}
                                isFavorited={isFavorited}
                                columns={3}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PropertyList({
    properties,
    isLoading,
    page,
    totalPages,
    onPageChange,
    toggleFavorite,
    isFavorited,
    columns = 1,
}) {
    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status" />
                <p className="mt-2 text-muted">Đang tải...</p>
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="text-center py-5">
                <p className="text-muted">
                    Không tìm thấy bất động sản phù hợp.
                    <br />
                    Hãy thử thay đổi bộ lọc.
                </p>
            </div>
        );
    }

    return (
        <>
            <div className={`row g-3`}>
                {properties.map((property) => (
                    <div
                        key={property.id}
                        className={columns === 3 ? "col-md-4" : "col-12"}
                    >
                        <PropertyCard
                            property={property}
                            onFavoriteToggle={toggleFavorite}
                            isFavorited={isFavorited ? isFavorited(property.id) : false}
                        />
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <nav className="mt-4">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${page <= 1 ? "disabled" : ""}`}>
                            <button
                                className="page-link"
                                onClick={() => onPageChange(page - 1)}
                            >
                                ‹
                            </button>
                        </li>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            const pageNum =
                                totalPages <= 5
                                    ? i + 1
                                    : Math.min(
                                        Math.max(page - 2, 1) + i,
                                        totalPages
                                    );
                            return (
                                <li
                                    key={pageNum}
                                    className={`page-item ${page === pageNum ? "active" : ""}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => onPageChange(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                </li>
                            );
                        })}
                        <li
                            className={`page-item ${page >= totalPages ? "disabled" : ""}`}
                        >
                            <button
                                className="page-link"
                                onClick={() => onPageChange(page + 1)}
                            >
                                ›
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </>
    );
}
