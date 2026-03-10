-- ============================================================
-- Migration 006: Enhanced Recommendation Engine
-- Multi-factor scoring: price, location, area, bedrooms,
-- property type, listing type, spatial proximity
-- Favorites weighted ×3 vs Views ×1
-- ============================================================

-- -----------------------------------------------
-- 1. Nâng cấp get_recommendations với scoring chi tiết
-- -----------------------------------------------

DROP FUNCTION IF EXISTS get_recommendations(uuid, integer);

CREATE OR REPLACE FUNCTION get_recommendations(
  p_user_id uuid,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  price numeric,
  listing_type text,
  area numeric,
  bedrooms int,
  bathrooms int,
  address text,
  lat float,
  lng float,
  image_url text,
  property_type_name text,
  owner_name text,
  score float,
  match_reasons text[]
)
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  -- User preference profile
  pref_avg_price numeric;
  pref_avg_area numeric;
  pref_mode_bedrooms int;
  pref_mode_listing text;
  pref_types int[];
  pref_districts text[];
  pref_provinces text[];
  pref_center_lat float;
  pref_center_lng float;
  has_prefs boolean := false;
BEGIN
  -- ========================================
  -- Thu thập sở thích từ favorites (×3) + views >30s (×1)
  -- ========================================
  WITH weighted_properties AS (
    -- Favorites: trọng số ×3
    SELECT prop.*, 3 AS weight
    FROM public.favorites f
    JOIN public.properties prop ON prop.id = f.property_id
    WHERE f.user_id = p_user_id AND prop.status = 'approved'
    UNION ALL
    -- Views > 30 giây: trọng số ×1
    SELECT prop.*, 1 AS weight
    FROM public.property_views pv
    JOIN public.properties prop ON prop.id = pv.property_id
    WHERE pv.user_id = p_user_id
      AND pv.view_duration_seconds > 30
      AND prop.status = 'approved'
  )
  SELECT
    -- Giá trung bình (weighted)
    SUM(wp.price * wp.weight) / NULLIF(SUM(wp.weight), 0),
    -- Diện tích trung bình (weighted)
    SUM(wp.area * wp.weight) / NULLIF(SUM(CASE WHEN wp.area IS NOT NULL THEN wp.weight ELSE 0 END), 0),
    -- Phòng ngủ phổ biến nhất
    (SELECT sub.bedrooms FROM (
      SELECT wp2.bedrooms, SUM(wp2.weight) as total_w
      FROM weighted_properties wp2
      WHERE wp2.bedrooms IS NOT NULL AND wp2.bedrooms > 0
      GROUP BY wp2.bedrooms ORDER BY total_w DESC LIMIT 1
    ) sub),
    -- Loại giao dịch phổ biến nhất
    (SELECT sub.listing_type FROM (
      SELECT wp2.listing_type, SUM(wp2.weight) as total_w
      FROM weighted_properties wp2
      WHERE wp2.listing_type IS NOT NULL
      GROUP BY wp2.listing_type ORDER BY total_w DESC LIMIT 1
    ) sub),
    -- Loại BĐS yêu thích (top 3)
    ARRAY(
      SELECT DISTINCT sub.property_type_id FROM (
        SELECT wp2.property_type_id, SUM(wp2.weight) as total_w
        FROM weighted_properties wp2
        WHERE wp2.property_type_id IS NOT NULL
        GROUP BY wp2.property_type_id ORDER BY total_w DESC LIMIT 3
      ) sub
    ),
    -- Quận/Huyện yêu thích (top 5)
    ARRAY(
      SELECT DISTINCT sub.district_code FROM (
        SELECT wp2.district_code, SUM(wp2.weight) as total_w
        FROM weighted_properties wp2
        WHERE wp2.district_code IS NOT NULL
        GROUP BY wp2.district_code ORDER BY total_w DESC LIMIT 5
      ) sub
    ),
    -- Tỉnh yêu thích
    ARRAY(
      SELECT DISTINCT sub.province_code FROM (
        SELECT wp2.province_code, SUM(wp2.weight) as total_w
        FROM weighted_properties wp2
        WHERE wp2.province_code IS NOT NULL
        GROUP BY wp2.province_code ORDER BY total_w DESC LIMIT 3
      ) sub
    ),
    -- Trung tâm vị trí (weighted centroid)
    SUM(extensions.ST_Y(wp.location::extensions.geometry) * wp.weight) / NULLIF(SUM(CASE WHEN wp.location IS NOT NULL THEN wp.weight ELSE 0 END), 0),
    SUM(extensions.ST_X(wp.location::extensions.geometry) * wp.weight) / NULLIF(SUM(CASE WHEN wp.location IS NOT NULL THEN wp.weight ELSE 0 END), 0)
  INTO
    pref_avg_price, pref_avg_area, pref_mode_bedrooms, pref_mode_listing,
    pref_types, pref_districts, pref_provinces, pref_center_lat, pref_center_lng
  FROM weighted_properties wp;

  -- Kiểm tra có dữ liệu sở thích không
  has_prefs := pref_avg_price IS NOT NULL;

  -- ========================================
  -- Nếu chưa có data → trả về BĐS mới nhất
  -- ========================================
  IF NOT has_prefs THEN
    RETURN QUERY
    SELECT
      p.id, p.title, p.slug, p.price, p.listing_type,
      p.area, p.bedrooms, p.bathrooms, p.address,
      extensions.ST_Y(p.location::extensions.geometry) AS lat,
      extensions.ST_X(p.location::extensions.geometry) AS lng,
      (SELECT pi.url FROM public.property_images pi WHERE pi.property_id = p.id AND pi.is_primary LIMIT 1) AS image_url,
      pt.name AS property_type_name,
      pr.full_name AS owner_name,
      0::float AS score,
      ARRAY['Mới nhất']::text[] AS match_reasons
    FROM public.properties p
    LEFT JOIN public.property_types pt ON pt.id = p.property_type_id
    LEFT JOIN public.profiles pr ON pr.id = p.owner_id
    WHERE p.status = 'approved'
    ORDER BY p.created_at DESC
    LIMIT p_limit;
    RETURN;
  END IF;

  -- ========================================
  -- Tính điểm scoring (max 10 điểm)
  -- ========================================
  RETURN QUERY
  WITH scored AS (
    SELECT
      p.id, p.title, p.slug, p.price, p.listing_type,
      p.area, p.bedrooms, p.bathrooms, p.address,
      extensions.ST_Y(p.location::extensions.geometry) AS lat,
      extensions.ST_X(p.location::extensions.geometry) AS lng,
      (SELECT pi.url FROM public.property_images pi WHERE pi.property_id = p.id AND pi.is_primary LIMIT 1) AS image_url,
      pt.name AS property_type_name,
      pr.full_name AS owner_name,

      -- === SCORING ===
      (
        -- 1. Loại BĐS: max 2.0
        CASE WHEN pref_types IS NOT NULL AND p.property_type_id = ANY(pref_types) THEN 2.0 ELSE 0 END
        -- 2. Khu vực (quận/huyện): max 2.0
        + CASE
            WHEN pref_districts IS NOT NULL AND p.district_code = ANY(pref_districts) THEN 2.0
            WHEN pref_provinces IS NOT NULL AND p.province_code = ANY(pref_provinces) THEN 1.0
            ELSE 0
          END
        -- 3. Giá: max 2.0 (càng gần avg_price → càng cao)
        + CASE WHEN pref_avg_price > 0 AND p.price IS NOT NULL
            THEN GREATEST(0, 2.0 * (1.0 - LEAST(ABS(p.price - pref_avg_price) / pref_avg_price, 1.0)))
            ELSE 0
          END
        -- 4. Diện tích: max 1.5
        + CASE WHEN pref_avg_area > 0 AND p.area IS NOT NULL
            THEN GREATEST(0, 1.5 * (1.0 - LEAST(ABS(p.area - pref_avg_area) / pref_avg_area, 1.0)))
            ELSE 0
          END
        -- 5. Phòng ngủ: max 1.0
        + CASE
            WHEN pref_mode_bedrooms IS NOT NULL AND p.bedrooms = pref_mode_bedrooms THEN 1.0
            WHEN pref_mode_bedrooms IS NOT NULL AND ABS(p.bedrooms - pref_mode_bedrooms) = 1 THEN 0.5
            ELSE 0
          END
        -- 6. Loại giao dịch: max 0.5
        + CASE WHEN pref_mode_listing IS NOT NULL AND p.listing_type = pref_mode_listing THEN 0.5 ELSE 0 END
        -- 7. Khoảng cách vị trí (PostGIS): max 1.0
        + CASE
            WHEN pref_center_lat IS NOT NULL AND p.location IS NOT NULL THEN
              GREATEST(0, 1.0 * (1.0 - LEAST(
                extensions.ST_Distance(
                  p.location,
                  extensions.ST_SetSRID(extensions.ST_Point(pref_center_lng, pref_center_lat), 4326)::extensions.geography
                ) / 20000.0,  -- normalize by 20km
                1.0
              )))
            ELSE 0
          END
      ) AS score,

      -- === MATCH REASONS ===
      ARRAY_REMOVE(ARRAY[
        CASE WHEN pref_types IS NOT NULL AND p.property_type_id = ANY(pref_types) THEN 'Loại BĐS phù hợp' END,
        CASE WHEN pref_districts IS NOT NULL AND p.district_code = ANY(pref_districts) THEN 'Khu vực bạn quan tâm' END,
        CASE WHEN pref_avg_price > 0 AND p.price IS NOT NULL AND ABS(p.price - pref_avg_price) / pref_avg_price < 0.3 THEN 'Mức giá phù hợp' END,
        CASE WHEN pref_avg_area > 0 AND p.area IS NOT NULL AND ABS(p.area - pref_avg_area) / pref_avg_area < 0.3 THEN 'Diện tích phù hợp' END,
        CASE WHEN pref_mode_bedrooms IS NOT NULL AND p.bedrooms = pref_mode_bedrooms THEN 'Số phòng ngủ phù hợp' END,
        CASE WHEN pref_mode_listing IS NOT NULL AND p.listing_type = pref_mode_listing THEN 'Loại giao dịch phù hợp' END,
        CASE WHEN pref_center_lat IS NOT NULL AND p.location IS NOT NULL
          AND extensions.ST_Distance(p.location, extensions.ST_SetSRID(extensions.ST_Point(pref_center_lng, pref_center_lat), 4326)::extensions.geography) < 10000
          THEN 'Gần khu vực bạn quan tâm' END
      ], NULL) AS match_reasons

    FROM public.properties p
    LEFT JOIN public.property_types pt ON pt.id = p.property_type_id
    LEFT JOIN public.profiles pr ON pr.id = p.owner_id
    WHERE p.status = 'approved'
      -- Loại trừ BĐS đã yêu thích
      AND p.id NOT IN (SELECT f.property_id FROM public.favorites f WHERE f.user_id = p_user_id)
      -- Loại trừ BĐS đã xem (> 5 lần)
      AND p.id NOT IN (
        SELECT pv.property_id FROM public.property_views pv
        WHERE pv.user_id = p_user_id
        GROUP BY pv.property_id HAVING COUNT(*) > 5
      )
  )
  SELECT * FROM scored
  WHERE scored.score > 0
  ORDER BY scored.score DESC, scored.id
  LIMIT p_limit;
