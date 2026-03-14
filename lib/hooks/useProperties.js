"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook lấy danh sách BĐS với filter, search, pagination
 */
export function useProperties({
    searchQuery = "",
    filterType = null,
    filterListing = null,
    minPrice = null,
    maxPrice = null,
    filterProvince = null,
    filterDistrict = null,
    sortBy = "newest",
    page = 1,
    pageSize = 20,
} = {}) {
    const supabase = createClient();
    const key = JSON.stringify({
        fn: "search_properties",
        searchQuery,
        filterType,
        filterListing,
        minPrice,
        maxPrice,
        filterProvince,
        filterDistrict,
        sortBy,
        page,
        pageSize,
    });

    const { data, error, isLoading, mutate } = useSWR(key, async () => {
        const { data, error } = await supabase.rpc("search_properties", {
            search_query: searchQuery || null,
            filter_type: filterType,
            filter_listing: filterListing,
            min_price: minPrice,
            max_price: maxPrice,
            filter_province: filterProvince,
            filter_district: filterDistrict,
            sort_by: sortBy,
            page_number: page,
            page_size: pageSize,
        });

        if (error) throw error;
        return {
            properties: data || [],
            totalCount: data?.[0]?.total_count || 0,
            totalPages: Math.ceil((data?.[0]?.total_count || 0) / pageSize),
        };
    }, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        keepPreviousData: true,
        dedupingInterval: 30000,
    });

    return {
        properties: data?.properties || [],
        totalCount: data?.totalCount || 0,
        totalPages: data?.totalPages || 0,
        isLoading,
        error,
        mutate,
    };
}

/**
 * Hook lấy chi tiết 1 BĐS theo slug
 */
export function useProperty(slug) {
    const { data, error, isLoading } = useSWR(
        slug ? `property-${slug}` : null,
        async () => {
            const { data, error } = await supabase
                .from("properties")
                .select(
                    `
          *,
          property_type:property_types(*),
          owner:profiles!owner_id(id, full_name, phone, email, avatar_url, role, company_name),
          images:property_images(id, url, sort_order, is_primary),
          province:provinces(code, name),
          district:districts(code, name),
          ward:wards(code, name)
        `
                )
                .eq("slug", slug)
                .single();

            if (error) throw error;
            return data;
        },
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            dedupingInterval: 60000,
            keepPreviousData: true,
        }
    );

    return { property: data, isLoading, error };
}

/**
 * Hook lấy danh sách BĐS mới nhất cho widget sidebar
 */
export function useLatestProperties(excludeId, limit = 5) {
    const { data, error, isLoading } = useSWR(
        `latest-properties-${excludeId}-${limit}`,
        async () => {
            const { data, error } = await supabase
                .from("properties")
                .select(`
          id, title, slug, price, listing_type, area, bedrooms, bathrooms,
          images:property_images(url, is_primary)
        `)
                .eq("status", "approved")
                .eq("property_images.is_primary", true)
                .neq("id", excludeId ?? "00000000-0000-0000-0000-000000000000")
                .order("created_at", { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data;
        }
    );

    return { properties: data || [], isLoading, error };
}

/**
 * Hook lấy BĐS của user hiện tại (dashboard)
 */
export function useMyProperties(ownerId, status = null) {
    const { data, error, isLoading, mutate } = useSWR(
        ownerId ? `my-properties-${ownerId}-${status}` : null,
        async () => {
            let query = supabase
                .from("properties")
                .select(
                    `
          *,
          property_type:property_types(name),
          images:property_images(id, url, is_primary)
        `
                )
                .eq("owner_id", ownerId)
                .order("created_at", { ascending: false });

            if (status) {
                query = query.eq("status", status);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data;
        }
    );

    return { properties: data || [], isLoading, error, mutate };
}

/**
 * Hook lấy BĐS pending (admin)
 */
export function usePendingProperties() {
    const { data, error, isLoading, mutate } = useSWR(
        "pending-properties",
        async () => {
            const { data, error } = await supabase
                .from("properties")
                .select(
                    `
          *,
          property_type:property_types(name),
          owner:profiles!owner_id(full_name, phone, email, role),
          images:property_images(id, url, is_primary)
        `
                )
                .eq("status", "pending")
                .order("created_at", { ascending: true });

            if (error) throw error;
            return data;
        }
    );

    return { properties: data || [], isLoading, error, mutate };
}

/**
 * Tạo BĐS mới
 */
export async function createProperty(propertyData) {
    const { data, error } = await supabase
        .from("properties")
        .insert(propertyData)
        .select()
        .single();

    return { data, error };
}

/**
 * Cập nhật BĐS
 */
export async function updateProperty(propertyId, updates) {
    const { data, error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", propertyId)
        .select()
        .single();

    return { data, error };
}

/**
 * Admin duyệt/từ chối BĐS
 */
export async function approveProperty(propertyId) {
    return updateProperty(propertyId, {
        status: "approved",
        approved_at: new Date().toISOString(),
    });
}

export async function rejectProperty(propertyId, reason) {
    return updateProperty(propertyId, {
        status: "rejected",
        rejection_reason: reason,
    });
}
