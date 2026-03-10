-- ============================================================
-- Migration 004: Database Functions
-- (Spatial queries, search, recommendations)
-- ============================================================

-- -----------------------------------------------
-- 1. Tìm BĐS trong bounding box (khi cuộn bản đồ)
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION properties_in_view(
  min_lat float,
  min_lng float,
  max_lat float,
  max_lng float,
  filter_type int DEFAULT NULL,
  filter_listing text DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  min_area numeric DEFAULT NULL,
  max_area numeric DEFAULT NULL,
  min_bedrooms int DEFAULT NULL
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
  property_type_name text,
  image_url text,
  owner_name text
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT
    p.id,
    p.title,
    p.slug,
    p.price,
    p.listing_type,
    p.area,
    p.bedrooms,
    p.bathrooms,
    p.address,
    extensions.ST_Y(p.location::extensions.geometry) AS lat,
    extensions.ST_X(p.location::extensions.geometry) AS lng,
    pt.name AS property_type_name,
    (SELECT pi.url FROM public.property_images pi WHERE pi.property_id = p.id AND pi.is_primary LIMIT 1) AS image_url,
    pr.full_name AS owner_name
  FROM public.properties p
  LEFT JOIN public.property_types pt ON pt.id = p.property_type_id
  LEFT JOIN public.profiles pr ON pr.id = p.owner_id
  WHERE p.status = 'approved'
    AND p.location OPERATOR(extensions.&&) extensions.ST_SetSRID(
      extensions.ST_MakeBox2D(
        extensions.ST_Point(min_lng, min_lat),
        extensions.ST_Point(max_lng, max_lat)
      ), 4326
    )
    AND (filter_type IS NULL OR p.property_type_id = filter_type)
    AND (filter_listing IS NULL OR p.listing_type = filter_listing)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (min_area IS NULL OR p.area >= min_area)
    AND (max_area IS NULL OR p.area <= max_area)
    AND (min_bedrooms IS NULL OR p.bedrooms >= min_bedrooms);
$$;

-- -----------------------------------------------
-- 2. Tìm BĐS gần một điểm (nearby)
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION nearby_properties(
  lat float,
  lng float,
  radius_km float DEFAULT 5,
  result_limit int DEFAULT 20
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  price numeric,
  listing_type text,
  area numeric,
  bedrooms int,
  address text,
  property_lat float,
  property_lng float,
  distance_km float,
  image_url text
)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT
    p.id,
    p.title,
    p.slug,
    p.price,
    p.listing_type,
    p.area,
    p.bedrooms,
    p.address,
    extensions.ST_Y(p.location::extensions.geometry) AS property_lat,
    extensions.ST_X(p.location::extensions.geometry) AS property_lng,
    extensions.ST_Distance(p.location, extensions.ST_Point(lng, lat)::extensions.geography) / 1000.0 AS distance_km,
    (SELECT pi.url FROM public.property_images pi WHERE pi.property_id = p.id AND pi.is_primary LIMIT 1) AS image_url
  FROM public.properties p
  WHERE p.status = 'approved'
    AND extensions.ST_DWithin(p.location, extensions.ST_Point(lng, lat)::extensions.geography, radius_km * 1000)
  ORDER BY p.location OPERATOR(extensions.<->) extensions.ST_Point(lng, lat)::extensions.geography
  LIMIT result_limit;
$$;

-- -----------------------------------------------
-- 3. Full Text Search BĐS
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION search_properties(
  search_query text,
  filter_type int DEFAULT NULL,
  filter_listing text DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  filter_province text DEFAULT NULL,
  filter_district text DEFAULT NULL,
  sort_by text DEFAULT 'relevance',
  page_number int DEFAULT 1,
  page_size int DEFAULT 20
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
  province_code text,
  district_code text,
  lat float,
  lng float,
  property_type_name text,
  image_url text,
  owner_name text,
  created_at timestamptz,
  rank real,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.slug,
    p.price,
    p.listing_type,
    p.area,
    p.bedrooms,
    p.bathrooms,
    p.address,
    p.province_code,
    p.district_code,
    extensions.ST_Y(p.location::extensions.geometry) AS lat,
    extensions.ST_X(p.location::extensions.geometry) AS lng,
    pt.name AS property_type_name,
    (SELECT pi.url FROM public.property_images pi WHERE pi.property_id = p.id AND pi.is_primary LIMIT 1) AS image_url,
    pr.full_name AS owner_name,
    p.created_at,
    CASE
      WHEN search_query IS NOT NULL AND search_query <> ''
      THEN ts_rank(p.fts, websearch_to_tsquery('simple', search_query))
      ELSE 0
    END AS rank,
    COUNT(*) OVER() AS total_count
  FROM public.properties p
  LEFT JOIN public.property_types pt ON pt.id = p.property_type_id
  LEFT JOIN public.profiles pr ON pr.id = p.owner_id
  WHERE p.status = 'approved'
    AND (
      search_query IS NULL
      OR search_query = ''
      OR p.fts @@ websearch_to_tsquery('simple', search_query)
    )
    AND (filter_type IS NULL OR p.property_type_id = filter_type)
    AND (filter_listing IS NULL OR p.listing_type = filter_listing)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (filter_province IS NULL OR p.province_code = filter_province)
    AND (filter_district IS NULL OR p.district_code = filter_district)
  ORDER BY
    CASE WHEN sort_by = 'relevance' AND search_query IS NOT NULL AND search_query <> ''
      THEN ts_rank(p.fts, websearch_to_tsquery('simple', search_query))
    END DESC NULLS LAST,
    CASE WHEN sort_by = 'price_asc' THEN p.price END ASC,
    CASE WHEN sort_by = 'price_desc' THEN p.price END DESC,
    CASE WHEN sort_by = 'newest' OR sort_by = 'relevance' THEN p.created_at END DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$;

-- -----------------------------------------------
-- 4. Gợi ý BĐS dựa trên hành vi người dùng
-- -----------------------------------------------

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
  address text,
  lat float,
  lng float,
  image_url text,
  score float
)
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
DECLARE
  avg_price numeric;
  fav_types int[];
  fav_districts text[];
  avg_area numeric;
  fav_listing text;
BEGIN
  -- Thu thập thông tin sở thích từ favorites + views (> 30s)
  SELECT
    AVG(prop.price),
    ARRAY_AGG(DISTINCT prop.property_type_id) FILTER (WHERE prop.property_type_id IS NOT NULL),
    ARRAY_AGG(DISTINCT prop.district_code) FILTER (WHERE prop.district_code IS NOT NULL),
    AVG(prop.area),
    MODE() WITHIN GROUP (ORDER BY prop.listing_type)
  INTO avg_price, fav_types, fav_districts, avg_area, fav_listing
  FROM (
    SELECT prop2.* FROM public.favorites f
    JOIN public.properties prop2 ON prop2.id = f.property_id
    WHERE f.user_id = p_user_id
    UNION ALL
    SELECT prop3.* FROM public.property_views pv
    JOIN public.properties prop3 ON prop3.id = pv.property_id
    WHERE pv.user_id = p_user_id AND pv.view_duration_seconds > 30
  ) prop;

  -- Nếu chưa có dữ liệu sở thích, trả về BĐS mới nhất
  IF avg_price IS NULL THEN
    RETURN QUERY
    SELECT
      p.id, p.title, p.slug, p.price, p.listing_type,
      p.area, p.bedrooms, p.address,
      extensions.ST_Y(p.location::extensions.geometry) AS lat,
      extensions.ST_X(p.location::extensions.geometry) AS lng,
      (SELECT pi.url FROM public.property_images pi WHERE pi.property_id = p.id AND pi.is_primary LIMIT 1) AS image_url,
      0::float AS score
    FROM public.properties p
    WHERE p.status = 'approved'
    ORDER BY p.created_at DESC
    LIMIT p_limit;
    RETURN;
  END IF;

  -- Tính điểm gợi ý dựa trên sở thích
  RETURN QUERY
  SELECT
    p.id, p.title, p.slug, p.price, p.listing_type,
    p.area, p.bedrooms, p.address,
    extensions.ST_Y(p.location::extensions.geometry) AS lat,
    extensions.ST_X(p.location::extensions.geometry) AS lng,
    (SELECT pi.url FROM public.property_images pi WHERE pi.property_id = p.id AND pi.is_primary LIMIT 1) AS image_url,
    (
      -- Điểm loại BĐS: match = +3
      CASE WHEN fav_types IS NOT NULL AND p.property_type_id = ANY(fav_types) THEN 3.0 ELSE 0 END
      -- Điểm khu vực: match = +2
      + CASE WHEN fav_districts IS NOT NULL AND p.district_code = ANY(fav_districts) THEN 2.0 ELSE 0 END
      -- Điểm giá: càng gần avg_price càng cao (max +2)
      + CASE WHEN avg_price > 0
          THEN GREATEST(0, 2.0 * (1.0 - ABS(p.price - avg_price) / avg_price))
          ELSE 0 END
      -- Điểm diện tích: càng gần avg_area càng cao (max +1)
      + CASE WHEN avg_area > 0
          THEN GREATEST(0, 1.0 * (1.0 - ABS(p.area - avg_area) / avg_area))
          ELSE 0 END
      -- Điểm loại giao dịch: match = +1
      + CASE WHEN fav_listing IS NOT NULL AND p.listing_type = fav_listing THEN 1.0 ELSE 0 END
    ) AS score
  FROM public.properties p
  WHERE p.status = 'approved'
    -- Loại trừ BĐS đã thêm vào yêu thích
    AND p.id NOT IN (SELECT f.property_id FROM public.favorites f WHERE f.user_id = p_user_id)
  ORDER BY score DESC, p.created_at DESC
  LIMIT p_limit;
END;
$$;

-- -----------------------------------------------
-- 5. Đếm BĐS theo trạng thái (cho dashboard)
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION get_property_stats(p_owner_id uuid DEFAULT NULL)
RETURNS TABLE (
  total_properties bigint,
  approved bigint,
  pending bigint,
  rejected bigint,
  draft bigint,
  sold bigint,
  total_views bigint,
  total_favorites bigint
)
LANGUAGE plpgsql
STABLE
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) AS total_properties,
    COUNT(*) FILTER (WHERE p.status = 'approved') AS approved,
    COUNT(*) FILTER (WHERE p.status = 'pending') AS pending,
    COUNT(*) FILTER (WHERE p.status = 'rejected') AS rejected,
    COUNT(*) FILTER (WHERE p.status = 'draft') AS draft,
    COUNT(*) FILTER (WHERE p.status = 'sold') AS sold,
    COALESCE(SUM(p.view_count), 0) AS total_views,
    (SELECT COUNT(*) FROM public.favorites f WHERE f.property_id IN (SELECT p2.id FROM public.properties p2 WHERE p_owner_id IS NULL OR p2.owner_id = p_owner_id)) AS total_favorites
  FROM public.properties p
  WHERE p_owner_id IS NULL OR p.owner_id = p_owner_id;
