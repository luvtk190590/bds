-- Migration 036: Property Views Tracking

CREATE TABLE IF NOT EXISTS public.property_views (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewed_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pviews_property_id ON public.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_pviews_viewed_at   ON public.property_views(viewed_at);

ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

-- Ai cũng có thể ghi lượt xem (kể cả ẩn danh)
CREATE POLICY "pviews_insert"
  ON public.property_views FOR INSERT
  WITH CHECK (true);

-- Chủ tin xem được lượt xem của tin mình
CREATE POLICY "pviews_select_owner"
  ON public.property_views FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM public.properties
      WHERE owner_id = (
        SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Admin xem tất cả
CREATE POLICY "pviews_select_admin"
  ON public.property_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );
