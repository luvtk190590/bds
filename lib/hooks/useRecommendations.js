"use client";

import useSWR, { mutate as globalMutate } from "swr";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

/**
 * Hook lấy BĐS gợi ý cho user (enhanced scoring)
 */
export function useRecommendations(profileId, limit = 10) {
    const { data, error, isLoading, mutate } = useSWR(
        profileId ? `recommendations-${profileId}` : null,
        async () => {
            const { data, error } = await supabase.rpc("get_recommendations", {
                p_user_id: profileId,
                p_limit: limit,
            });

            if (error) throw error;
            return data || [];
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    );

    return { recommendations: data || [], isLoading, error, mutate };
}

/**
 * Hook lấy hồ sơ sở thích của user (preference profile)
 */
export function useUserPreferences(profileId) {
    const { data, error, isLoading } = useSWR(
        profileId ? `user-preferences-${profileId}` : null,
        async () => {
            const { data, error } = await supabase.rpc(
                "get_user_preference_profile",
                { p_user_id: profileId }
            );

            if (error) throw error;
            // RPC returns array, take first row
            return data?.[0] || null;
        },
        {
            revalidateOnFocus: false,
            dedupingInterval: 120000, // Cache 2 phút
        }
    );

    return { preferences: data, isLoading, error };
}

/**
 * Hook quản lý Favorites — toggleFavorite triggers recommendation refresh
 */
export function useFavorites(profileId) {
    const { data, error, isLoading, mutate } = useSWR(
        profileId ? `favorites-${profileId}` : null,
        async () => {
            const { data, error } = await supabase
                .from("favorites")
                .select(
                    `
          id,
          created_at,
          property:properties(
            id, title, slug, price, listing_type, area, bedrooms, bathrooms, address,
            property_type:property_types(name),
            images:property_images(url, is_primary)
          )
        `
                )
                .eq("user_id", profileId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data || [];
        }
    );

    const toggleFavorite = async (propertyId) => {
        const existing = data?.find((f) => f.property?.id === propertyId);

        if (existing) {
            await supabase.from("favorites").delete().eq("id", existing.id);
        } else {
            await supabase
                .from("favorites")
                .insert({ user_id: profileId, property_id: propertyId });
        }

        // Revalidate favorites list
        mutate();

        // Also revalidate recommendations & preferences (favorites changed → scoring changes)
        globalMutate(`recommendations-${profileId}`);
        globalMutate(`user-preferences-${profileId}`);
    };

    const isFavorited = (propertyId) => {
        return data?.some((f) => f.property?.id === propertyId) || false;
    };

    return {
        favorites: data || [],
        isLoading,
        error,
        toggleFavorite,
        isFavorited,
        mutate,
    };
}

/**
 * Track lượt xem BĐS (gọi từ trang chi tiết)
 * Sau khi track → cũng revalidate recommendations
 */
export async function trackPropertyView(
    profileId,
    propertyId,
    durationSeconds
) {
    if (!profileId || !propertyId) return;

    const supabase = createClient();
    await supabase.rpc("track_property_view", {
        p_user_id: profileId,
        p_property_id: propertyId,
        p_duration: durationSeconds,
    });

    // Revalidate recommendations if viewed > 30s (threshold for scoring)
    if (durationSeconds > 30) {
        globalMutate(`recommendations-${profileId}`);
        globalMutate(`user-preferences-${profileId}`);
    }
}
