"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { createProperty, updateProperty } from "@/lib/hooks/useProperties";
import { createUniqueSlug } from "@/lib/utils/slugify";
import { geocodeAddress } from "@/lib/utils/geocoding";
import { LISTING_TYPES, DIRECTIONS, AMENITIES } from "@/lib/constants";
import LocationPickerMap from "@/components/map/LocationPickerMap";
import PriceInput from "@/components/common/PriceInput";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Trích lat/lng từ PostGIS location field
// Hỗ trợ: GeoJSON object, WKT string "POINT(lng lat)", GeoJSON string, WKB hex
function parseLocation(location) {
    if (!location) return null;

    // 1. GeoJSON object: { type:"Point", coordinates:[lng, lat] }
    if (typeof location === "object" && Array.isArray(location.coordinates)) {
        const [lng, lat] = location.coordinates;
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }

    if (typeof location === "string") {
        // 2. WKT string: POINT(lng lat)
        const m = location.match(/POINT\s*\(\s*([\d.\-]+)\s+([\d.\-]+)\s*\)/i);
        if (m) return { lat: parseFloat(m[2]), lng: parseFloat(m[1]) };

        // 3. GeoJSON string: '{"type":"Point","coordinates":[lng,lat]}'
        if (location.trimStart().startsWith("{")) {
            try {
                const parsed = JSON.parse(location);
                if (Array.isArray(parsed?.coordinates)) {
                    const [lng, lat] = parsed.coordinates;
                    if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
                }
            } catch { /* ignore */ }
        }

        // 4. WKB hex string (PostgREST sometimes returns geography as EWKB hex)
        if (/^[0-9a-f]+$/i.test(location) && location.length >= 42) {
            try {
                const bytes = location.match(/.{2}/g).map(h => parseInt(h, 16));
                if (bytes[0] !== 1) return null; // chỉ xử lý little-endian
                const readDouble = (offset) => {
                    const buf = new ArrayBuffer(8);
                    const view = new DataView(buf);
                    for (let i = 0; i < 8; i++) view.setUint8(i, bytes[offset + i]);
                    return view.getFloat64(0, true);
                };
                const geomType = bytes[1] | (bytes[2] << 8) | (bytes[3] << 16) | (bytes[4] << 24);
                const hasSRID = !!(geomType & 0x20000000);
                const baseType = geomType & 0x0FFFFFFF;
                if (baseType !== 1) return null; // chỉ xử lý Point
                const coordOffset = 5 + (hasSRID ? 4 : 0);
                const lng = readDouble(coordOffset);
                const lat = readDouble(coordOffset + 8);
                if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) return { lat, lng };
            } catch { /* ignore */ }
        }
    }

    return null;
}

