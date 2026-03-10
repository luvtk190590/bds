"use client";
import { useState } from "react";
import AmenityIcon from "@/components/common/AmenityIcon";

const SHOW_LIMIT = 10;

export default function Features({ propertyItem }) {
  const [showAll, setShowAll] = useState(false);

  const amenities = Array.isArray(propertyItem?.amenities)
    ? propertyItem.amenities.filter(Boolean)
    : [];

  if (!amenities.length) return null;

  const displayed = showAll ? amenities : amenities.slice(0, SHOW_LIMIT);

  return (
    <div className="amenities-section">
      <h5 className="title fw-6 mb-4">Tiện nghi &amp; trang bị</h5>

      <div className="amenity-grid">
        {displayed.map((name) => (
          <div key={name} className="amenity-item">
            <span className="amenity-icon-wrap">
              <AmenityIcon name={name} />
            </span>
            <span className="amenity-label">{name}</span>
          </div>
        ))}
      </div>

      {amenities.length > SHOW_LIMIT && (
        <button
          type="button"
          className="btn-amenity-more mt-4"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll
            ? "Thu gọn"
            : `Xem tất cả ${amenities.length} tiện nghi`}
        </button>
      )}
    </div>
  );
}
