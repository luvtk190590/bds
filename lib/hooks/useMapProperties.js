"use client";

import { useState, useCallback, useRef } from "react";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

const EMPTY_ARRAY = [];

/**
 * Hook quản lý BĐS trên bản đồ Leaflet
 * - Load BĐS theo viewport (bounding box)
 * - Debounce scroll/zoom events
 * - Filter trực tiếp trên map
 */
export function useMapProperties(filters = {}) {
    const [bounds, setBounds] = useState(null);
    const debounceRef = useRef(null);
    const supabaseRef = useRef(null);

    // Lazy init supabase client
    function getSupabase() {
        if (!supabaseRef.current) {
            supabaseRef.current = createClient();
        }
        return supabaseRef.current;
    }

    const key = bounds
        ? JSON.stringify({
            fn: "properties_in_view",
            ...bounds,
            ...filters,
        })
        : null;

    const { data, error, isLoading } = useSWR(key, async () => {
        const supabase = getSupabase();
        console.log("Fetching for bounds:", bounds);
        const { data, error } = await supabase.rpc("properties_in_view", {
            min_lat: bounds.south,
            min_lng: bounds.west,
            max_lat: bounds.north,
            max_lng: bounds.east,
            filter_type: filters.propertyType || null,
            filter_listing: filters.listingType || null,
            min_price: filters.minPrice || null,
            max_price: filters.maxPrice || null,
            min_area: filters.minArea || null,
            max_area: filters.maxArea || null,
            min_bedrooms: filters.minBedrooms || null,
        });

        if (error) {
            console.error("RPC Error:", error);
            throw error;
        }
        console.log("RPC returned count:", data?.length);
        return data || [];
    });

    // Debounced bounds update
    const onBoundsChanged = useCallback((map) => {
        if (!map || typeof map.getBounds !== 'function') return;

        const mapBounds = map.getBounds();
        if (!mapBounds) return;

        const ne = mapBounds.getNorthEast();
        const sw = mapBounds.getSouthWest();

        const newBounds = {
            north: typeof ne.lat === 'function' ? ne.lat() : ne.lat,
            east: typeof ne.lng === 'function' ? ne.lng() : ne.lng,
            south: typeof sw.lat === 'function' ? sw.lat() : sw.lat,
            west: typeof sw.lng === 'function' ? sw.lng() : sw.lng,
        };

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setBounds(newBounds);
        }, 300);
    }, []);

    return {
        properties: data || EMPTY_ARRAY,
        isLoading,
        error,
        onBoundsChanged,
        bounds,
    };
}

/**
 * Hook tìm BĐS gần vị trí hiện tại
 */
export function useNearbyProperties(lat, lng, radiusKm = 5) {
    const supabaseRef = useRef(null);

    function getSupabase() {
        if (!supabaseRef.current) {
            supabaseRef.current = createClient();
        }
        return supabaseRef.current;
    }

    const { data, error, isLoading } = useSWR(
        lat && lng ? `nearby-${lat}-${lng}-${radiusKm}` : null,
        async () => {
            const supabase = getSupabase();
            const { data, error } = await supabase.rpc("nearby_properties", {
                lat,
                lng,
                radius_km: radiusKm,
                result_limit: 20,
            });

            if (error) throw error;
            return data || [];
        }
    );

    return { properties: data || [], isLoading, error };
}
