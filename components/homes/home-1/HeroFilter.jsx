"use client";
import { useState, useEffect, useRef } from "react";
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
} from "@/lib/constants";
import { usePropertyCategoriesCms } from "@/lib/hooks/useCmsData";

let _provincesCache = null;

export default function HeroFilter() {
  const router = useRouter();
  const { profile } = useAuth();
  const dbCategories = usePropertyCategoriesCms();
  const PROPERTY_CATEGORIES = dbCategories ?? PROPERTY_CATEGORIES_STATIC;
  const advPanelRef = useRef();
  const advBtnRef = useRef();

  const [listingType, setListingType] = useState(null); // null | "rent" | "sale"
  const [categoryId, setCategoryId] = useState(null);
  const [provinceCode, setProvinceCode] = useState(null);
  const [keyword, setKeyword] = useState("");
  // Advanced
  const [pricePreset, setPricePreset] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [areaPreset, setAreaPreset] = useState(null);
  const [minArea, setMinArea] = useState("");
  const [maxArea, setMaxArea] = useState("");
  const [legalStatus, setLegalStatus] = useState(null);
  const [districtCode, setDistrictCode] = useState(null);
  const [wardCode, setWardCode] = useState(null);

  const [provinces, setProvinces] = useState(_provincesCache || []);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

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

  // Load districts
  useEffect(() => {
    if (!provinceCode) { setDistricts([]); setWards([]); setDistrictCode(null); return; }
    createClient()
      .from("districts")
      .select("code, name")
      .eq("province_code", provinceCode)
      .order("name")
      .then(({ data }) => setDistricts(data || []));
    setDistrictCode(null);
    setWards([]);
    setWardCode(null);
  }, [provinceCode]);

  // Load wards
  useEffect(() => {
    if (!districtCode) { setWards([]); setWardCode(null); return; }
    createClient()
      .from("wards")
      .select("code, name")
      .eq("district_code", districtCode)
      .order("name")
      .then(({ data }) => setWards(data || []));
    setWardCode(null);
  }, [districtCode]);

  // Close advanced panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (
        advPanelRef.current &&
        !advPanelRef.current.contains(e.target) &&
        advBtnRef.current &&
        !advBtnRef.current.contains(e.target)
      ) {
        advPanelRef.current.classList.remove("show");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const pricePresets = listingType === "rent" ? PRICE_PRESETS_RENT : PRICE_PRESETS;

  function togglePreset(current, setter, val) {
    setter(current === val ? null : val);
  }

  function handleSubmit(e) {
    e.preventDefault();
    trackFilterUsage(profile?.id, {
      listingType, provinceCode,
      minPrice: minPrice || null, maxPrice: maxPrice || null,
    });
    const params = new URLSearchParams();
    if (listingType)    params.set("lt",   listingType);
    if (categoryId)     params.set("cat",  categoryId);
    if (provinceCode)   params.set("prov", provinceCode);
    if (districtCode)   params.set("dist", districtCode);
    if (wardCode)       params.set("ward", wardCode);
    if (keyword.trim()) params.set("q",    keyword.trim());
    if (pricePreset !== null) params.set("pp", pricePreset);
    if (minPrice)       params.set("pmin", minPrice);
    if (maxPrice)       params.set("pmax", maxPrice);
    if (areaPreset !== null)  params.set("ap",  areaPreset);
    if (minArea)        params.set("amin", minArea);
    if (maxArea)        params.set("amax", maxArea);
    if (legalStatus)    params.set("ls",   legalStatus);
    router.push(`/properties-map?${params.toString()}`);
  }

  return (
    <div className="flat-tab flat-tab-form">
      {/* Tabs */}
      <ul className="nav-tab-form style-1 justify-content-center" role="tablist">
        {[{ v: null, l: "Tất cả" }, { v: "rent", l: "Cho thuê" }, { v: "sale", l: "Bán" }].map(({ v, l }) => (
          <li key={l} className="nav-tab-item" role="presentation">
            <a
              href="#"
              className={`nav-link-item${listingType === v ? " active" : ""}`}
              onClick={e => {
                e.preventDefault();
                setListingType(v);
                setPricePreset(null);
                setMinPrice("");
                setMaxPrice("");
              }}
            >
              {l}
            </a>
          </li>
        ))}
      </ul>

      <div className="tab-content">
        <div className="tab-pane fade active show" role="tabpanel">
          <div className="form-sl">
            <form onSubmit={handleSubmit}>
              <div className="wd-find-select">
                <div className="inner-group">

                  {/* ── Col 1: Loại BĐS ── */}
                  <div className="form-group-1 search-form form-style">
                    <label>Loại BĐS</label>
                    <SearchableSelect
                      className="ss-hero"
                      value={categoryId ? String(categoryId) : null}
                      onChange={v => setCategoryId(v ? Number(v) : null)}
                      options={PROPERTY_CATEGORIES.map(c => ({ code: String(c.id), name: c.name }))}
                      placeholder="Tất cả loại"
                      searchPlaceholder="Tìm loại BĐS..."
                    />
                  </div>

                  {/* ── Col 2: Khu vực ── */}
                  <div className="form-group-2 form-style">
                    <label>Khu vực</label>
                    <SearchableSelect
                      className="ss-hero"
                      value={provinceCode}
                      onChange={setProvinceCode}
                      options={provinces}
                      placeholder="Tất cả tỉnh / thành"
                      searchPlaceholder="Tìm tỉnh / thành..."
                    />
                  </div>

                  {/* ── Col 3: Từ khóa ── */}
                  <div className="form-group-3 form-style">
                    <label>Tìm kiếm</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tên đường, dự án, tiêu đề..."
                      value={keyword}
                      onChange={e => setKeyword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="box-btn-advanced">
                  {/* Advanced toggle */}
                  <div className="form-group-4 box-filter">
                    <a
                      ref={advBtnRef}
                      onClick={() => advPanelRef.current.classList.toggle("show")}
                      className="tf-btn btn-line filter-advanced pull-right"
                      style={{ cursor: "pointer" }}
                    >
                      <span className="text-1">Nâng cao</span>
                      <svg width={22} height={22} viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.5 12.375V3.4375M5.5 12.375C5.86467 12.375 6.21441 12.5199 6.47227 12.7777C6.73013 13.0356 6.875 13.3853 6.875 13.75C6.875 14.1147 6.73013 14.4644 6.47227 14.7223C6.21441 14.9801 5.86467 15.125 5.5 15.125M5.5 15.125C5.13533 15.125 4.78559 14.9801 4.52773 14.7223C4.26987 14.4644 4.125 14.1147 4.125 13.75C4.125 13.3853 4.26987 13.0356 4.52773 12.7777C4.78559 12.5199 5.13533 12.375 5.5 12.375M5.5 15.125V18.5625M16.5 12.375V3.4375M16.5 12.375C16.8647 12.375 17.2144 12.5199 17.4723 12.7777C17.7301 13.0356 17.875 13.3853 17.875 13.75C17.875 14.1147 17.7301 14.4644 17.4723 14.7223C17.2144 14.9801 16.8647 15.125 16.5 15.125M16.5 15.125C16.1353 15.125 15.7856 14.9801 15.5277 14.7223C15.2699 14.4644 15.125 14.1147 15.125 13.75C15.125 13.3853 15.2699 13.0356 15.5277 12.7777C15.7856 12.5199 16.1353 12.375 16.5 12.375M16.5 15.125V18.5625M11 6.875V3.4375M11 6.875C11.3647 6.875 11.7144 7.01987 11.9723 7.27773C12.2301 7.53559 12.375 7.88533 12.375 8.25C12.375 8.61467 12.2301 8.96441 11.9723 9.22227C11.7144 9.48013 11.3647 9.625 11 9.625M11 9.625C10.6353 9.625 10.2856 9.48013 10.0277 9.22227C9.76987 8.96441 9.625 8.61467 9.625 8.25C9.625 7.88533 9.76987 7.53559 10.0277 7.27773C10.2856 7.01987 10.6353 6.875 11 6.875M11 9.625V18.5625" stroke="#161E2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </div>
                  {/* Search */}
                  <button type="submit" className="tf-btn btn-search primary">
                    Tìm kiếm <i className="icon icon-search" />
                  </button>
                </div>
              </div>

              {/* ── Advanced panel ── */}
              <div ref={advPanelRef} className="wd-search-form">
                <div className="hero-adv-grid">

                  {/* Mức giá */}
                  <div className="hero-adv-col">
                    <div className="hero-adv-label">Mức giá</div>
                    <div className="group-tag-filter">
                      {pricePresets.map((p, i) => (
                        <button key={i} type="button"
                          className={`tag-filter-btn${pricePreset === i ? " active" : ""}`}
                          onClick={() => togglePreset(pricePreset, setPricePreset, i)}
                        >{p.label}</button>
                      ))}
                      <button type="button"
                        className={`tag-filter-btn${pricePreset === "custom" ? " active" : ""}`}
                        onClick={() => togglePreset(pricePreset, setPricePreset, "custom")}
                      >Tùy chỉnh</button>
                    </div>
                    {pricePreset === "custom" && (
                      <div className="range-input-wrap mt-2">
                        <input type="number" className="form-control"
                          placeholder={listingType === "rent" ? "Từ (triệu)" : "Từ (tỷ)"}
                          value={minPrice} min={0} onChange={e => setMinPrice(e.target.value)} />
                        <span className="range-sep">–</span>
                        <input type="number" className="form-control"
                          placeholder={listingType === "rent" ? "Đến (triệu)" : "Đến (tỷ)"}
                          value={maxPrice} min={0} onChange={e => setMaxPrice(e.target.value)} />
                      </div>
                    )}
                  </div>

                  {/* Diện tích */}
                  <div className="hero-adv-col">
                    <div className="hero-adv-label">Diện tích</div>
                    <div className="group-tag-filter">
                      {AREA_PRESETS.map((a, i) => (
                        <button key={i} type="button"
                          className={`tag-filter-btn${areaPreset === i ? " active" : ""}`}
                          onClick={() => togglePreset(areaPreset, setAreaPreset, i)}
                        >{a.label}</button>
                      ))}
                      <button type="button"
                        className={`tag-filter-btn${areaPreset === "custom" ? " active" : ""}`}
                        onClick={() => togglePreset(areaPreset, setAreaPreset, "custom")}
                      >Tùy chỉnh</button>
                    </div>
                    {areaPreset === "custom" && (
                      <div className="range-input-wrap mt-2">
                        <input type="number" className="form-control" placeholder="Từ (m²)"
                          value={minArea} min={0} onChange={e => setMinArea(e.target.value)} />
                        <span className="range-sep">–</span>
                        <input type="number" className="form-control" placeholder="Đến (m²)"
                          value={maxArea} min={0} onChange={e => setMaxArea(e.target.value)} />
                      </div>
                    )}
                  </div>

                  {/* Pháp lý */}
                  <div className="hero-adv-col">
                    <div className="hero-adv-label">Pháp lý</div>
                    <div className="group-tag-filter">
                      {LEGAL_STATUS_OPTIONS.map(opt => (
                        <button key={opt.value} type="button"
                          className={`tag-filter-btn${legalStatus === opt.value ? " active" : ""}`}
                          onClick={() => togglePreset(legalStatus, setLegalStatus, opt.value)}
                        >{opt.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Quận/Huyện + Phường/Xã (chỉ khi đã chọn tỉnh) */}
                  {districts.length > 0 && (
                    <div className="hero-adv-col">
                      <div className="hero-adv-label">Quận / Huyện</div>
                      <SearchableSelect
                        value={districtCode}
                        onChange={setDistrictCode}
                        options={districts}
                        placeholder="Tất cả Quận/Huyện"
                        searchPlaceholder="Tìm quận / huyện..."
                      />
                      {wards.length > 0 && (
                        <>
                          <div className="hero-adv-label mt-2">Phường / Xã</div>
                          <SearchableSelect
                            value={wardCode}
                            onChange={setWardCode}
                            options={wards}
                            placeholder="Tất cả Phường/Xã"
                            searchPlaceholder="Tìm phường / xã..."
                          />
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
