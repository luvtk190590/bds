"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, formatArea } from "@/lib/utils/formatters";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

function getSupabase() {
    return createClient();
}

// ---- Custom Marker Icon ----
const createCustomMarkerIcon = (isRent) => {
    return L.divIcon({
        className: 'marker-container',
        html: `
            <div class="marker-card">
                <div class="front face ${isRent ? 'rent' : 'sale'}" style="background-color: ${isRent ? '#2ecc71' : '#e74c3c'}">
                    <div></div>
                </div>
                <div class="back face ${isRent ? 'rent' : 'sale'}" style="background-color: ${isRent ? '#2ecc71' : '#e74c3c'}">
                    <div></div>
                </div>
                <div class="marker-arrow"></div>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });
};

function InvalidateSize() {
    const map = useMap();
    useEffect(() => {
        // Chạy 2 lần: lần 1 sau khi mount, lần 2 sau khi layout hoàn toàn ổn định
        const t1 = setTimeout(() => map.invalidateSize(), 0);
        const t2 = setTimeout(() => map.invalidateSize(), 400);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [map]);
    return null;
}

function MapEvents({ onBoundsChanged }) {
    const map = useMapEvents({
        moveend: () => onBoundsChanged(map),
        zoomend: () => onBoundsChanged(map),
    });

    useEffect(() => {
        if (map) onBoundsChanged(map);
    }, [map]);

    return null;
}

function MapController({ provinceCode, onCentered }) {
    const map = useMapEvents({});
    const centeredForRef = useRef(null); // track province đã center, không block lần sau

    useEffect(() => {
        if (!provinceCode || !map) return;
        if (centeredForRef.current === provinceCode) return; // đã center cho province này rồi

        async function fetchProvinceLocation() {
            try {
                const supabase = getSupabase();
                const { data } = await supabase.rpc('search_properties', {
                    search_query: '',
                    filter_province: provinceCode,
                    page_size: 1,
                    page_number: 1
                });

                if (data && data.length > 0 && data[0].lat && data[0].lng) {
                    centeredForRef.current = provinceCode;
                    map.once('moveend', () => onCentered());
                    map.setView([data[0].lat, data[0].lng], 11);
                } else {
                    centeredForRef.current = provinceCode;
                    onCentered();
                }
            } catch (e) {
                console.error("Failed to fetch province center", e);
                centeredForRef.current = provinceCode;
                onCentered();
            }
        }

        fetchProvinceLocation();
    }, [provinceCode, map]);

    return null;
}

// ---- Empty array constant ----
const EMPTY_ARRAY = [];

// ---- Main Component ----
export default function PropertyMapInner({ filters = {}, height = "600px", onDataChange }) {
    const [bounds, setBounds] = useState(null);
    const debounceRef = useRef(null);
    const [center] = useState([21.0285, 105.8544]); // Default Hanoi
    const searchParams = useSearchParams();

    // Province: filters prop takes priority over URL param
    const urlProvinceCode = searchParams?.get('province') || null;
    const provinceCode = filters.provinceCode || urlProvinceCode;

    // Wait for map to center before querying when province is set
    const [mapCentered, setMapCentered] = useState(!provinceCode);

    // Reset mapCentered when province changes (re-center map)
    useEffect(() => {
        setMapCentered(!provinceCode);
    }, [provinceCode]);

    // SWR key — only activate after map is centered (avoids wrong-viewport query)
    const key = bounds && mapCentered
        ? JSON.stringify({ fn: "properties_in_view", ...bounds, ...filters, province: provinceCode })
        : null;

    // Fetch data
    const { data, error, isLoading } = useSWR(key, async () => {
        const supabase = getSupabase();
        const { data, error } = await supabase.rpc("properties_in_view", {
            min_lat: bounds.south,
            min_lng: bounds.west,
            max_lat: bounds.north,
            max_lng: bounds.east,
            filter_type_name: filters.propertyTypeName || null,
            filter_listing: filters.listingType || null,
            min_price: filters.minPrice || null,
            max_price: filters.maxPrice || null,
            min_area: filters.minArea || null,
            max_area: filters.maxArea || null,
            min_bedrooms: filters.minBedrooms || null,
            min_bathrooms: filters.minBathrooms || null,
            filter_province: provinceCode,
            filter_category_id: filters.categoryId || null,
            filter_district: filters.districtCode || null,
            filter_ward: filters.wardCode || null,
            filter_legal_status: filters.legalStatus || null,
            filter_keyword: filters.keyword || null,
            filter_amenities: filters.amenities?.length ? filters.amenities : null,
        });

        if (error) throw error;
        return data || [];
    });

    const properties = data || EMPTY_ARRAY;

    // Debounced bounds update
    const onBoundsChanged = useCallback((map) => {
        if (!map || typeof map.getBounds !== 'function') return;

        const mapBounds = map.getBounds();
        if (!mapBounds) return;

        const ne = mapBounds.getNorthEast();
        const sw = mapBounds.getSouthWest();

        const newBounds = {
            north: ne.lat,
            east: ne.lng,
            south: sw.lat,
            west: sw.lng,
        };

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setBounds(newBounds), 300);
    }, []);

    // Notify parent
    useEffect(() => {
        if (onDataChange) onDataChange(properties, isLoading);
    }, [properties, isLoading]);

    return (
        <div style={{ height, position: "relative", width: "100%" }}>
            {isLoading && (
                <div style={{
                    position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)",
                    zIndex: 1000, background: "rgba(0,0,0,0.8)", color: "#fff",
                    padding: "8px 20px", borderRadius: "30px", fontSize: "14px",
                    boxShadow: "0 4px 15px rgba(0,0,0,0.2)"
                }}>
                    Đang tìm {properties.length} BĐS...
                </div>
            )}

            <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <InvalidateSize />
                <MapEvents onBoundsChanged={onBoundsChanged} />
                <MapController provinceCode={provinceCode} onCentered={() => setMapCentered(true)} />

                {properties.map((prop) => (
                    <Marker
                        key={prop.id}
                        position={[prop.lat || 21.0285, prop.lng || 105.8544]}
                        icon={createCustomMarkerIcon(prop.listing_type === 'rent')}
                    >
                        <Popup className="property-map-popup">
                            <div style={{ width: "260px", overflow: "hidden", fontFamily: "inherit" }}>
                                <div style={{ position: "relative", height: "150px", overflow: "hidden" }}>
                                    <Image
                                        src={prop.image_url || "/images/common/property-placeholder.jpg"}
                                        alt={prop.title}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                                <div style={{ padding: "12px" }}>
                                    <p style={{ fontSize: "12px", color: "#888", marginBottom: "6px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                                        {prop.address}
                                    </p>
                                    <Link
                                        href={`/property-details/${prop.slug || prop.id}`}
                                        style={{ fontWeight: 700, fontSize: "14px", color: "#1a1a1a", display: "block", marginBottom: "8px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}
                                    >
                                        {prop.title}
                                    </Link>
                                    <div style={{ display: "flex", gap: "12px", fontSize: "12px", color: "#555", marginBottom: "10px" }}>
                                        <span><span className="icon icon-bed me-1" />{prop.bedrooms || 0} PN</span>
                                        <span><span className="icon icon-bath me-1" />{prop.bathrooms || 0} WC</span>
                                        <span><span className="icon icon-sqft me-1" />{formatArea(prop.area)}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                                        <span style={{ fontWeight: 700, color: "#e74c3c", fontSize: "16px" }}>
                                            {formatPrice(prop.price)}
                                        </span>
                                        <Link
                                            href={`/property-details/${prop.slug || prop.id}`}
                                            style={{ fontSize: "12px", color: "#2563eb", textDecoration: "underline" }}
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