// props:
//   initialData  - object khi edit mode (có trường images[])
//   onSuccess    - callback sau khi lưu thành công (nếu không truyền → redirect)
//   adminMode    - true khi admin sử dụng (bỏ qua kiểm tra canPostProperty + lock approved)
export default function PropertyForm({ initialData = null, onSuccess = null, adminMode = false }) {
    const isEdit = !!initialData;
    const { profile, canPostProperty } = useAuth();
    const router = useRouter();
    const supabase = createClient();

    // Khóa form nếu tin đã duyệt và không phải admin
    const isApproved = !adminMode && isEdit && initialData?.approval_status === "approved";
    // Cho phép gửi lại xét duyệt nếu tin bị từ chối
    const isRejected = !adminMode && isEdit && initialData?.approval_status === "rejected";

    const [loading, setLoading] = useState(false);
    const [propertyTypes, setPropertyTypes] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    // Marker trên bản đồ
    const [markerPos, setMarkerPos] = useState({ lat: null, lng: null });
    const [flyKey, setFlyKey] = useState(0); // trigger FlyTo mỗi lần geocode
    const [flyZoom, setFlyZoom] = useState(16);
    const geocodeDebounceRef = useRef(null);

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

    // Refs để đọc giá trị mới nhất trong setTimeout callback (tránh stale closure)
    const provincesRef = useRef([]);
    const districtsRef = useRef([]);
    const wardsRef = useRef([]);
    const formRef = useRef(form);
    provincesRef.current = provinces;
    districtsRef.current = districts;
    wardsRef.current = wards;
    formRef.current = form;

    // images: { file?, preview, url?, id?, isExisting: bool }
    const [images, setImages] = useState([]);
    const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
    const [deletedImageIds, setDeletedImageIds] = useState([]);

    // Load property types
    useEffect(() => {
        supabase.from("property_types").select("id, name, parent_id").order("id")
            .then(({ data }) => {
                if (data) {
                    const parents = data.filter(pt => !pt.parent_id);
                    const children = data.filter(pt => pt.parent_id);
                    setPropertyTypes(parents.map(p => ({
                        ...p, subTypes: children.filter(c => c.parent_id === p.id)
                    })));
                }
            });
    }, []);

    useEffect(() => {
        supabase.from("provinces").select("code, name").order("name")
            .then(({ data }) => { if (data) setProvinces(data); });
    }, []);

    // Khi provinces load xong mà chưa có marker → trigger geocode (race condition fix)
    // Xảy ra khi initialData set province_code nhưng provinces chưa load kịp
    useEffect(() => {
        if (provinces.length === 0) return;
        if (markerPos.lat) return; // đã có marker rồi
        if (!formRef.current?.province_code) return;
        // Trigger lại geocode effect bằng cách reset debounce
        if (geocodeDebounceRef.current) clearTimeout(geocodeDebounceRef.current);
        geocodeDebounceRef.current = setTimeout(async () => {
            const f = formRef.current;
            if (!f?.province_code) return;
            const provinceName = provincesRef.current.find(p => p.code == f.province_code)?.name;
            if (!provinceName) return;
            const districtName = districtsRef.current.find(d => d.code == f.district_code)?.name;
            const wardName = wardsRef.current.find(w => w.code == f.ward_code)?.name;
            let query, zoom;
            if (f.address?.trim() && districtName) {
                query = `${f.address.trim()}, ${districtName}, ${provinceName}, Việt Nam`;
                zoom = 17;
            } else if (wardName) {
                query = `${wardName}, ${districtName}, ${provinceName}, Việt Nam`;
                zoom = 15;
            } else if (districtName) {
                query = `${districtName}, ${provinceName}, Việt Nam`;
                zoom = 13;
            } else {
                query = `${provinceName}, Việt Nam`;
                zoom = 10;
            }
            const result = await geocodeAddress(query);
            if (result) {
                setMarkerPos({ lat: result.lat, lng: result.lng });
                setFlyZoom(zoom);
                setFlyKey(k => k + 1);
            }
        }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provinces]);

    // Pre-fill form khi edit mode
    useEffect(() => {
        if (!initialData) return;

        let parsedAmenities = [];
        try {
            parsedAmenities = typeof initialData.amenities === "string"
                ? JSON.parse(initialData.amenities || "[]")
                : (Array.isArray(initialData.amenities) ? initialData.amenities : []);
        } catch { parsedAmenities = []; }

        setForm({
            title: initialData.title || "",
            description: initialData.description || "",
            property_type_id: initialData.property_type_id?.toString() || "",
            listing_type: initialData.listing_type || "sale",
            price: initialData.price?.toString() || "",
            price_negotiable: initialData.price_negotiable || false,
            area: initialData.area?.toString() || "",
            bedrooms: initialData.bedrooms || 0,
            bathrooms: initialData.bathrooms || 0,
            floors: initialData.floors || 1,
            address: initialData.address || "",
            province_code: initialData.province_code || "",
            district_code: initialData.district_code || "",
            ward_code: initialData.ward_code || "",
            direction: initialData.direction || "",
            frontage: initialData.frontage?.toString() || "",
            road_width: initialData.road_width?.toString() || "",
            year_built: initialData.year_built?.toString() || "",
            amenities: parsedAmenities,
        });

        // Load existing images
        const imgs = initialData.images || initialData.property_images || [];
        const sorted = [...imgs].sort((a, b) =>
            (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || (a.sort_order ?? 0) - (b.sort_order ?? 0)
        );
        setImages(sorted.map(img => ({
            id: img.id, url: img.url, preview: img.url, isExisting: true, is_primary: img.is_primary,
        })));
        const pi = sorted.findIndex(img => img.is_primary);
        setPrimaryImageIndex(pi >= 0 ? pi : 0);

        // Load vị trí marker từ location field
        const pos = parseLocation(initialData.location);
        if (pos) {
            setMarkerPos(pos);
            setFlyKey(k => k + 1);
        }
    }, [initialData]);

    // Load districts khi province đổi
    useEffect(() => {
        if (!form.province_code) { setDistricts([]); return; }
        supabase.from("districts").select("code, name").eq("province_code", form.province_code).order("name")
            .then(({ data }) => { if (data) setDistricts(data); });
    }, [form.province_code]);

    // Load wards khi district đổi
    useEffect(() => {
        if (!form.district_code) { setWards([]); return; }
        supabase.from("wards").select("code, name").eq("district_code", form.district_code).order("name")
            .then(({ data }) => { if (data) setWards(data); });
    }, [form.district_code]);

    // Auto-geocode + fly khi tỉnh/quận/phường/địa chỉ thay đổi
    // Debounce 1000ms để không vượt rate limit Nominatim (1 req/s)
    // Dùng refs để đọc giá trị mới nhất trong callback — tránh stale closure
    useEffect(() => {
        if (!form.province_code) return;
        if (geocodeDebounceRef.current) clearTimeout(geocodeDebounceRef.current);
        geocodeDebounceRef.current = setTimeout(async () => {
            // Đọc từ refs để lấy giá trị mới nhất khi callback thực thi
            const f = formRef.current;
            // Dùng == để tránh type mismatch (DB có thể trả số, form lưu string)
            const provinceName = provincesRef.current.find(p => p.code == f.province_code)?.name;
            const districtName = districtsRef.current.find(d => d.code == f.district_code)?.name;
            const wardName = wardsRef.current.find(w => w.code == f.ward_code)?.name;

            if (!provinceName) return; // provinces chưa load xong

            // Xác định query và zoom theo mức độ chi tiết
            let query, zoom;
            if (f.address.trim() && districtName) {
                query = `${f.address.trim()}, ${districtName}, ${provinceName}, Việt Nam`;
                zoom = 17;
            } else if (wardName) {
                query = `${wardName}, ${districtName}, ${provinceName}, Việt Nam`;
                zoom = 15;
            } else if (districtName) {
                query = `${districtName}, ${provinceName}, Việt Nam`;
                zoom = 13;
            } else {
                query = `${provinceName}, Việt Nam`;
                zoom = 10;
            }

            const result = await geocodeAddress(query);
            if (result) {
                setMarkerPos({ lat: result.lat, lng: result.lng });
                setFlyZoom(zoom);
                setFlyKey(k => k + 1);
            }
        }, 1000);
        return () => clearTimeout(geocodeDebounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.province_code, form.district_code, form.ward_code, form.address]);

    const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const toggleAmenity = (amenity) => {
        setForm(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const handleImageUpload = useCallback((e) => {
        const files = Array.from(e.target.files || []);
        setImages(prev => [...prev, ...files.map(file => ({
            file, preview: URL.createObjectURL(file), isExisting: false,
        }))]);
    }, []);

    const removeImage = (index) => {
        setImages(prev => {
            const img = prev[index];
            if (img.isExisting && img.id) setDeletedImageIds(ids => [...ids, img.id]);
            const updated = prev.filter((_, i) => i !== index);
            if (primaryImageIndex === index) setPrimaryImageIndex(0);
            else if (primaryImageIndex > index) setPrimaryImageIndex(primaryImageIndex - 1);
            return updated;
        });
    };

    // Submit chính — resubmit=true: đặt lại approval_status="pending"
    const handleSubmit = async (e, resubmit = false) => {
        e.preventDefault();
        if (!adminMode && !canPostProperty) {
            toast.error("Chỉ người bán và môi giới mới có thể đăng tin");
            return;
        }
        if (!form.title || !form.listing_type || !form.property_type_id || !form.price || !form.area || !form.address) {
            toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (Tiêu đề, Loại giao dịch, Loại BĐS, Giá, Diện tích, Địa chỉ)");
            return;
        }

        setLoading(true);
        try {
            // Dùng vị trí marker (user đã chọn hoặc auto-geocode)
            let location = initialData?.location ?? null;
            if (markerPos.lat && markerPos.lng) {
                location = `POINT(${markerPos.lng} ${markerPos.lat})`;
            } else {
                // Geocode fallback nếu user chưa đặt marker
                const fullAddress = [
                    form.address,
                    wards.find(w => w.code == form.ward_code)?.name,
                    districts.find(d => d.code == form.district_code)?.name,
                    provinces.find(p => p.code == form.province_code)?.name,
                    "Việt Nam",
                ].filter(Boolean).join(", ");
                const geocoded = await geocodeAddress(fullAddress);
                if (geocoded) location = `POINT(${geocoded.lng} ${geocoded.lat})`;
            }

            const propertyData = {
                title: form.title,
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
                ...(resubmit ? { approval_status: "pending", status: "pending" } : {}),
            };

            let propertyId;
            if (isEdit) {
                const { error } = await updateProperty(initialData.id, propertyData);
                if (error) throw error;
                propertyId = initialData.id;
            } else {
                const slug = createUniqueSlug(form.title);
                const { data: newProperty, error } = await createProperty({
                    ...propertyData,
                    owner_id: profile.id,
                    slug,
                    status: "pending",
                    approval_status: "pending",
                });
                if (error) throw error;
                propertyId = newProperty.id;
            }

            // Xóa ảnh đã xóa
            if (isEdit && deletedImageIds.length > 0) {
                await supabase.from("property_images").delete().in("id", deletedImageIds);
            }

            // Upload ảnh mới và lấy ID để set is_primary sau
            const newImgs = images.filter(img => !img.isExisting);
            const uploadedMap = new Map(); // index in images[] → inserted row id
            for (let i = 0; i < newImgs.length; i++) {
                const img = newImgs[i];
                const imgIndexInAll = images.indexOf(img);
                const ext = img.file.name.split(".").pop().toLowerCase();
                const filePath = `${propertyId}/${Date.now()}_${i}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from("property-images")
                    .upload(filePath, img.file, { cacheControl: "3600", upsert: false });
                if (uploadErr) {
                    console.error("Upload error:", uploadErr);
                    toast.error(`Không upload được ảnh ${i + 1}: ${uploadErr.message}`);
                    continue;
                }
                const { data: { publicUrl } } = supabase.storage.from("property-images").getPublicUrl(filePath);
                const { data: insertedImg, error: insertErr } = await supabase
                    .from("property_images")
                    .insert({ property_id: propertyId, url: publicUrl, sort_order: imgIndexInAll, is_primary: false })
                    .select("id")
                    .single();
                if (insertErr) {
                    console.error("Insert image error:", insertErr);
                } else if (insertedImg) {
                    uploadedMap.set(imgIndexInAll, insertedImg.id);
                }
            }

            // Cập nhật is_primary
            if (images.length > 0) {
                const primaryImg = images[primaryImageIndex];
                await supabase.from("property_images").update({ is_primary: false }).eq("property_id", propertyId);
                if (primaryImg?.isExisting && primaryImg?.id) {
                    await supabase.from("property_images").update({ is_primary: true }).eq("id", primaryImg.id);
                } else {
                    const uploadedId = uploadedMap.get(primaryImageIndex);
                    if (uploadedId) {
                        await supabase.from("property_images").update({ is_primary: true }).eq("id", uploadedId);
                    }
                }
            }

            if (resubmit) {
                toast.success("Đã gửi lại yêu cầu xét duyệt!");
            } else if (isEdit) {
                toast.success("Đã cập nhật tin đăng!");
            } else {
                toast.success("Đăng tin thành công! Tin của bạn đang chờ admin duyệt.");
            }

            if (onSuccess) onSuccess(propertyId);
            else router.push("/my-property");
        } catch (err) {
            toast.error("Lỗi: " + (err.message || "Không thể lưu tin đăng"));
        } finally {
            setLoading(false);
        }
    };

    // ── Trường hợp không có quyền ──
    if (!adminMode && !canPostProperty) {
        return (
            <div className="main-content"><div className="main-content-inner">
                <div className="alert alert-warning">
                    Chỉ tài khoản <strong>Người bán</strong> hoặc <strong>Môi giới</strong> mới có thể đăng tin.
                </div>
            </div></div>
        );
    }

    const disabled = isApproved; // các input bị disabled khi tin đã duyệt

    return (
        <div className="main-content">
            <div className="main-content-inner">

                {/* Banner: tin đã được duyệt */}
                {isApproved && (
                    <div style={{
                        background: "#dcfce7", border: "1px solid #bbf7d0", borderRadius: 10,
                        padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12,
                    }}>
                        <i className="icon icon-check-circle" style={{ color: "#16a34a", fontSize: 22 }} />
                        <div>
                            <strong style={{ color: "#15803d" }}>Tin đăng đã được duyệt</strong>
                            <div style={{ fontSize: 13, color: "#166534", marginTop: 2 }}>
                                Tin đăng đang hiển thị công khai. Không thể chỉnh sửa nội dung khi đã được duyệt.
                                Liên hệ admin nếu cần thay đổi.
                            </div>
                        </div>
                        {initialData?.slug && (
                            <a href={`/property-details/${initialData.slug}`} target="_blank" rel="noopener noreferrer"
                                className="tf-btn primary" style={{ marginLeft: "auto", flexShrink: 0, fontSize: 13, padding: "8px 16px" }}>
                                Xem tin đăng
                            </a>
                        )}
                    </div>
                )}

                {/* Banner: tin bị từ chối */}
                {isRejected && (
                    <div style={{
                        background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10,
                        padding: "14px 18px", marginBottom: 20,
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <i className="icon icon-close2" style={{ color: "#dc2626", fontSize: 20 }} />
                            <strong style={{ color: "#dc2626" }}>Tin đăng bị từ chối</strong>
                        </div>
                        {initialData?.approval_note && (
                            <div style={{ fontSize: 13, color: "#7f1d1d", marginBottom: 4 }}>
                                <strong>Lý do:</strong> {initialData.approval_note}
                            </div>
                        )}
                        <div style={{ fontSize: 13, color: "#991b1b" }}>
                            Chỉnh sửa thông tin bên dưới rồi nhấn <strong>Gửi xét duyệt lại</strong>.
                        </div>
                    </div>
                )}

                <div className="widget-box-2">
                    <h6 className="title">{isEdit ? "Chỉnh sửa tin đăng" : "Đăng tin bất động sản"}</h6>

                    <form onSubmit={e => handleSubmit(e, false)}>
                        {/* Basic Info */}
                        <div className="box-fieldset mb-4">
                            <h6 className="mb-3">Thông tin cơ bản</h6>
                            <div className="row g-3">
                                <div className="col-md-12">
                                    <label className="fw-bold small">Tiêu đề <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control"
                                        placeholder="VD: Bán căn hộ 3 phòng ngủ tại Quận 7"
                                        value={form.title} onChange={e => handleChange("title", e.target.value)}
                                        required disabled={disabled} />
                                </div>
                                <div className="col-md-4">
                                    <label className="fw-bold small">Loại giao dịch <span className="text-danger">*</span></label>
                                    <select className="form-select" value={form.listing_type} required
                                        onChange={e => handleChange("listing_type", e.target.value)} disabled={disabled}>
                                        <option value="">Chọn loại giao dịch</option>
                                        {LISTING_TYPES.map(lt => <option key={lt.value} value={lt.value}>{lt.label}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="fw-bold small">Loại BĐS <span className="text-danger">*</span></label>
                                    <select className="form-select" value={form.property_type_id} disabled={disabled} required
                                        onChange={e => {
                                            const typeId = e.target.value;
                                            handleChange("property_type_id", typeId);
                                            const sel = propertyTypes.flatMap(pt => [pt, ...pt.subTypes]).find(t => t.id.toString() === typeId);
                                            if (sel) {
                                                const parent = propertyTypes.find(p => p.id === sel.parent_id || p.id === sel.id);
                                                if (parent?.slug === "nha-dat-ban") handleChange("listing_type", "sale");
                                                if (parent?.slug === "nha-dat-cho-thue") handleChange("listing_type", "rent");
                                            }
                                        }}>
                                        <option value="">Chọn loại</option>
                                        {propertyTypes.map(pt => (
                                            <optgroup key={pt.id} label={pt.name}>
                                                {pt.subTypes.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                                                {pt.subTypes.length === 0 && <option value={pt.id}>{pt.name}</option>}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="fw-bold small">Hướng nhà</label>
                                    <select className="form-select" value={form.direction}
                                        onChange={e => handleChange("direction", e.target.value)} disabled={disabled}>
                                        <option value="">Chọn hướng</option>
                                        {DIRECTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="fw-bold small">Mô tả</label>
                                    <textarea className="form-control" rows={5}
                                        placeholder="Mô tả chi tiết về bất động sản..."
                                        value={form.description} onChange={e => handleChange("description", e.target.value)}
                                        disabled={disabled} />
                                </div>
                            </div>
                        </div>

                        {/* Price & Details */}
                        <div className="box-fieldset mb-4">
                            <h6 className="mb-3">Thông tin chi tiết</h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="fw-bold small">Giá (VNĐ) <span className="text-danger">*</span></label>
                                    <PriceInput placeholder="VD: 5.000.000.000"
                                        value={form.price} onChange={val => handleChange("price", val)}
                                        required disabled={disabled} />
                                </div>
                                <div className="col-md-2">
                                    <label className="fw-bold small">&nbsp;</label>
                                    <div className="form-check mt-2">
                                        <input type="checkbox" className="form-check-input" id="negotiable"
                                            checked={form.price_negotiable}
                                            onChange={e => handleChange("price_negotiable", e.target.checked)}
                                            disabled={disabled} />
                                        <label className="form-check-label small" htmlFor="negotiable">Thương lượng</label>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <label className="fw-bold small">Diện tích (m²) <span className="text-danger">*</span></label>
                                    <input type="number" className="form-control" placeholder="VD: 80"
                                        value={form.area} onChange={e => handleChange("area", e.target.value)}
                                        min="0" required disabled={disabled} />
                                </div>
                                <div className="col-md-3">
                                    <label className="fw-bold small">Năm xây</label>
                                    <input type="number" className="form-control" placeholder="VD: 2020"
                                        value={form.year_built} onChange={e => handleChange("year_built", e.target.value)}
                                        min="1900" max={new Date().getFullYear()} disabled={disabled} />
                                </div>
                                <div className="col-md-3">
                                    <label className="fw-bold small">Phòng ngủ</label>
                                    <input type="number" className="form-control" value={form.bedrooms}
                                        onChange={e => handleChange("bedrooms", e.target.value)} min="0" disabled={disabled} />
                                </div>
                                <div className="col-md-3">
                                    <label className="fw-bold small">Phòng tắm</label>
                                    <input type="number" className="form-control" value={form.bathrooms}
                                        onChange={e => handleChange("bathrooms", e.target.value)} min="0" disabled={disabled} />
                                </div>
                                <div className="col-md-3">
                                    <label className="fw-bold small">Số tầng</label>
                                    <input type="number" className="form-control" value={form.floors}
                                        onChange={e => handleChange("floors", e.target.value)} min="1" disabled={disabled} />
                                </div>
                                <div className="col-md-3">
                                    <label className="fw-bold small">Mặt tiền (m)</label>
                                    <input type="number" className="form-control" placeholder="VD: 5"
                                        value={form.frontage} onChange={e => handleChange("frontage", e.target.value)}
                                        min="0" step="0.1" disabled={disabled} />
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="box-fieldset mb-4">
                            <h6 className="mb-3">Vị trí</h6>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label className="fw-bold small">Tỉnh/TP</label>
                                    <select className="form-select" value={form.province_code} disabled={disabled}
                                        onChange={e => {
                                            handleChange("province_code", e.target.value);
                                            handleChange("district_code", "");
                                            handleChange("ward_code", "");
                                        }}>
                                        <option value="">Chọn tỉnh/thành</option>
                                        {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="fw-bold small">Quận/Huyện</label>
                                    <select className="form-select" value={form.district_code}
                                        onChange={e => { handleChange("district_code", e.target.value); handleChange("ward_code", ""); }}
                                        disabled={!form.province_code || disabled}>
                                        <option value="">Chọn quận/huyện</option>
                                        {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-4">
                                    <label className="fw-bold small">Phường/Xã</label>
                                    <select className="form-select" value={form.ward_code}
                                        onChange={e => handleChange("ward_code", e.target.value)}
                                        disabled={!form.district_code || disabled}>
                                        <option value="">Chọn phường/xã</option>
                                        {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-12">
                                    <label className="fw-bold small">Địa chỉ cụ thể <span className="text-danger">*</span></label>
                                    <input type="text" className="form-control"
                                        placeholder="VD: Số 123, Đường Nguyễn Văn Linh"
                                        value={form.address} onChange={e => handleChange("address", e.target.value)}
                                        required disabled={disabled} />
                                    <small className="text-muted">Nhập địa chỉ sẽ tự động đặt marker trên bản đồ</small>
                                </div>

                                {/* Map picker */}
                                <div className="col-12">
                                    <label className="fw-bold small" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                                        Vị trí trên bản đồ
                                        {markerPos.lat && (
                                            <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 400 }}>
                                                ✓ {markerPos.lat.toFixed(5)}, {markerPos.lng.toFixed(5)}
                                            </span>
                                        )}
                                    </label>
                                    <LocationPickerMap
                                        lat={markerPos.lat}
                                        lng={markerPos.lng}
                                        flyKey={flyKey}
                                        flyZoom={flyZoom}
                                        onChange={disabled ? undefined : (lat, lng) => setMarkerPos({ lat, lng })}
                                        height="320px"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Amenities — phân nhóm theo category */}
                        <div className="box-fieldset mb-4">
                            <h6 className="mb-3">Tiện ích</h6>
                            {(() => {
                                const groups = AMENITIES.reduce((acc, a) => {
                                    if (!acc[a.category]) acc[a.category] = [];
                                    acc[a.category].push(a);
                                    return acc;
                                }, {});
                                return Object.entries(groups).map(([cat, items]) => (
                                    <div key={cat} className="mb-3">
                                        <div className="fw-bold small text-muted mb-2" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{cat}</div>
                                        <div className="d-flex flex-wrap gap-2">
                                            {items.map(amenity => (
                                                <button key={amenity.value} type="button" disabled={disabled}
                                                    className={`btn btn-sm ${form.amenities.includes(amenity.value) ? "btn-primary" : "btn-outline-secondary"}`}
                                                    onClick={() => toggleAmenity(amenity.value)}
                                                    style={{ borderRadius: "20px", fontSize: "12px", padding: "4px 12px" }}>
                                                    {form.amenities.includes(amenity.value) ? "✓ " : ""}{amenity.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>

                        {/* Images */}
                        <div className="box-fieldset mb-4">
                            <h6 className="mb-3">Hình ảnh</h6>
                            {!disabled && (
                                <div className="mb-3">
                                    <input type="file" className="form-control" accept="image/*" multiple onChange={handleImageUpload} />
                                    <small className="text-muted">Tải lên nhiều ảnh. Click vào ảnh để chọn làm ảnh đại diện.</small>
                                </div>
                            )}
                            {images.length > 0 && (
                                <div className="d-flex flex-wrap gap-2">
                                    {images.map((img, index) => (
                                        <div key={index} className="position-relative"
                                            style={{
                                                width: 120, height: 90, borderRadius: 8, overflow: "hidden", cursor: "pointer",
                                                border: primaryImageIndex === index ? "3px solid #e74c3c" : "2px solid #eee",
                                            }}
                                            onClick={() => !disabled && setPrimaryImageIndex(index)}>
                                            <Image src={img.preview} alt={`Preview ${index}`} fill
                                                style={{ objectFit: "cover" }}
                                                unoptimized={img.preview?.startsWith("blob:")} />
                                            {primaryImageIndex === index && (
                                                <span className="position-absolute top-0 start-0 badge bg-danger" style={{ fontSize: 9 }}>Ảnh chính</span>
                                            )}
                                            {img.isExisting && (
                                                <span className="position-absolute bottom-0 start-0 badge bg-secondary" style={{ fontSize: 9 }}>Hiện có</span>
                                            )}
                                            {!disabled && (
                                                <button type="button" className="position-absolute top-0 end-0 btn btn-sm btn-dark"
                                                    onClick={e => { e.stopPropagation(); removeImage(index); }}
                                                    style={{ fontSize: 10, padding: "0 4px", borderRadius: "0 0 0 4px" }}>
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Submit buttons */}
                        {!isApproved && (
                            <div className="d-flex gap-3 flex-wrap">
                                {/* Nút Gửi xét duyệt lại — chỉ khi user + bị từ chối */}
                                {isRejected && (
                                    <button type="button" className="tf-btn primary"
                                        style={{ background: "#f59e0b", borderColor: "#f59e0b" }}
                                        disabled={loading}
                                        onClick={e => handleSubmit(e, true)}>
                                        {loading ? "Đang gửi..." : "Gửi xét duyệt lại"}
                                    </button>
                                )}

                                {/* Nút Lưu thay đổi (chỉ admin hoặc tin pending/rejected) */}
                                {(adminMode || !isEdit || initialData?.approval_status !== "approved") && (
                                    <button type="submit" className="tf-btn primary" disabled={loading}>
                                        {loading ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Đăng tin (Chờ duyệt)"}
                                    </button>
                                )}

                                <button type="button" className="tf-btn secondary"
                                    onClick={() => onSuccess ? onSuccess() : router.back()}>
                                    Hủy
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
