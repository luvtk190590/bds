"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { trackFilterUsage } from "@/lib/utils/trackFilter";
import SearchableSelect from "@/components/common/SearchableSelect";
import {
  PROPERTY_CATEGORIES as PROPERTY_CATEGORIES_STATIC,
  PRICE_PRESETS,
  PRICE_PRESETS_RENT,
  AREA_PRESETS,
  LEGAL_STATUS_OPTIONS,
  AMENITIES,
} from "@/lib/constants";
import { usePropertyCategoriesCms } from "@/lib/hooks/useCmsData";

const INITIAL_FORM = {
  listingType: null,
  categoryId: null,
  pricePreset: null,
  minPrice: "",
  maxPrice: "",
  areaPreset: null,
  minArea: "",
  maxArea: "",
  legalStatus: null,
  provinceCode: null,
  districtCode: null,
  wardCode: null,
  streetOrProject: "",
  amenities: [],
};

// Group amenities by category
const AMENITY_GROUPS = AMENITIES.reduce((acc, a) => {
  if (!acc[a.category]) acc[a.category] = [];
  acc[a.category].push(a);
  return acc;
}, {});

// Module-level province cache
let _provincesCache = null;

export default function WidgetBox() {
  const router = useRouter();
  const { profile } = useAuth();
  const dbCategories = usePropertyCategoriesCms();
  const PROPERTY_CATEGORIES = dbCategories ?? PROPERTY_CATEGORIES_STATIC;
  const [form, setForm] = useState(INITIAL_FORM);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinces, setProvinces] = useState(_provincesCache || []);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Load provinces once
  useEffect(() => {
    if (_provincesCache) return;
    createClient()
      .from("provinces")
      .select("code, name")
      .order("name")
      .then(({ data }) => {
        _provincesCache = data || [];
        setProvinces(_provincesCache);
      });
  }, []);

  // Load districts khi chọn tỉnh
  useEffect(() => {
    if (!form.provinceCode) { setDistricts([]); setWards([]); return; }
    createClient()
      .from("districts")
      .select("code, name")
      .eq("province_code", form.provinceCode)
      .order("name")
      .then(({ data }) => setDistricts(data || []));
    setForm(f => ({ ...f, districtCode: null, wardCode: null }));
    setWards([]);
  }, [form.provinceCode]);

  // Load wards khi chọn quận
  useEffect(() => {
    if (!form.districtCode) { setWards([]); return; }
    createClient()
      .from("wards")
      .select("code, name")
      .eq("district_code", form.districtCode)
      .order("name")
      .then(({ data }) => setWards(data || []));
    setForm(f => ({ ...f, wardCode: null }));
  }, [form.districtCode]);

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function toggleAmenity(value) {
    setForm(f => {
      const next = f.amenities.includes(value)
        ? f.amenities.filter(a => a !== value)
        : [...f.amenities, value];
      return { ...f, amenities: next };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    trackFilterUsage(profile?.id, {
      listingType: form.listingType,
      provinceCode: form.provinceCode,
      minPrice: form.minPrice || null,
      maxPrice: form.maxPrice || null,
    });
    const params = new URLSearchParams();
    if (form.listingType)    params.set("lt",   form.listingType);
    if (form.categoryId)     params.set("cat",  form.categoryId);
    if (form.pricePreset !== null) params.set("pp", form.pricePreset);
    if (form.minPrice)       params.set("pmin", form.minPrice);
    if (form.maxPrice)       params.set("pmax", form.maxPrice);
    if (form.areaPreset !== null)  params.set("ap",  form.areaPreset);
    if (form.minArea)        params.set("amin", form.minArea);
    if (form.maxArea)        params.set("amax", form.maxArea);
    if (form.legalStatus)    params.set("ls",   form.legalStatus);
    if (form.provinceCode)   params.set("prov", form.provinceCode);
    if (form.districtCode)   params.set("dist", form.districtCode);
    if (form.wardCode)       params.set("ward", form.wardCode);
    if (form.streetOrProject?.trim()) params.set("q", form.streetOrProject.trim());
    form.amenities.forEach(a => params.append("am", a));
    router.push(`/properties-map?${params.toString()}`);
  }

  function clearFilter() {
    setForm(INITIAL_FORM);
    setDistricts([]);
    setWards([]);
  }

  const pricePresets = form.listingType === "rent" ? PRICE_PRESETS_RENT : PRICE_PRESETS;

  // Amenity groups to display
  const groupKeys = Object.keys(AMENITY_GROUPS);
  const visibleGroups = showAllAmenities ? groupKeys : groupKeys.slice(0, 3);

  return (
    <>
      {/* Tabs Cho thuê / Bán */}
      <ul className="nav-tab-form" role="tablist">
        {[{ v: null, l: "Tất cả" }, { v: "rent", l: "Cho thuê" }, { v: "sale", l: "Bán" }].map(({ v, l }) => (
          <li key={l} className="nav-tab-item" role="presentation">
            <a
              href="#"
              className={`nav-link-item${form.listingType === v ? " active" : ""}`}
              onClick={e => {
                e.preventDefault();
                setForm(f => ({ ...f, listingType: v, pricePreset: null, minPrice: "", maxPrice: "" }));
              }}
            >{l}</a>
          </li>
        ))}
      </ul>

      <div className="tab-content">
        <div className="tab-pane fade active show" role="tabpanel">
          <form onSubmit={handleSubmit}>
            <div className="wd-filter-select">
              <div className="inner-group">

                {/* ── Loại BĐS ── */}
                <div className="box">
                  <h6 className="title fw-6 mb-2">Loại bất động sản</h6>
                  <div className="group-tag-filter">
                    {PROPERTY_CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`tag-filter-btn${form.categoryId === cat.id ? " active" : ""}`}
                        onClick={() => set("categoryId", form.categoryId === cat.id ? null : cat.id)}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Giá ── */}
                <div className="box">
                  <h6 className="title fw-6 mb-2">Mức giá</h6>
                  <div className="group-tag-filter">
                    {pricePresets.map((p, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`tag-filter-btn${form.pricePreset === i ? " active" : ""}`}
                        onClick={() => set("pricePreset", form.pricePreset === i ? null : i)}
                      >
                        {p.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`tag-filter-btn${form.pricePreset === "custom" ? " active" : ""}`}
                      onClick={() => set("pricePreset", form.pricePreset === "custom" ? null : "custom")}
                    >
                      Tùy chỉnh
                    </button>
                  </div>
                  {form.pricePreset === "custom" && (
                    <div className="range-input-wrap mt-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder={form.listingType === "rent" ? "Từ (triệu)" : "Từ (tỷ)"}
                        min={0}
                        value={form.minPrice}
                        onChange={e => set("minPrice", e.target.value)}
                      />
                      <span className="range-sep">–</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder={form.listingType === "rent" ? "Đến (triệu)" : "Đến (tỷ)"}
                        min={0}
                        value={form.maxPrice}
                        onChange={e => set("maxPrice", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* ── Diện tích ── */}
                <div className="box">
                  <h6 className="title fw-6 mb-2">Diện tích</h6>
                  <div className="group-tag-filter">
                    {AREA_PRESETS.map((a, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`tag-filter-btn${form.areaPreset === i ? " active" : ""}`}
                        onClick={() => set("areaPreset", form.areaPreset === i ? null : i)}
                      >
                        {a.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`tag-filter-btn${form.areaPreset === "custom" ? " active" : ""}`}
                      onClick={() => set("areaPreset", form.areaPreset === "custom" ? null : "custom")}
                    >
                      Tùy chỉnh
                    </button>
                  </div>
                  {form.areaPreset === "custom" && (
                    <div className="range-input-wrap mt-2">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Từ (m²)"
                        min={0}
                        value={form.minArea}
                        onChange={e => set("minArea", e.target.value)}
                      />
                      <span className="range-sep">–</span>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Đến (m²)"
                        min={0}
                        value={form.maxArea}
                        onChange={e => set("maxArea", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* ── Pháp lý ── */}
                <div className="box">
                  <h6 className="title fw-6 mb-2">Tình trạng pháp lý</h6>
                  <div className="group-tag-filter">
                    {LEGAL_STATUS_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`tag-filter-btn${form.legalStatus === opt.value ? " active" : ""}`}
                        onClick={() => set("legalStatus", form.legalStatus === opt.value ? null : opt.value)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Vị trí ── */}
                <div className="box">
                  <h6 className="title fw-6 mb-2">Vị trí</h6>
                  <div className="location-filter-group">
                    <SearchableSelect
                      value={form.provinceCode}
                      onChange={v => set("provinceCode", v)}
                      options={provinces}
                      placeholder="Tất cả Tỉnh/Thành phố"
                      searchPlaceholder="Tìm tỉnh / thành phố..."
                    />
                    {districts.length > 0 && (
                      <SearchableSelect
                        value={form.districtCode}
                        onChange={v => set("districtCode", v)}
                        options={districts}
                        placeholder="Tất cả Quận/Huyện"
                        searchPlaceholder="Tìm quận / huyện..."
                      />
                    )}
                    {wards.length > 0 && (
                      <SearchableSelect
                        value={form.wardCode}
                        onChange={v => set("wardCode", v)}
                        options={wards}
                        placeholder="Tất cả Phường/Xã"
                        searchPlaceholder="Tìm phường / xã..."
                      />
                    )}
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Đường / Tên dự án"
                      value={form.streetOrProject}
                      onChange={e => set("streetOrProject", e.target.value)}
                    />
                  </div>
                </div>

                {/* ── Tiện ích & Trang bị ── */}
                <div className="box">
                  <h6 className="title fw-6 mb-2">Tiện ích &amp; Trang bị</h6>
                  <div className="widget-amenity-filter">
                    {visibleGroups.map(groupKey => (
                      <div key={groupKey} className="widget-amenity-group">
                        <div className="widget-amenity-group-label">{groupKey}</div>
                        <div className="widget-amenity-tags">
                          {AMENITY_GROUPS[groupKey].map(a => {
                            const active = form.amenities.includes(a.value);
                            return (
                              <button
                                key={a.value}
                                type="button"
                                className={`tag-filter-btn${active ? " active" : ""}`}
                                onClick={() => toggleAmenity(a.value)}
                              >
                                {a.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="widget-amenity-toggle"
                      onClick={() => setShowAllAmenities(v => !v)}
                    >
                      {showAllAmenities
                        ? "Thu gọn ↑"
                        : `Xem thêm (${groupKeys.slice(3).reduce((s, k) => s + AMENITY_GROUPS[k].length, 0)} tiện ích) ↓`}
                    </button>
                    {form.amenities.length > 0 && (
                      <div className="widget-amenity-selected">
                        <span className="widget-amenity-selected-label">
                          Đã chọn: {form.amenities.length} tiện ích
                        </span>
                        <button
                          type="button"
                          className="widget-amenity-clear"
                          onClick={() => set("amenities", [])}
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Actions ── */}
                <a className="tf-btn btn-line mt-5 clear-filter" onClick={clearFilter} style={{ cursor: "pointer" }}>
                  Xóa bộ lọc
                </a>
                <div className="form-style">
                  <button type="submit" className="tf-btn btn-view primary hover-btn-view">
                    Tìm bất động sản
                    <span className="icon icon-arrow-right2" />
                  </button>
                </div>

              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
