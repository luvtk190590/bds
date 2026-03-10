"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PropertyMap from "../map/PropertyMap";
import { formatPrice, formatArea } from "@/lib/utils/formatters";
import Link from "next/link";
import Image from "next/image";
import { PROPERTY_CATEGORIES, PRICE_PRESETS, PRICE_PRESETS_RENT, AREA_PRESETS, LEGAL_STATUS_OPTIONS, AMENITIES } from "@/lib/constants";
import SearchableSelect from "@/components/common/SearchableSelect";

const AMENITY_GROUPS = AMENITIES.reduce((acc, a) => {
  if (!acc[a.category]) acc[a.category] = [];
  acc[a.category].push(a);
  return acc;
}, {});
import { createClient } from "@/lib/supabase/client";

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

function formFromParams(params) {
  const pp = params.get("pp");
  const ap = params.get("ap");
  return {
    listingType: params.get("lt") || null,
    categoryId: params.get("cat") ? Number(params.get("cat")) : null,
    pricePreset: pp === null ? null : pp === "custom" ? "custom" : Number(pp),
    minPrice: params.get("pmin") || "",
    maxPrice: params.get("pmax") || "",
    areaPreset: ap === null ? null : ap === "custom" ? "custom" : Number(ap),
    minArea: params.get("amin") || "",
    maxArea: params.get("amax") || "",
    legalStatus: params.get("ls") || null,
    provinceCode: params.get("prov") || null,
    districtCode: params.get("dist") || null,
    wardCode: params.get("ward") || null,
    streetOrProject: params.get("q") || "",
    amenities: params.getAll("am"),
  };
}

function buildActiveFilters(form) {
  const isRent = form.listingType === "rent";
  const presets = isRent ? PRICE_PRESETS_RENT : PRICE_PRESETS;

  let minPrice = null, maxPrice = null;
  if (form.pricePreset === "custom") {
    const multiplier = isRent ? 1_000_000 : 1_000_000_000;
    minPrice = form.minPrice ? Number(form.minPrice) * multiplier : null;
    maxPrice = form.maxPrice ? Number(form.maxPrice) * multiplier : null;
  } else if (form.pricePreset !== null) {
    minPrice = presets[form.pricePreset].min;
    maxPrice = presets[form.pricePreset].max;
  }

  let minArea = null, maxArea = null;
  if (form.areaPreset === "custom") {
    minArea = form.minArea ? Number(form.minArea) : null;
    maxArea = form.maxArea ? Number(form.maxArea) : null;
  } else if (form.areaPreset !== null) {
    minArea = AREA_PRESETS[form.areaPreset].min;
    maxArea = AREA_PRESETS[form.areaPreset].max;
  }

  return {
    listingType: form.listingType,
    categoryId: form.categoryId,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    legalStatus: form.legalStatus,
    provinceCode: form.provinceCode,
    districtCode: form.districtCode,
    wardCode: form.wardCode,
    keyword: form.streetOrProject?.trim() || null,
    amenities: form.amenities?.length ? form.amenities : null,
  };
}

