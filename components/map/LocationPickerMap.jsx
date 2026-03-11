"use client";
import dynamic from "next/dynamic";

const LocationPickerMapInner = dynamic(() => import("./LocationPickerMapInner"), {
    ssr: false,
    loading: () => (
        <div style={{
            height: "320px", background: "#f8fafc", display: "flex",
            alignItems: "center", justifyContent: "center", color: "#94a3b8",
            borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14,
        }}>
            Đang tải bản đồ...
        </div>
    ),
});

export default function LocationPickerMap(props) {
    return <LocationPickerMapInner {...props} />;
}