END;
$$;

-- -----------------------------------------------
-- 2. Hồ sơ sở thích người dùng (User Preference Profile)
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION get_user_preference_profile(p_user_id uuid)
RETURNS TABLE (
  avg_price numeric,
  avg_area numeric,
  preferred_bedrooms int,
  preferred_listing_type text,
  preferred_property_types jsonb,
  preferred_districts jsonb,
  preferred_provinces jsonb,
  total_views bigint,
  total_favorites bigint,
  center_lat float,
  center_lng float
)
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  WITH weighted_props AS (
    SELECT prop.*, 3 AS weight
    FROM public.favorites f
    JOIN public.properties prop ON prop.id = f.property_id
    WHERE f.user_id = p_user_id AND prop.status = 'approved'
    UNION ALL
    SELECT prop.*, 1 AS weight
    FROM public.property_views pv
    JOIN public.properties prop ON prop.id = pv.property_id
    WHERE pv.user_id = p_user_id AND pv.view_duration_seconds > 30 AND prop.status = 'approved'
  ),
  pref_types AS (
    SELECT pt.name, SUM(wp.weight) as total_w
    FROM weighted_props wp
    JOIN public.property_types pt ON pt.id = wp.property_type_id
    WHERE wp.property_type_id IS NOT NULL
    GROUP BY pt.name ORDER BY total_w DESC LIMIT 3
  ),
  pref_districts AS (
    SELECT d.name, SUM(wp.weight) as total_w
    FROM weighted_props wp
    JOIN public.districts d ON d.code = wp.district_code
    WHERE wp.district_code IS NOT NULL
    GROUP BY d.name ORDER BY total_w DESC LIMIT 5
  ),
  pref_provinces AS (
    SELECT prov.name, SUM(wp.weight) as total_w
    FROM weighted_props wp
    JOIN public.provinces prov ON prov.code = wp.province_code
    WHERE wp.province_code IS NOT NULL
    GROUP BY prov.name ORDER BY total_w DESC LIMIT 3
  )
  SELECT
    (SUM(wp.price * wp.weight) / NULLIF(SUM(wp.weight), 0))::numeric AS avg_price,
    (SUM(wp.area * wp.weight) / NULLIF(SUM(CASE WHEN wp.area IS NOT NULL THEN wp.weight ELSE 0 END), 0))::numeric AS avg_area,
    (SELECT sub.bedrooms FROM (
      SELECT wp2.bedrooms, SUM(wp2.weight) as total_w
      FROM weighted_props wp2
      WHERE wp2.bedrooms IS NOT NULL AND wp2.bedrooms > 0
      GROUP BY wp2.bedrooms ORDER BY total_w DESC LIMIT 1
    ) sub) AS preferred_bedrooms,
    (SELECT sub.listing_type FROM (
      SELECT wp2.listing_type, SUM(wp2.weight) as total_w
      FROM weighted_props wp2
      WHERE wp2.listing_type IS NOT NULL
      GROUP BY wp2.listing_type ORDER BY total_w DESC LIMIT 1
    ) sub) AS preferred_listing_type,
    (SELECT jsonb_agg(jsonb_build_object('name', pt2.name, 'weight', pt2.total_w)) FROM pref_types pt2) AS preferred_property_types,
    (SELECT jsonb_agg(jsonb_build_object('name', pd.name, 'weight', pd.total_w)) FROM pref_districts pd) AS preferred_districts,
    (SELECT jsonb_agg(jsonb_build_object('name', pp.name, 'weight', pp.total_w)) FROM pref_provinces pp) AS preferred_provinces,
    (SELECT COUNT(*) FROM public.property_views pv2 WHERE pv2.user_id = p_user_id) AS total_views,
    (SELECT COUNT(*) FROM public.favorites f2 WHERE f2.user_id = p_user_id) AS total_favorites,
    (SUM(extensions.ST_Y(wp.location::extensions.geometry) * wp.weight) / NULLIF(SUM(CASE WHEN wp.location IS NOT NULL THEN wp.weight ELSE 0 END), 0))::float AS center_lat,
    (SUM(extensions.ST_X(wp.location::extensions.geometry) * wp.weight) / NULLIF(SUM(CASE WHEN wp.location IS NOT NULL THEN wp.weight ELSE 0 END), 0))::float AS center_lng
  FROM weighted_props wp;
END;
$$;
