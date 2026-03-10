-- ============================================================
-- Migration 015: Add property_categories (for management/filtering)
-- Tách biệt với property_types (dùng cho frontend display)
-- ============================================================

-- -----------------------------------------------
-- 1. Tạo bảng property_categories
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS property_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INT DEFAULT 0
);

INSERT INTO property_categories (name, slug, sort_order) VALUES
  ('Căn hộ',               'can-ho',          1),
  ('Nhà phố',              'nha-pho',          2),
  ('Đất nền',              'dat-nen',          3),
  ('Biệt thự',             'biet-thu',         4),
  ('Nhà riêng',            'nha-rieng',        5),
  ('Nhà mặt phố',          'nha-mat-pho',      6),
  ('Nhà xưởng, kho bãi',  'nha-xuong-kho-bai', 7),
  ('BĐS khác',             'bds-khac',         8)
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------
-- 2. Thêm cột property_category_id vào properties
-- -----------------------------------------------

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS property_category_id INT REFERENCES property_categories(id);

CREATE INDEX IF NOT EXISTS idx_properties_category ON properties(property_category_id);

-- -----------------------------------------------
-- 3. Cập nhật properties_in_view — thêm filter_category_id
-- -----------------------------------------------

DROP FUNCTION IF EXISTS public.properties_in_view(float, float, float, float, text, text, numeric, numeric, numeric, numeric, int, int, text);

CREATE OR REPLACE FUNCTION properties_in_view(
  min_lat float,
  min_lng float,
  max_lat float,
  max_lng float,
  filter_type_name text DEFAULT NULL,
  filter_listing text DEFAULT NULL,
  min_price numeric DEFAULT NULL,
  max_price numeric DEFAULT NULL,
  min_area numeric DEFAULT NULL,
  max_area numeric DEFAULT NULL,
  min_bedrooms int DEFAULT NULL,
  min_bathrooms int DEFAULT NULL,
  filter_province text DEFAULT NULL,
  filter_category_id int DEFAULT NULL
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
  property_category_name text,
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
    pc.name AS property_category_name,
    (SELECT pi.url FROM public.property_images pi WHERE pi.property_id = p.id AND pi.is_primary LIMIT 1) AS image_url,
    pr.full_name AS owner_name
  FROM public.properties p
  LEFT JOIN public.property_types pt ON pt.id = p.property_type_id
  LEFT JOIN public.property_categories pc ON pc.id = p.property_category_id
  LEFT JOIN public.profiles pr ON pr.id = p.owner_id
  WHERE p.status = 'approved'
    AND p.location OPERATOR(extensions.&&) extensions.ST_SetSRID(
      extensions.ST_MakeBox2D(
        extensions.ST_Point(min_lng, min_lat),
        extensions.ST_Point(max_lng, max_lat)
      ), 4326
    )
    AND (filter_type_name IS NULL OR pt.name = filter_type_name)
    AND (filter_listing IS NULL OR p.listing_type = filter_listing)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (min_area IS NULL OR p.area >= min_area)
    AND (max_area IS NULL OR p.area <= max_area)
    AND (min_bedrooms IS NULL OR p.bedrooms >= min_bedrooms)
    AND (min_bathrooms IS NULL OR p.bathrooms >= min_bathrooms)
    AND (filter_province IS NULL OR p.province_code = filter_province)
    AND (filter_category_id IS NULL OR p.property_category_id = filter_category_id);
$$;

-- -----------------------------------------------
-- 4. Cập nhật search_properties — thêm filter_category_id
-- -----------------------------------------------

DROP FUNCTION IF EXISTS public.search_properties(text, integer, text, numeric, numeric, text, text, text, integer, integer);

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
  page_size int DEFAULT 20,
  filter_category_id int DEFAULT NULL
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
  property_category_name text,
  image_url text,
  owner_name text,
  owner_avatar text,
  total_count bigint
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
    p.province_code,
    p.district_code,
    extensions.ST_Y(p.location::extensions.geometry) AS lat,
    extensions.ST_X(p.location::extensions.geometry) AS lng,
    pt.name AS property_type_name,
    pc.name AS property_category_name,
    (SELECT pi.url FROM public.property_images pi WHERE pi.property_id = p.id AND pi.is_primary LIMIT 1) AS image_url,
    pr.full_name AS owner_name,
    pr.avatar_url AS owner_avatar,
    COUNT(*) OVER() AS total_count
  FROM public.properties p
  LEFT JOIN public.property_types pt ON pt.id = p.property_type_id
  LEFT JOIN public.property_categories pc ON pc.id = p.property_category_id
  LEFT JOIN public.profiles pr ON pr.id = p.owner_id
  WHERE p.status = 'approved'
    AND (search_query IS NULL OR search_query = '' OR p.fts @@ websearch_to_tsquery('simple', search_query))
    AND (filter_type IS NULL OR p.property_type_id = filter_type)
    AND (filter_listing IS NULL OR p.listing_type = filter_listing)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (filter_province IS NULL OR p.province_code = filter_province)
    AND (filter_district IS NULL OR p.district_code = filter_district)
    AND (filter_category_id IS NULL OR p.property_category_id = filter_category_id)
  ORDER BY
    CASE WHEN sort_by = 'relevance' AND search_query IS NOT NULL AND search_query <> ''
      THEN ts_rank(p.fts, websearch_to_tsquery('simple', search_query))
    END DESC NULLS LAST,
    CASE WHEN sort_by = 'price_asc'  THEN p.price END ASC  NULLS LAST,
    CASE WHEN sort_by = 'price_desc' THEN p.price END DESC NULLS LAST,
    p.created_at DESC
  LIMIT page_size OFFSET (page_number - 1) * page_size;
$$;
