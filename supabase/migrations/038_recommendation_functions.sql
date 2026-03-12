-- Migration 038: Recommendation & View Tracking Functions

-- ── Bảng lịch sử xem của user đã đăng nhập (dùng cho gợi ý) ──
CREATE TABLE IF NOT EXISTS public.user_view_history (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id   UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  duration_sec  INT  DEFAULT 0,
  viewed_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_uvh_user_id     ON public.user_view_history(user_id);
CREATE INDEX IF NOT EXISTS idx_uvh_property_id ON public.user_view_history(property_id);
CREATE INDEX IF NOT EXISTS idx_uvh_viewed_at   ON public.user_view_history(viewed_at DESC);

ALTER TABLE public.user_view_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uvh_select_own" ON public.user_view_history FOR SELECT
  USING (user_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "uvh_insert_own" ON public.user_view_history FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- ── track_property_view ──
CREATE OR REPLACE FUNCTION public.track_property_view(
  p_user_id    UUID,
  p_property_id UUID,
  p_duration   INT DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_view_history(user_id, property_id, duration_sec)
  VALUES (p_user_id, p_property_id, p_duration);
END;
$$;

-- ── get_user_preference_profile ──
CREATE OR REPLACE FUNCTION public.get_user_preference_profile(p_user_id UUID)
RETURNS TABLE (
  fav_type_ids        UUID[],
  fav_listing_types   TEXT[],
  avg_price           NUMERIC,
  view_count          INT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ARRAY(
      SELECT DISTINCT p.property_type_id
      FROM public.favorites f
      JOIN public.properties p ON p.id = f.property_id
      WHERE f.user_id = p_user_id AND p.property_type_id IS NOT NULL
      LIMIT 5
    ) AS fav_type_ids,
    ARRAY(
      SELECT DISTINCT p.listing_type
      FROM public.favorites f
      JOIN public.properties p ON p.id = f.property_id
      WHERE f.user_id = p_user_id AND p.listing_type IS NOT NULL
    ) AS fav_listing_types,
    (
      SELECT AVG(p.price)
      FROM public.favorites f
      JOIN public.properties p ON p.id = f.property_id
      WHERE f.user_id = p_user_id AND p.price > 0
    ) AS avg_price,
    (
      SELECT COUNT(*)::INT FROM public.user_view_history WHERE user_id = p_user_id
    ) AS view_count;
END;
$$;

-- ── get_recommendations ──
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
BEGIN
  -- Lấy preference của user
  SELECT pref.fav_type_ids, pref.fav_listing_types, pref.avg_price
  INTO v_fav_type_ids, v_fav_listing_types, v_avg_price
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

      -- Tính điểm
      (
        CASE WHEN array_length(v_fav_type_ids, 1) > 0 AND p.property_type_id = ANY(v_fav_type_ids) THEN 4 ELSE 0 END
        + CASE WHEN array_length(v_fav_listing_types, 1) > 0 AND p.listing_type = ANY(v_fav_listing_types) THEN 2 ELSE 0 END
        + CASE WHEN v_avg_price IS NOT NULL AND p.price BETWEEN v_avg_price * 0.5 AND v_avg_price * 1.5 THEN 3 ELSE 0 END
        + CASE WHEN p.created_at > now() - interval '30 days' THEN 1 ELSE 0 END
      )::NUMERIC AS score,

      -- Lý do phù hợp
      ARRAY_REMOVE(ARRAY[
        CASE WHEN array_length(v_fav_type_ids, 1) > 0 AND p.property_type_id = ANY(v_fav_type_ids) THEN 'Loại BĐS yêu thích' ELSE NULL END,
        CASE WHEN array_length(v_fav_listing_types, 1) > 0 AND p.listing_type = ANY(v_fav_listing_types) THEN 'Hình thức phù hợp' ELSE NULL END,
        CASE WHEN v_avg_price IS NOT NULL AND p.price BETWEEN v_avg_price * 0.5 AND v_avg_price * 1.5 THEN 'Tầm giá phù hợp' ELSE NULL END,
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

GRANT EXECUTE ON FUNCTION public.track_property_view TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_preference_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_recommendations TO authenticated;
