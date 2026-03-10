-- Migration 012: RPC for getting top provinces with property counts

DROP FUNCTION IF EXISTS public.get_top_provinces(integer);

CREATE OR REPLACE FUNCTION get_top_provinces(p_limit int DEFAULT 10)
RETURNS TABLE (
  code text,
  name text,
  thumbnail_url text,
  property_count bigint
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pr.code,
    pr.name,
    pr.thumbnail_url,
    COUNT(p.id) AS property_count
  FROM public.provinces pr
  LEFT JOIN public.properties p ON p.province_code = pr.code AND p.status = 'approved'
  GROUP BY pr.code, pr.name, pr.thumbnail_url
  ORDER BY property_count DESC
  LIMIT p_limit;
END;
$$;