export default function PropertiesMapCustom() {
  const searchParams = useSearchParams();
  const [mapData, setMapData] = useState([]);
  const [form, setForm] = useState(() => {
    const hasParams = searchParams.toString().length > 0;
    return hasParams ? formFromParams(searchParams) : INITIAL_FORM;
  });
  const [activeFilters, setActiveFilters] = useState(() => {
    if (!searchParams.toString().length) return {};
    return buildActiveFilters(formFromParams(searchParams));
  });
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Load districts khi chọn tỉnh
  useEffect(() => {
    if (!form.provinceCode) { setDistricts([]); setWards([]); return; }
    const supabase = createClient();
    supabase
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
    const supabase = createClient();
    supabase
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
    setActiveFilters(buildActiveFilters(form));
  }

  function clearFilter() {
    setForm(INITIAL_FORM);
    setActiveFilters({});
    setDistricts([]);
    setWards([]);
    // Xóa URL params
    window.history.replaceState({}, "", window.location.pathname);
  }

  return (
    <section className="wrapper-layout-3">
      {/* ── SIDEBAR FILTER ── */}
      <div className="wrap-sidebar">
        <div className="widget-sidebar">
          <div className="flat-tab flat-tab-form widget-filter-search widget-box">

            {/* Tabs Cho thuê / Bán */}
            <ul className="nav-tab-form" role="tablist">
              {[{ v: null, l: "Tất cả" }, { v: "rent", l: "Cho thuê" }, { v: "sale", l: "Bán" }].map(({ v, l }) => (
                <li key={l} className="nav-tab-item" role="presentation">
                  <a
                    href="#"
                    className={`nav-link-item${form.listingType === v ? " active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      // Reset price preset khi đổi loại (index preset khác nhau)
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
                          {(form.listingType === "rent" ? PRICE_PRESETS_RENT : PRICE_PRESETS).map((p, i) => (
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
                          <div className="range-input-group mt-2">
                            <div className="range-input-wrap">
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
                          <div className="range-input-group mt-2">
                            <div className="range-input-wrap">
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
                        <LocationFilter
                          form={form}
                          districts={districts}
                          wards={wards}
                          onChange={set}
                        />
                      </div>

                      {/* ── Tiện ích & Trang bị ── */}
                      <div className="box">
                        <h6 className="title fw-6 mb-2">Tiện ích &amp; Trang bị</h6>
                        <div className="widget-amenity-filter">
                          {Object.keys(AMENITY_GROUPS)
                            .slice(0, showAllAmenities ? undefined : 3)
                            .map(groupKey => (
                              <div key={groupKey} className="widget-amenity-group">
                                <div className="widget-amenity-group-label">{groupKey}</div>
                                <div className="widget-amenity-tags">
                                  {AMENITY_GROUPS[groupKey].map(a => (
                                    <button
                                      key={a.value}
                                      type="button"
                                      className={`tag-filter-btn${form.amenities.includes(a.value) ? " active" : ""}`}
                                      onClick={() => toggleAmenity(a.value)}
                                    >
                                      {a.label}
                                    </button>
                                  ))}
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
                              : `Xem thêm (${Object.keys(AMENITY_GROUPS).slice(3).reduce((s, k) => s + AMENITY_GROUPS[k].length, 0)} tiện ích) ↓`}
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
                      <a className="tf-btn btn-linemt-5 clear-filter" onClick={clearFilter} style={{ cursor: "pointer" }}>
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
          </div>
        </div>
      </div>

      {/* ── LISTING ── */}
      <div className="wrap-inner">
        <div className="box-title-listing">
          <h3 className="fw-8">Danh sách BĐS</h3>
          <div className="box-filter-tab">
            <ul className="nav-tab-filter" role="tablist">
              <li className="nav-tab-item" role="presentation">
                <a href="#gridLayout" className="nav-link-item" data-bs-toggle="tab">
                  <svg className="icon" width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.54883 5.90508C4.54883 5.1222 5.17272 4.5 5.91981 4.5C6.66686 4.5 7.2908 5.12221 7.2908 5.90508C7.2908 6.68801 6.66722 7.3101 5.91981 7.3101C5.17241 7.3101 4.54883 6.68801 4.54883 5.90508Z" stroke="#A3ABB0" /><path d="M10.6045 5.90508C10.6045 5.12221 11.2284 4.5 11.9755 4.5C12.7229 4.5 13.3466 5.1222 13.3466 5.90508C13.3466 6.68789 12.7227 7.3101 11.9755 7.3101C11.2284 7.3101 10.6045 6.68794 10.6045 5.90508Z" stroke="#A3ABB0" /><path d="M19.4998 5.90514C19.4998 6.68797 18.8757 7.31016 18.1288 7.31016C17.3818 7.31016 16.7578 6.68794 16.7578 5.90508C16.7578 5.12211 17.3813 4.5 18.1288 4.5C18.8763 4.5 19.4998 5.12215 19.4998 5.90514Z" stroke="#A3ABB0" /><path d="M7.24249 12.0098C7.24249 12.7927 6.61849 13.4148 5.87133 13.4148C5.12411 13.4148 4.5 12.7926 4.5 12.0098C4.5 11.2268 5.12419 10.6045 5.87133 10.6045C6.61842 10.6045 7.24249 11.2267 7.24249 12.0098Z" stroke="#A3ABB0" /><path d="M13.2976 12.0098C13.2976 12.7927 12.6736 13.4148 11.9266 13.4148C11.1795 13.4148 10.5557 12.7928 10.5557 12.0098C10.5557 11.2266 11.1793 10.6045 11.9266 10.6045C12.6741 10.6045 13.2976 11.2265 13.2976 12.0098Z" stroke="#A3ABB0" /><path d="M19.4516 12.0098C19.4516 12.7928 18.828 13.4148 18.0807 13.4148C17.3329 13.4148 16.709 12.7926 16.709 12.0098C16.709 11.2268 17.3332 10.6045 18.0807 10.6045C18.8279 10.6045 19.4516 11.2266 19.4516 12.0098Z" stroke="#A3ABB0" /><path d="M4.54297 18.0945C4.54297 17.3116 5.16709 16.6895 5.9143 16.6895C6.66137 16.6895 7.28523 17.3114 7.28523 18.0945C7.28523 18.8776 6.66139 19.4996 5.9143 19.4996C5.16714 19.4996 4.54297 18.8771 4.54297 18.0945Z" stroke="#A3ABB0" /><path d="M10.5986 18.0945C10.5986 17.3116 11.2227 16.6895 11.97 16.6895C12.7169 16.6895 13.3409 17.3115 13.3409 18.0945C13.3409 18.8776 12.7169 19.4996 11.97 19.4996C11.2225 19.4996 10.5986 18.8772 10.5986 18.0945Z" stroke="#A3ABB0" /><path d="M16.752 18.0945C16.752 17.3115 17.376 16.6895 18.1229 16.6895C18.8699 16.6895 19.4939 17.3115 19.4939 18.0945C19.4939 18.8776 18.8702 19.4996 18.1229 19.4996C17.376 19.4996 16.752 18.8772 16.752 18.0945Z" stroke="#A3ABB0" />
                  </svg>
                </a>
              </li>
              <li className="nav-tab-item" role="presentation">
                <a href="#listLayout" className="nav-link-item active" data-bs-toggle="tab">
                  <svg className="icon" width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.2016 17.8316H8.50246C8.0615 17.8316 7.7041 17.4742 7.7041 17.0332C7.7041 16.5923 8.0615 16.2349 8.50246 16.2349H19.2013C19.6423 16.2349 19.9997 16.5923 19.9997 17.0332C19.9997 17.4742 19.6426 17.8316 19.2016 17.8316Z" fill="#A3ABB0" /><path d="M19.2016 12.8199H8.50246C8.0615 12.8199 7.7041 12.4625 7.7041 12.0215C7.7041 11.5805 8.0615 11.2231 8.50246 11.2231H19.2013C19.6423 11.2231 19.9997 11.5805 19.9997 12.0215C20 12.4625 19.6426 12.8199 19.2016 12.8199Z" fill="#A3ABB0" /><path d="M19.2016 7.80913H8.50246C8.0615 7.80913 7.7041 7.45173 7.7041 7.01077C7.7041 6.5698 8.0615 6.2124 8.50246 6.2124H19.2013C19.6423 6.2124 19.9997 6.5698 19.9997 7.01077C19.9997 7.45173 19.6426 7.80913 19.2016 7.80913Z" fill="#A3ABB0" /><path d="M5.0722 8.1444C5.66436 8.1444 6.1444 7.66436 6.1444 7.0722C6.1444 6.48004 5.66436 6 5.0722 6C4.48004 6 4 6.48004 4 7.0722C4 7.66436 4.48004 8.1444 5.0722 8.1444Z" fill="#A3ABB0" /><path d="M5.0722 13.0941C5.66436 13.0941 6.1444 12.6141 6.1444 12.0219C6.1444 11.4297 5.66436 10.9497 5.0722 10.9497C4.48004 10.9497 4 11.4297 4 12.0219C4 12.6141 4.48004 13.0941 5.0722 13.0941Z" fill="#A3ABB0" /><path d="M5.0722 18.0433C5.66436 18.0433 6.1444 17.5633 6.1444 16.9711C6.1444 16.379 5.66436 15.8989 5.0722 15.8989C4.48004 15.8989 4 16.379 4 16.9711C4 17.5633 4.48004 18.0433 5.0722 18.0433Z" fill="#A3ABB0" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="flat-animate-tab">
          <div className="tab-content">
            <PropertyListing mapData={mapData} layout="grid" tabId="gridLayout" />
            <PropertyListing mapData={mapData} layout="list" tabId="listLayout" active />
          </div>
        </div>
      </div>

      {/* ── MAP ── */}
      <div className="wrap-map">
        <PropertyMap
          filters={activeFilters}
          height="100%"
          onDataChange={(data) => setMapData(data || [])}
        />
      </div>
    </section>
  );
}

// ── Sub-component: Location cascading selects ──
function LocationFilter({ form, districts, wards, onChange }) {
  return (
    <div className="location-filter-group">
      <ProvinceSelect value={form.provinceCode} onChange={v => onChange("provinceCode", v)} />
      {districts.length > 0 && (
        <SearchableSelect
          value={form.districtCode}
          onChange={v => onChange("districtCode", v)}
          options={districts}
          placeholder="Tất cả Quận/Huyện"
          searchPlaceholder="Tìm quận / huyện..."
        />
      )}
      {wards.length > 0 && (
        <SearchableSelect
          value={form.wardCode}
          onChange={v => onChange("wardCode", v)}
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
        onChange={e => onChange("streetOrProject", e.target.value)}
      />
    </div>
  );
}

// ── Sub-component: Province select (fetch once, cache in module) ──
let _provincesCache = null;
function ProvinceSelect({ value, onChange }) {
  const [provinces, setProvinces] = useState(_provincesCache || []);

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

  return (
    <SearchableSelect
      value={value}
      onChange={onChange}
      options={provinces}
      placeholder="Tất cả Tỉnh/Thành phố"
      searchPlaceholder="Tìm tỉnh / thành phố..."
    />
  );
}

// ── Sub-component: Property card listing ──
function PropertyListing({ mapData, layout, tabId, active }) {
  if (layout === "grid") {
    return (
      <div className={`tab-pane${active ? " active show" : ""}`} id={tabId} role="tabpanel">
        <div className="row">
          {mapData.map((elm, i) => (
            <div key={i} className="col-md-6">
              <div className="homelengo-box">
                <div className="archive-top" style={{ flexShrink: 0 }}>
                  <Link href={`/property-details/${elm.slug || elm.id}`} className="images-group">
                    <div className="images-style">
                      <Image className="lazyload" alt="img" src={elm.image_url || "/images/home/house-1.jpg"} style={{ objectFit: "cover", width: "100%", height: "100%" }} width={615} height={405} />
                    </div>
                    <div className="top">
                      <ul className="d-flex gap-6">
                        {elm.listing_type === "rent" ? <li className="flag-tag success">Cho thuê</li> : <li className="flag-tag primary">Bán</li>}
                      </ul>
                    </div>
                  </Link>
                </div>
                <div className="archive-bottom" style={{ minWidth: 0 }}>
                  <div className="content-top">
                    <h6 style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Link href={`/property-details/${elm.slug || elm.id}`} className="link" title={elm.title}>{elm.title}</Link>
                    </h6>
                    <ul className="meta-list">
                      <li className="item"><i className="icon icon-bed" /><span className="fw-6">{elm.bedrooms || 0}</span></li>
                      <li className="item"><i className="icon icon-bath" /><span className="fw-6">{elm.bathrooms || 0}</span></li>
                      <li className="item"><i className="icon icon-sqft" /><span className="fw-6">{formatArea(elm.area)}</span></li>
                    </ul>
                  </div>
                  <div className="content-bottom">
                    <span>{elm.owner_name || "Chưa cập nhật"}</span>
                    <h6 className="price">{formatPrice(elm.price)}</h6>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`tab-pane${active ? " active show" : ""}`} id={tabId} role="tabpanel">
      <div className="row">
        {mapData.map((elm, i) => (
          <div key={i} className="col-md-12">
            <div className="homelengo-box list-style-1 list-style-2 line">
              <div className="archive-top" style={{ flexShrink: 0, maxWidth: "33.5%", width: "100%" }}>
                <Link href={`/property-details/${elm.slug || elm.id}`} className="images-group">
                  <div className="images-style" style={{ width: "100%", display: "block", overflow: "hidden" }}>
                    <Image className="lazyload" alt="img-property" src={elm.image_url || "/images/home/house-1.jpg"} width={344} height={315} />
                  </div>
                  <div className="top">
                    <ul className="d-flex gap-6 flex-wrap">
                      {elm.listing_type === "rent" ? <li className="flag-tag success">Cho thuê</li> : <li className="flag-tag primary">Bán</li>}
                    </ul>
                  </div>
                </Link>
              </div>
              <div className="archive-bottom" style={{ minWidth: 0 }}>
                <div className="content-top">
                  <h6 style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    <Link href={`/property-details/${elm.slug || elm.id}`} className="link" title={elm.title}>{elm.title}</Link>
                  </h6>
                  <ul className="meta-list">
                    <li className="item"><i className="icon icon-bed" /><span className="fw-6">{elm.bedrooms || 0}</span></li>
                    <li className="item"><i className="icon icon-bath" /><span className="fw-6">{elm.bathrooms || 0}</span></li>
                    <li className="item"><i className="icon icon-sqft" /><span className="fw-6">{formatArea(elm.area)}</span></li>
                  </ul>
                  <div className="location">
                    <span className="text-line-clamp-1">{elm.address}</span>
                  </div>
                </div>
                <div className="content-bottom">
                  <span>{elm.owner_name || "Chưa cập nhật"}</span>
                  <h6 className="price">{formatPrice(elm.price)}</h6>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
