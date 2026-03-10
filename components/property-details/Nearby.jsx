"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  NEARBY_CATEGORIES,
  buildOverpassQuery,
  processElements,
  formatDist,
} from "@/lib/nearbyConfig";

const MAX_PER_CATEGORY = 6;

const NearbyMapInner = dynamic(() => import("./NearbyMapInner"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: 14 }}>
      Đang tải bản đồ...
    </div>
  ),
});

export default function Nearby({ propertyItem }) {
  const lat = propertyItem?.lat ? parseFloat(propertyItem.lat) : null;
  const lng = propertyItem?.lng ? parseFloat(propertyItem.lng) : null;

  const [radius, setRadius] = useState(1000);
  const [pois, setPois] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategories, setActiveCategories] = useState(
    () => new Set(NEARBY_CATEGORIES.map((c) => c.key))
  );

  const cache = useRef({});

  const fetchPOIs = useCallback(async () => {
    if (!lat || !lng) return;
    const cacheKey = `${lat},${lng},${radius}`;
    if (cache.current[cacheKey]) {
      setPois(cache.current[cacheKey]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const query = buildOverpassQuery(lat, lng, radius);
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query,
        headers: { "Content-Type": "text/plain" },
      });
      if (!res.ok) throw new Error("Overpass API lỗi");
      const json = await res.json();
      const processed = processElements(json.elements, lat, lng);
      cache.current[cacheKey] = processed;
      setPois(processed);
    } catch {
      setError("Không thể tải dữ liệu tiện ích lân cận. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [lat, lng, radius]);

  useEffect(() => { fetchPOIs(); }, [fetchPOIs]);

  if (!lat || !lng) return null;

  const toggleCategory = (key) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const visiblePois = pois.filter((p) => activeCategories.has(p.category));

  return (
    <div className="nearby-section">
      <h5 className="title fw-6 mb-1">Tiện ích lân cận</h5>
      <p className="text-variant-1 mb-4" style={{ fontSize: 14 }}>
        Các dịch vụ trong bán kính{" "}
        {radius < 1000 ? `${radius}m` : `${radius / 1000}km`} từ bất động sản
      </p>

      {/* Bán kính */}
      <div className="nearby-radius-group mb-3">
        {[500, 1000, 2000].map((r) => (
          <button
            key={r}
            className={`nearby-radius-btn${radius === r ? " active" : ""}`}
            onClick={() => setRadius(r)}
          >
            {r < 1000 ? `${r}m` : `${r / 1000}km`}
          </button>
        ))}
      </div>

      {/* Loại tiện ích */}
      <div className="nearby-cat-group mb-4">
        {NEARBY_CATEGORIES.map((cat) => {
          const isActive = activeCategories.has(cat.key);
          const count = pois.filter((p) => p.category === cat.key).length;
          return (
            <button
              key={cat.key}
              className={`nearby-cat-btn${isActive ? " active" : ""}`}
              style={{ "--cat-color": cat.color }}
              onClick={() => toggleCategory(cat.key)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              {count > 0 && (
                <span className="nearby-cat-count">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Map */}
      <div className="nearby-map-wrap mb-4">
        {loading && (
          <div className="nearby-map-overlay">
            <div className="nearby-spinner" />
            <span style={{ fontSize: 14, color: "#555" }}>
              Đang tìm kiếm tiện ích...
            </span>
          </div>
        )}
        <NearbyMapInner
          lat={lat}
          lng={lng}
          pois={visiblePois}
          radius={radius}
          propertyTitle={propertyItem?.title}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="nearby-error mb-3">
          {error}
          <button
            onClick={fetchPOIs}
            style={{ marginLeft: 8, textDecoration: "underline", background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Danh sách */}
      {!loading && !error && (
        <div className="nearby-list">
          {NEARBY_CATEGORIES.filter((c) => activeCategories.has(c.key)).map((cat) => {
            const items = visiblePois
              .filter((p) => p.category === cat.key)
              .slice(0, MAX_PER_CATEGORY);
            if (!items.length) return null;
            return (
              <div key={cat.key} className="nearby-cat-section">
                <div className="nearby-cat-header">
                  <span>{cat.icon}</span>
                  <span className="nearby-cat-name" style={{ color: cat.color }}>
                    {cat.label}
                  </span>
                </div>
                <ul className="nearby-items">
                  {items.map((poi) => (
                    <li key={`${poi.id}-${poi.category}`} className="nearby-item">
                      <span className="nearby-dot" style={{ background: cat.color }} />
                      <span className="nearby-item-name">{poi.name}</span>
                      <span className="nearby-item-dist">{formatDist(poi.dist)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {visiblePois.length === 0 && (
            <p style={{ color: "#aaa", fontSize: 14, textAlign: "center", padding: "24px 0" }}>
              Không tìm thấy tiện ích trong bán kính này.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
