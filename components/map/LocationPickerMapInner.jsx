"use client";
import { useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Icon marker tuỳ chỉnh
const pickerIcon = L.divIcon({
    className: "",
    html: `<div style="width:32px;height:42px;position:relative;cursor:grab">
        <svg viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
            <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 26 16 26S32 26 32 16C32 7.163 24.837 0 16 0z" fill="#e74c3c"/>
            <circle cx="16" cy="16" r="7" fill="white"/>
            <circle cx="16" cy="16" r="4" fill="#e74c3c"/>
        </svg>
    </div>`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
});

// Draggable marker
function DraggableMarker({ position, onChange }) {
    const markerRef = useRef(null);
    return (
        <Marker
            draggable
            ref={markerRef}
            position={position}
            icon={pickerIcon}
            eventHandlers={{
                dragend() {
                    const pos = markerRef.current?.getLatLng();
                    if (pos) onChange(pos.lat, pos.lng);
                },
            }}
        />
    );
}

// Click trên map để di chuyển marker
function MapClickHandler({ onChange }) {
    useMapEvents({
        click(e) { onChange(e.latlng.lat, e.latlng.lng); },
    });
    return null;
}

// Luôn render, dùng ref để tránh stale closure — fly khi trigger thay đổi
function MapCenterUpdater({ lat, lng, zoom, trigger }) {
    const map = useMap();
    const latest = useRef({ lat, lng, zoom });
    latest.current = { lat, lng, zoom };

    useEffect(() => {
        const { lat, lng, zoom } = latest.current;
        if (!lat || !lng || !map) return;
        map.flyTo([lat, lng], zoom, { duration: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger, map]);

    return null;
}

// Fix size sau mount
function InvalidateSize() {
    const map = useMap();
    useEffect(() => {
        const t = setTimeout(() => map.invalidateSize(), 100);
        return () => clearTimeout(t);
    }, [map]);
    return null;
}

export default function LocationPickerMapInner({ lat, lng, flyKey, flyZoom = 16, onChange, height = "320px" }) {
    const hasPos = !!(lat && lng);

    return (
        <div style={{ height, width: "100%", borderRadius: 10, overflow: "hidden", border: "1px solid #e2e8f0", position: "relative" }}>
            <div style={{
                position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)",
                zIndex: 1000, background: "rgba(0,0,0,0.65)", color: "#fff",
                padding: "5px 14px", borderRadius: 20, fontSize: 12, pointerEvents: "none", whiteSpace: "nowrap",
            }}>
                Kéo marker hoặc click để đặt vị trí chính xác
            </div>
            <MapContainer
                center={hasPos ? [lat, lng] : [16.0, 106.0]}
                zoom={hasPos ? flyZoom : 6}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <InvalidateSize />

                {/* Luôn render — tự fly khi trigger (flyKey) thay đổi */}
                <MapCenterUpdater lat={lat} lng={lng} zoom={flyZoom} trigger={flyKey} />

                {onChange && <MapClickHandler onChange={onChange} />}

                {hasPos && (
                    <DraggableMarker
                        position={[lat, lng]}
                        onChange={onChange || (() => {})}
                    />
                )}
            </MapContainer>
        </div>
    );
}
