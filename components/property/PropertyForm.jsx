"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { createProperty } from "@/lib/hooks/useProperties";
import { createUniqueSlug } from "@/lib/utils/slugify";
import { geocodeAddress } from "@/lib/utils/geocoding";
import {
    LISTING_TYPES,
    DIRECTIONS,
    AMENITIES,
} from "@/lib/constants";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function PropertyForm() {
    const { profile, canPostProperty } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    const [loading, setLoading] = useState(false);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Form state
    const [form, setForm] = useState({
        title: "",
        description: "",
        property_type_id: "",
        listing_type: "sale",
        price: "",
        price_negotiable: false,
        area: "",
        bedrooms: 0,
        bathrooms: 0,
        floors: 1,
        address: "",
        province_code: "",
        district_code: "",
        ward_code: "",
        direction: "",
        frontage: "",
        road_width: "",
        year_built: "",
        amenities: [],
    });

    const [images, setImages] = useState([]);
    const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

    // Load property types
    useEffect(() => {
        supabase
            .from("property_types")
            .select("id, name, parent_id")
            .order("id")
            .then(({ data }) => {
                if (data) {
                    // Phân loại thành cha và con
                    const parents = data.filter(pt => !pt.parent_id);
                    const children = data.filter(pt => pt.parent_id);

                    const grouped = parents.map(p => ({
                        ...p,
                        subTypes: children.filter(c => c.parent_id === p.id)
                    }));

                    setPropertyTypes(grouped);
                }
            });
    }, []);

    // Load provinces
    useEffect(() => {
        supabase
            .from("provinces")
            .select("code, name")
            .order("name")
            .then(({ data }) => {
                if (data) setProvinces(data);
            });
    }, []);

    // Load districts
    useEffect(() => {
        if (!form.province_code) {
            setDistricts([]);
            return;
        }
        supabase
            .from("districts")
            .select("code, name")
            .eq("province_code", form.province_code)
            .order("name")
            .then(({ data }) => {
                if (data) setDistricts(data);
            });
    }, [form.province_code]);

    // Load wards
    useEffect(() => {
        if (!form.district_code) {
            setWards([]);
            return;
        }
        supabase
            .from("wards")
            .select("code, name")
            .eq("district_code", form.district_code)
            .order("name")
            .then(({ data }) => {
                if (data) setWards(data);
            });
    }, [form.district_code]);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const toggleAmenity = (amenity) => {
        setForm((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    // Image handling
    const handleImageUpload = useCallback((e) => {
        const files = Array.from(e.target.files || []);
        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...newImages]);
    }, []);

    const removeImage = (index) => {
        setImages((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            if (primaryImageIndex === index) setPrimaryImageIndex(0);
            else if (primaryImageIndex > index)
                setPrimaryImageIndex(primaryImageIndex - 1);
            return updated;
        });
    };

    // Submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!canPostProperty) {
            toast.error("Chỉ người bán và môi giới mới có thể đăng tin");
            return;
        }

        if (!form.title || !form.price || !form.address) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
            return;
        }

        setLoading(true);

        try {
            // 1. Geocode address
            let location = null;
            const fullAddress = [
                form.address,
                wards.find((w) => w.code === form.ward_code)?.name,
                districts.find((d) => d.code === form.district_code)?.name,
                provinces.find((p) => p.code === form.province_code)?.name,
            ]
                .filter(Boolean)
                .join(", ");

            const geocoded = await geocodeAddress(fullAddress);
            if (geocoded) {
                location = `POINT(${geocoded.lng} ${geocoded.lat})`;
            }

            // 2. Create property
            const slug = createUniqueSlug(form.title);
            const propertyData = {
                owner_id: profile.id,
                title: form.title,
                slug,
                description: form.description,
                property_type_id: form.property_type_id ? parseInt(form.property_type_id) : null,
                listing_type: form.listing_type,
                price: parseFloat(form.price),
                price_negotiable: form.price_negotiable,
                area: form.area ? parseFloat(form.area) : null,
                bedrooms: parseInt(form.bedrooms) || 0,
                bathrooms: parseInt(form.bathrooms) || 0,
                floors: parseInt(form.floors) || 1,
                address: form.address,
                province_code: form.province_code || null,
                district_code: form.district_code || null,
                ward_code: form.ward_code || null,
                location,
                direction: form.direction || null,
                frontage: form.frontage ? parseFloat(form.frontage) : null,
                road_width: form.road_width ? parseFloat(form.road_width) : null,
                year_built: form.year_built ? parseInt(form.year_built) : null,
                amenities: JSON.stringify(form.amenities),
                status: "pending",
            };

            const { data: newProperty, error: propError } =
                await createProperty(propertyData);

            if (propError) throw propError;

            // 3. Upload images
            if (images.length > 0 && newProperty) {
                for (let i = 0; i < images.length; i++) {
                    const img = images[i];
                    const ext = img.file.name.split(".").pop();
                    const filePath = `${newProperty.id}/${Date.now()}_${i}.${ext}`;

                    const { error: uploadError } = await supabase.storage
                        .from("property-images")
                        .upload(filePath, img.file);

                    if (!uploadError) {
                        const {
                            data: { publicUrl },
                        } = supabase.storage
                            .from("property-images")
                            .getPublicUrl(filePath);

                        await supabase.from("property_images").insert({
                            property_id: newProperty.id,
                            url: publicUrl,
                            sort_order: i,
                            is_primary: i === primaryImageIndex,
                        });
                    }
                }
            }

            toast.success(
                "Đăng tin thành công! Tin của bạn đang chờ admin duyệt."
            );
            router.push("/my-property");
        } catch (err) {
            toast.error("Lỗi: " + (err.message || "Không thể đăng tin"));
        } finally {
            setLoading(false);
        }
    };

    if (!canPostProperty) {
        return (
            <div className="main-content">
                <div className="main-content-inner">
                    <div className="alert alert-warning">
                        Chỉ tài khoản <strong>Người bán</strong> hoặc{" "}
                        <strong>Môi giới</strong> mới có thể đăng tin bất động sản.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="main-content">
            <div className="main-content-inner">
                <div className="widget-box-2">
                    <h6 className="title">Đăng tin bất động sản</h6>

                    <form onSubmit={handleSubmit}>
                        {/* Basic Info */}
                        <div className="box-fieldset mb-4">
                            <h6 className="mb-3">Thông tin cơ bản</h6>
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="fw-bold small">
                                        Tiêu đề <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="VD: Bán căn hộ 3 phòng ngủ tại Quận 7"
                                        value={form.title}
                                        onChange={(e) => handleChange("title", e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="col-md-4">
                                    <label className="fw-bold small">Loại giao dịch</label>
                                    <select
                                        className="form-select"
                                        value={form.listing_type}
                                        onChange={(e) =>
                                            handleChange("listing_type", e.target.value)
                                        }
                                    >
                                        {LISTING_TYPES.map((lt) => (
                                            <option key={lt.value} value={lt.value}>
                                                {lt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="fw-bold small">Loại BĐS</label>
                                    <select
                                        className="form-select"
                                        value={form.property_type_id}
                                        onChange={(e) => {
                                            const typeId = e.target.value;
                                            handleChange("property_type_id", typeId);

                                            // Tự động cập nhật listing_type dựa trên nhóm cha
                                            const selectedType = propertyTypes
                                                .flatMap(pt => [pt, ...pt.subTypes])
                                                .find(t => t.id.toString() === typeId);

                                            if (selectedType) {
                                                const parent = propertyTypes.find(p => p.id === selectedType.parent_id || p.id === selectedType.id);
                                                if (parent?.slug === 'nha-dat-ban') handleChange("listing_type", "sale");
                                                if (parent?.slug === 'nha-dat-cho-thue') handleChange("listing_type", "rent");
                                                if (parent?.slug === 'du-an') handleChange("listing_type", "sale"); // Dự án mặc định là bán
                                            }
                                        }}
                                    >
                                        <option value="">Chọn loại</option>
                                        {propertyTypes.map((pt) => {
                                            // Chỉ hiển thị các nhóm có loại con hoặc chính nó
                                            return (
                                                <optgroup key={pt.id} label={pt.name}>
                                                    {pt.subTypes.map(sub => (
                                                        <option key={sub.id} value={sub.id}>
                                                            {sub.name}
                                                        </option>
                                                    ))}
                                                    {pt.subTypes.length === 0 && (
                                                        <option value={pt.id}>{pt.name}</option>
                                                    )}
                                                </optgroup>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="fw-bold small">Hướng nhà</label>
                                    <select
                                        className="form-select"
                                        value={form.direction}
                                        onChange={(e) =>
                                            handleChange("direction", e.target.value)
                                        }
                                    >
                                        <option value="">Chọn hướng</option>
                                        {DIRECTIONS.map((d) => (
                                            <option key={d.value} value={d.value}>
                                                {d.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="fw-bold small">Mô tả</label>
                                    <textarea
                                        className="form-control"
                                        rows={5}
                                        placeholder="Mô tả chi tiết về bất động sản..."
                                        value={form.description}
                                        onChange={(e) =>
                                            handleChange("description", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Price & Details */}
                        <div className="box-fieldset mb-4">
                            <h6 className="mb-3">Thông tin chi tiết</h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="fw-bold small">
                                        Giá (VNĐ) <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="VD: 5000000000"
                                        value={form.price}
                                        onChange={(e) => handleChange("price", e.target.value)}
                                        required
                                        min="0"
                                    />
                                </div>
                                <div className="col-md-2">
                                    <label className="fw-bold small">&nbsp;</label>
                                    <div className="form-check mt-2">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="negotiable"
                                            checked={form.price_negotiable}
                                            onChange={(e) =>
                                                handleChange("price_negotiable", e.target.checked)
                                            }
                                        />
                                        <label className="form-check-label small" htmlFor="negotiable">
                                            Thương lượng
                                        </label>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <label className="fw-bold small">Diện tích (m²)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="VD: 80"
                                        value={form.area}
                                        onChange={(e) => handleChange("area", e.target.value)}
                                        min="0"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="fw-bold small">Năm xây</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="VD: 2020"
                                        value={form.year_built}
                                        onChange={(e) =>
                                            handleChange("year_built", e.target.value)
                                        }
                                        min="1900"
                                        max={new Date().getFullYear()}
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="fw-bold small">Phòng ngủ</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.bedrooms}
                                        onChange={(e) =>
                                            handleChange("bedrooms", e.target.value)
                                        }
                                        min="0"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="fw-bold small">Phòng tắm</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.bathrooms}
                                        onChange={(e) =>
                                            handleChange("bathrooms", e.target.value)
                                        }
                                        min="0"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="fw-bold small">Số tầng</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.floors}
                                        onChange={(e) => handleChange("floors", e.target.value)}
                                        min="1"
                                    />
                                </div>
                                <div className="col-md-3">
                                    <label className="fw-bold small">Mặt tiền (m)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="VD: 5"
                                        value={form.frontage}
                                        onChange={(e) =>
                                            handleChange("frontage", e.target.value)
                                        }
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="box-fieldset mb-4">
                            <h6 className="mb-3">Vị trí</h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="fw-bold small">Tỉnh/TP</label>
                                    <select
                                        className="form-select"
                                        value={form.province_code}
                                        onChange={(e) => {
                                            handleChange("province_code", e.target.value);
                                            handleChange("district_code", "");
                                            handleChange("ward_code", "");
                                        }}
                                    >
                                        <option value="">Chọn tỉnh/thành</option>
                                        {provinces.map((p) => (
                                            <option key={p.code} value={p.code}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="fw-bold small">Quận/Huyện</label>
                                    <select
                                        className="form-select"
                                        value={form.district_code}
                                        onChange={(e) => {
                                            handleChange("district_code", e.target.value);
                                            handleChange("ward_code", "");
                                        }}
                                        disabled={!form.province_code}
                                    >
                                        <option value="">Chọn quận/huyện</option>
                                        {districts.map((d) => (
                                            <option key={d.code} value={d.code}>
                                                {d.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="fw-bold small">Phường/Xã</label>
                                    <select
                                        className="form-select"
                                        value={form.ward_code}
                                        onChange={(e) =>
                                            handleChange("ward_code", e.target.value)
                                        }
                                        disabled={!form.district_code}
                                    >
                                        <option value="">Chọn phường/xã</option>
                                        {wards.map((w) => (
                                            <option key={w.code} value={w.code}>
                                                {w.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="fw-bold small">
                                        Địa chỉ cụ thể <span className="text-danger">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="VD: Số 123, Đường Nguyễn Văn Linh"
                                        value={form.address}
                                        onChange={(e) =>
                                            handleChange("address", e.target.value)
                                        }
                                        required
                                    />
                                    <small className="text-muted">
                                        Địa chỉ sẽ được tự động chuyển thành tọa độ trên bản đồ
                                    </small>
                                </div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="box-fieldset mb-4">
                            <h6 className="mb-3">Tiện ích</h6>
                            <div className="d-flex flex-wrap gap-2">
                                {AMENITIES.map((amenity) => (
                                    <button
                                        key={amenity.value}
                                        type="button"
                                        className={`btn btn-sm ${form.amenities.includes(amenity.value)
                                            ? "btn-primary"
                                            : "btn-outline-secondary"
                                            }`}
                                        onClick={() => toggleAmenity(amenity.value)}
                                        style={{
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            padding: "4px 12px",
                                        }}
                                    >
                                        {form.amenities.includes(amenity.value) ? "✓ " : ""}
                                        {amenity.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Images */}
                        <div className="box-fieldset mb-4">
                            <h6 className="mb-3">Hình ảnh</h6>
                            <div className="mb-3">
                                <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                                <small className="text-muted">
                                    Tải lên nhiều ảnh. Click vào ảnh để chọn làm ảnh đại diện.
                                </small>
                            </div>
                            {images.length > 0 && (
                                <div className="d-flex flex-wrap gap-2">
                                    {images.map((img, index) => (
                                        <div
                                            key={index}
                                            className="position-relative"
                                            style={{
                                                width: "120px",
                                                height: "90px",
                                                borderRadius: "8px",
                                                overflow: "hidden",
                                                border:
                                                    primaryImageIndex === index
                                                        ? "3px solid #e74c3c"
                                                        : "2px solid #eee",
                                                cursor: "pointer",
                                            }}
                                            onClick={() => setPrimaryImageIndex(index)}
                                        >
                                            <Image
                                                src={img.preview}
                                                alt={`Preview ${index}`}
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                            {primaryImageIndex === index && (
                                                <span
                                                    className="position-absolute top-0 start-0 badge bg-danger"
                                                    style={{ fontSize: "9px" }}
                                                >
                                                    Ảnh chính
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                className="position-absolute top-0 end-0 btn btn-sm btn-dark"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage(index);
                                                }}
                                                style={{
                                                    fontSize: "10px",
                                                    padding: "0 4px",
                                                    borderRadius: "0 0 0 4px",
                                                }}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="d-flex gap-3">
                            <button
                                type="submit"
                                className="tf-btn primary"
                                disabled={loading}
                            >
                                {loading ? "Đang đăng tin..." : "Đăng tin (Chờ duyệt)"}
                            </button>
                            <button
                                type="button"
                                className="tf-btn secondary"
                                onClick={() => router.back()}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
