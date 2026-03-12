import { createClient } from "@/lib/supabase/client";

/**
 * Ghi lại hành động tìm kiếm/lọc của user vào user_filter_history
 * Dùng fire-and-forget (không await), không block UI
 */
export function trackFilterUsage(profileId, filters = {}) {
  if (!profileId) return;

  const {
    listingType, listing_type, lt,
    province, provinceCode, prov,
    district, districtCode, dist,
    minPrice, min_price,
    maxPrice, max_price,
    minBedrooms, min_bedrooms,
  } = filters;

  const resolvedListingType = listingType ?? listing_type ?? lt ?? null;
  const resolvedProvince    = province ?? provinceCode ?? prov ?? null;
  const resolvedDistrict    = district ?? districtCode ?? dist ?? null;
  const resolvedMinPrice    = minPrice  ?? min_price  ?? null;
  const resolvedMaxPrice    = maxPrice  ?? max_price  ?? null;
  const resolvedBedrooms    = minBedrooms ?? min_bedrooms ?? null;

  // Không lưu nếu không có gì đáng kể
  if (!resolvedListingType && !resolvedProvince && !resolvedMinPrice && !resolvedMaxPrice && !resolvedBedrooms) return;

  createClient().rpc("track_filter_usage", {
    p_user_id:       profileId,
    p_listing_type:  resolvedListingType,
    p_province_code: resolvedProvince,
    p_district_code: resolvedDistrict,
    p_min_price:     resolvedMinPrice  ? Number(resolvedMinPrice)  : null,
    p_max_price:     resolvedMaxPrice  ? Number(resolvedMaxPrice)  : null,
    p_min_bedrooms:  resolvedBedrooms  ? Number(resolvedBedrooms)  : null,
  }).then(() => {}).catch(() => {});
}
