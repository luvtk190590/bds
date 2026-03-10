"use client";
import dynamic from "next/dynamic";

// Dynamic import toàn bộ component Map (chứa react-leaflet + leaflet) để tránh SSR
const PropertyMapInner = dynamic(() => import("./PropertyMapInner"), {
    ssr: false,
    loading: () => (
        <div style={{ height: "600px", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
            Đang tải bản đồ...
        </div>
    )
});

export default function PropertyMap(props) {
    return <PropertyMapInner {...props} />;
}
