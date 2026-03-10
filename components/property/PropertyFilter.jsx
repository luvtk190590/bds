"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    LISTING_TYPES,
    PRICE_RANGES,
    AREA_RANGES,
    BEDROOM_OPTIONS,
} from "@/lib/constants";

export default function PropertyFilter({ filters, onFilterChange }) {
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const supabase = createClient();

    // Load property types
    useEffect(() => {
        const loadTypes = async () => {
            const { data } = await supabase
                .from("property_types")
                .select("id, name, slug")
                .order("id");
            if (data) setPropertyTypes(data);
        };
        loadTypes();
    }, []);

    // Load provinces
    useEffect(() => {
        const loadProvinces = async () => {
            const { data } = await supabase
                .from("provinces")
                .select("code, name")
                .order("name");
            if (data) setProvinces(data);
        };
        loadProvinces();
    }, []);

    // Load districts when province changes
    useEffect(() => {
        if (!filters.province) {
            setDistricts([]);
            return;
        }
        const loadDistricts = async () => {
            const { data } = await supabase
                .from("districts")
                .select("code, name")
                .eq("province_code", filters.province)
                .order("name");
            if (data) setDistricts(data);
        };
        loadDistricts();
    }, [filters.province]);

    const handleChange = (key, value) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const handlePriceRange = (rangeIndex) => {
        if (rangeIndex === "" || rangeIndex === null) {
            handleChange("minPrice", null);
            onFilterChange({ ...filters, minPrice: null, maxPrice: null });
            return;
        }
        const range = PRICE_RANGES[rangeIndex];
        onFilterChange({
            ...filters,
            minPrice: range.min,
            maxPrice: range.max,
        });
    };

    const handleAreaRange = (rangeIndex) => {
        if (rangeIndex === "" || rangeIndex === null) {
            onFilterChange({ ...filters, minArea: null, maxArea: null });
            return;
        }
        const range = AREA_RANGES[rangeIndex];
        onFilterChange({
            ...filters,
            minArea: range.min,
            maxArea: range.max,
        });
    };

    const resetFilters = () => {
        onFilterChange({
            searchQuery: "",
            listingType: null,
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
    };

    return (
        <div className="widget-filter">
            {/* Search */}
            <fieldset className="box-fieldset mb-3">
                <label className="fw-bold small mb-1">Tìm kiếm</label>
                <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Nhập từ khóa..."
                    value={filters.searchQuery || ""}
                    onChange={(e) => handleChange("searchQuery", e.target.value)}
                />
            </fieldset>

            {/* Listing Type */}
            <fieldset className="box-fieldset mb-3">
                <label className="fw-bold small mb-1">Loại giao dịch</label>
                <select
                    className="form-select form-select-sm"
                    value={filters.listingType || ""}
                    onChange={(e) =>
                        handleChange("listingType", e.target.value || null)
                    }
                >
                    <option value="">Tất cả</option>
                    {LISTING_TYPES.map((lt) => (
                        <option key={lt.value} value={lt.value}>
                            {lt.label}
                        </option>
                    ))}
                </select>
            </fieldset>

            {/* Property Type */}
            <fieldset className="box-fieldset mb-3">
                <label className="fw-bold small mb-1">Loại BĐS</label>
                <select
                    className="form-select form-select-sm"
                    value={filters.propertyType || ""}
                    onChange={(e) =>
                        handleChange(
                            "propertyType",
                            e.target.value ? parseInt(e.target.value) : null
                        )
                    }
                >
                    <option value="">Tất cả loại</option>
                    {propertyTypes.map((pt) => (
                        <option key={pt.id} value={pt.id}>
                            {pt.name}
                        </option>
                    ))}
                </select>
            </fieldset>

            {/* Price Range */}
            <fieldset className="box-fieldset mb-3">
                <label className="fw-bold small mb-1">Mức giá</label>
                <select
                    className="form-select form-select-sm"
                    onChange={(e) =>
                        handlePriceRange(e.target.value === "" ? null : parseInt(e.target.value))
                    }
                >
                    <option value="">Tất cả mức giá</option>
                    {PRICE_RANGES.map((pr, idx) => (
                        <option key={idx} value={idx}>
                            {pr.label}
                        </option>
                    ))}
                </select>
            </fieldset>

            {/* Area Range */}
            <fieldset className="box-fieldset mb-3">
                <label className="fw-bold small mb-1">Diện tích</label>
                <select
                    className="form-select form-select-sm"
                    onChange={(e) =>
                        handleAreaRange(e.target.value === "" ? null : parseInt(e.target.value))
                    }
                >
                    <option value="">Tất cả diện tích</option>
                    {AREA_RANGES.map((ar, idx) => (
                        <option key={idx} value={idx}>
                            {ar.label}
                        </option>
                    ))}
                </select>
            </fieldset>

            {/* Bedrooms */}
            <fieldset className="box-fieldset mb-3">
                <label className="fw-bold small mb-1">Phòng ngủ</label>
                <div className="d-flex gap-1 flex-wrap">
                    <button
                        className={`btn btn-sm ${!filters.minBedrooms
                                ? "btn-primary"
                                : "btn-outline-secondary"
                            }`}
                        onClick={() => handleChange("minBedrooms", null)}
                        style={{ borderRadius: "16px", fontSize: "12px" }}
                    >
                        Tất cả
                    </button>
                    {BEDROOM_OPTIONS.map((bo) => (
                        <button
                            key={bo.value}
                            className={`btn btn-sm ${filters.minBedrooms === bo.value
                                    ? "btn-primary"
                                    : "btn-outline-secondary"
                                }`}
                            onClick={() => handleChange("minBedrooms", bo.value)}
                            style={{ borderRadius: "16px", fontSize: "12px" }}
                        >
                            {bo.label}
                        </button>
                    ))}
                </div>
            </fieldset>

            {/* Province */}
            <fieldset className="box-fieldset mb-3">
                <label className="fw-bold small mb-1">Tỉnh/Thành phố</label>
                <select
                    className="form-select form-select-sm"
                    value={filters.province || ""}
                    onChange={(e) => {
                        handleChange("province", e.target.value || null);
                        handleChange("district", null);
                    }}
                >
                    <option value="">Tất cả</option>
                    {provinces.map((p) => (
                        <option key={p.code} value={p.code}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </fieldset>

            {/* District */}
            {districts.length > 0 && (
                <fieldset className="box-fieldset mb-3">
                    <label className="fw-bold small mb-1">Quận/Huyện</label>
                    <select
                        className="form-select form-select-sm"
                        value={filters.district || ""}
                        onChange={(e) =>
                            handleChange("district", e.target.value || null)
                        }
                    >
                        <option value="">Tất cả</option>
                        {districts.map((d) => (
                            <option key={d.code} value={d.code}>
                                {d.name}
                            </option>
                        ))}
                    </select>
                </fieldset>
            )}

            {/* Sort */}
            <fieldset className="box-fieldset mb-3">
                <label className="fw-bold small mb-1">Sắp xếp</label>
                <select
                    className="form-select form-select-sm"
                    value={filters.sortBy || "newest"}
                    onChange={(e) => handleChange("sortBy", e.target.value)}
                >
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá thấp → cao</option>
                    <option value="price_desc">Giá cao → thấp</option>
                    <option value="relevance">Phù hợp nhất</option>
                </select>
            </fieldset>

            {/* Reset */}
            <button
                className="btn btn-outline-secondary btn-sm w-100"
                onClick={resetFilters}
            >
                Xóa bộ lọc
            </button>
        </div>
    );
}
