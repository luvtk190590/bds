import React from "react";

export default function Description({ propertyItem }) {
  return (
    <>
      {" "}
      <h5 className="fw-6 title">Mô tả</h5>
      <p className="text-variant-1" style={{ whiteSpace: "pre-line" }}>
        {propertyItem?.description || "Chưa có mô tả."}
      </p>
    </>
  );
}