END;
$$;

-- -----------------------------------------------
-- 6. Cập nhật sở thích người dùng khi xem BĐS
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION track_property_view(
  p_user_id uuid,
  p_property_id uuid,
  p_duration int DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  prop RECORD;
BEGIN
  -- Ghi lại lượt xem
  INSERT INTO public.property_views (user_id, property_id, view_duration_seconds)
  VALUES (p_user_id, p_property_id, p_duration);

  -- Tăng view count
  UPDATE public.properties SET view_count = view_count + 1 WHERE id = p_property_id;

  -- Cập nhật sở thích (chỉ khi xem > 10 giây)
  IF p_duration >= 10 THEN
    SELECT property_type_id, district_code, price, area
    INTO prop
    FROM public.properties WHERE id = p_property_id;

    -- Upsert interest: property_type
    IF prop.property_type_id IS NOT NULL THEN
      INSERT INTO public.user_interests (user_id, interest_type, interest_value, weight)
      VALUES (p_user_id, 'property_type', to_jsonb(prop.property_type_id), 1)
      ON CONFLICT (user_id, interest_type, (interest_value::text))
        DO UPDATE SET weight = public.user_interests.weight + 1, updated_at = now();
    END IF;

    -- Upsert interest: location (district)
    IF prop.district_code IS NOT NULL THEN
      INSERT INTO public.user_interests (user_id, interest_type, interest_value, weight)
      VALUES (p_user_id, 'location', to_jsonb(prop.district_code), 1)
      ON CONFLICT (user_id, interest_type, (interest_value::text))
        DO UPDATE SET weight = public.user_interests.weight + 1, updated_at = now();
    END IF;
  END IF;
END;
$$;
