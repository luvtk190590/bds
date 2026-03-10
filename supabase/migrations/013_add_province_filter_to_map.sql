-- ============================================================
-- Migration 013: Add filter_province to properties_in_view
-- ============================================================

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
  min_bedrooms int DEFAULT NULL,
  filter_province text DEFAULT NULL
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
    AND (min_bedrooms IS NULL OR p.bedrooms >= min_bedrooms)
    AND (filter_province IS NULL OR p.province_code = filter_province);
$$;
