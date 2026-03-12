-- Migration 039: User Filter History (lưu sở thích tìm kiếm)

CREATE TABLE IF NOT EXISTS public.user_filter_history (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_type     TEXT,
  province_code    TEXT,
  district_code    TEXT,
  min_price        NUMERIC,
  max_price        NUMERIC,
  min_bedrooms     INT,
  applied_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ufh_user_id    ON public.user_filter_history(user_id);
CREATE INDEX IF NOT EXISTS idx_ufh_applied_at ON public.user_filter_history(applied_at DESC);

ALTER TABLE public.user_filter_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ufh_insert_own" ON public.user_filter_history FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "ufh_select_own" ON public.user_filter_history FOR SELECT
  USING (user_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- ── track_filter_usage ──
CREATE OR REPLACE FUNCTION public.track_filter_usage(
  p_user_id       UUID,
  p_listing_type  TEXT    DEFAULT NULL,
  p_province_code TEXT    DEFAULT NULL,
  p_district_code TEXT    DEFAULT NULL,
  p_min_price     NUMERIC DEFAULT NULL,
  p_max_price     NUMERIC DEFAULT NULL,
  p_min_bedrooms  INT     DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Chỉ lưu khi có ít nhất 1 trường có giá trị
  IF p_listing_type IS NULL AND p_province_code IS NULL AND p_min_price IS NULL
     AND p_max_price IS NULL AND p_min_bedrooms IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.user_filter_history(
    user_id, listing_type, province_code, district_code,
    min_price, max_price, min_bedrooms
  ) VALUES (
    p_user_id, p_listing_type, p_province_code, p_district_code,
    p_min_price, p_max_price, p_min_bedrooms
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.track_filter_usage TO authenticated;

-- ── Cập nhật get_user_preference_profile để tính cả filter history ──
CREATE OR REPLACE FUNCTION public.get_user_preference_profile(p_user_id UUID)
RETURNS TABLE (
  fav_type_ids        UUID[],
  fav_listing_types   TEXT[],
  avg_price           NUMERIC,
  view_count          INT,
  pref_province       TEXT,
  pref_listing_type   TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Loại BĐS yêu thích từ favorites
    ARRAY(
      SELECT DISTINCT p.property_type_id
      FROM public.favorites f
      JOIN public.properties p ON p.id = f.property_id
      WHERE f.user_id = p_user_id AND p.property_type_id IS NOT NULL
      LIMIT 5
    ) AS fav_type_ids,

    -- Hình thức yêu thích từ favorites + filter history
    ARRAY(
      SELECT listing_type FROM (
        SELECT p.listing_type, COUNT(*) w FROM public.favorites f
        JOIN public.properties p ON p.id = f.property_id
        WHERE f.user_id = p_user_id AND p.listing_type IS NOT NULL
        GROUP BY p.listing_type
        UNION ALL
        SELECT listing_type, COUNT(*) * 2 FROM public.user_filter_history
        WHERE user_id = p_user_id AND listing_type IS NOT NULL
        GROUP BY listing_type
      ) t GROUP BY listing_type ORDER BY SUM(w) DESC LIMIT 2
    ) AS fav_listing_types,

    -- Tầm giá trung bình từ favorites + filter history
    COALESCE(
      (SELECT AVG(price) FROM (
        SELECT p.price FROM public.favorites f
        JOIN public.properties p ON p.id = f.property_id
        WHERE f.user_id = p_user_id AND p.price > 0
        UNION ALL
        SELECT (COALESCE(min_price,0) + COALESCE(max_price,0)) / 2.0
        FROM public.user_filter_history
        WHERE user_id = p_user_id AND (min_price IS NOT NULL OR max_price IS NOT NULL)
      ) prices WHERE price > 0),
      NULL
    ) AS avg_price,

    -- Số lần xem
    (SELECT COUNT(*)::INT FROM public.user_view_history WHERE user_id = p_user_id) AS view_count,

    -- Tỉnh ưa thích nhất từ filter history
    (
      SELECT province_code FROM public.user_filter_history
      WHERE user_id = p_user_id AND province_code IS NOT NULL
      GROUP BY province_code ORDER BY COUNT(*) DESC LIMIT 1
    ) AS pref_province,

    -- Hình thức tìm kiếm nhiều nhất từ filter history
    (
      SELECT listing_type FROM public.user_filter_history
      WHERE user_id = p_user_id AND listing_type IS NOT NULL
      GROUP BY listing_type ORDER BY COUNT(*) DESC LIMIT 1
    ) AS pref_listing_type;
END;
$$;

-- ── Cập nhật get_recommendations để dùng location preference ──
CREATE OR REPLACE FUNCTION public.get_recommendations(
  p_user_id UUID,
  p_limit   INT DEFAULT 8
)
RETURNS TABLE (
  id            UUID,
  title         TEXT,
  slug          TEXT,
  price         NUMERIC,
  listing_type  TEXT,
  area          NUMERIC,
  bedrooms      INT,
  address       TEXT,
  image_url     TEXT,
  score         NUMERIC,
  match_reasons TEXT[],
  owner_name    TEXT,
  owner_avatar  TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_fav_type_ids      UUID[];
  v_fav_listing_types TEXT[];
  v_avg_price         NUMERIC;
  v_pref_province     TEXT;
  v_pref_listing_type TEXT;
BEGIN
  SELECT pref.fav_type_ids, pref.fav_listing_types, pref.avg_price,
         pref.pref_province, pref.pref_listing_type
  INTO v_fav_type_ids, v_fav_listing_types, v_avg_price,
       v_pref_province, v_pref_listing_type
  FROM public.get_user_preference_profile(p_user_id) pref;

  RETURN QUERY
  WITH scored AS (
    SELECT
      p.id,
      p.title,
      p.slug,
      p.price,
      p.listing_type,
      p.area,
      p.bedrooms,
      p.address,
      img.url AS image_url,

      -- Điểm số
      (
        CASE WHEN array_length(v_fav_type_ids, 1) > 0 AND p.property_type_id = ANY(v_fav_type_ids) THEN 4 ELSE 0 END
        + CASE WHEN array_length(v_fav_listing_types, 1) > 0 AND p.listing_type = ANY(v_fav_listing_types) THEN 2 ELSE 0 END
        + CASE WHEN v_pref_listing_type IS NOT NULL AND p.listing_type = v_pref_listing_type THEN 1 ELSE 0 END
        + CASE WHEN v_avg_price IS NOT NULL AND p.price BETWEEN v_avg_price * 0.5 AND v_avg_price * 1.5 THEN 3 ELSE 0 END
        + CASE WHEN v_pref_province IS NOT NULL AND p.province_code = v_pref_province THEN 2 ELSE 0 END
        + CASE WHEN p.created_at > now() - interval '30 days' THEN 1 ELSE 0 END
      )::NUMERIC AS score,

      -- Lý do phù hợp
      ARRAY_REMOVE(ARRAY[
        CASE WHEN array_length(v_fav_type_ids, 1) > 0 AND p.property_type_id = ANY(v_fav_type_ids) THEN 'Loại BĐS yêu thích' ELSE NULL END,
        CASE WHEN array_length(v_fav_listing_types, 1) > 0 AND p.listing_type = ANY(v_fav_listing_types) THEN 'Hình thức phù hợp' ELSE NULL END,
        CASE WHEN v_avg_price IS NOT NULL AND p.price BETWEEN v_avg_price * 0.5 AND v_avg_price * 1.5 THEN 'Tầm giá phù hợp' ELSE NULL END,
        CASE WHEN v_pref_province IS NOT NULL AND p.province_code = v_pref_province THEN 'Khu vực quan tâm' ELSE NULL END,
        CASE WHEN p.created_at > now() - interval '30 days' THEN 'Tin mới đăng' ELSE NULL END
      ], NULL) AS match_reasons,

      pr.full_name  AS owner_name,
      pr.avatar_url AS owner_avatar

    FROM public.properties p
    LEFT JOIN public.profiles pr ON pr.id = p.owner_id
    LEFT JOIN LATERAL (
      SELECT url FROM public.property_images
      WHERE property_id = p.id
      ORDER BY is_primary DESC, id ASC
      LIMIT 1
    ) img ON true
    WHERE
      p.approval_status = 'approved'
      AND p.id NOT IN (
        SELECT f.property_id FROM public.favorites f WHERE f.user_id = p_user_id
      )
      AND p.owner_id != p_user_id
  )
  SELECT * FROM scored
  ORDER BY score DESC, id DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_preference_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recommendations TO authenticated;
