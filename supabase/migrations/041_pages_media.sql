-- Migration 041: Site Pages & Media Library

-- ── Site Pages ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_pages (
  id               SERIAL PRIMARY KEY,
  title            TEXT        NOT NULL,
  slug             TEXT        UNIQUE NOT NULL,
  content          TEXT        DEFAULT '',
  excerpt          TEXT        DEFAULT '',
  meta_title       TEXT        DEFAULT '',
  meta_description TEXT        DEFAULT '',
  status           TEXT        DEFAULT 'published',  -- published | draft
  template         TEXT        DEFAULT 'default',
  sort_order       INT         DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pages_slug   ON public.site_pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.site_pages(status);

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pages_public_read" ON public.site_pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "pages_admin_all" ON public.site_pages
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin'
  );

-- Seed default pages
INSERT INTO public.site_pages (title, slug, status, sort_order, excerpt) VALUES
  ('Về chúng tôi',      'about-us',      'published', 1, 'Giới thiệu về HomeLengo'),
  ('Liên hệ',           'contact',       'published', 2, 'Thông tin liên hệ'),
  ('Câu hỏi thường gặp','faq',           'published', 3, 'Các câu hỏi thường gặp'),
  ('Dịch vụ',           'our-service',   'published', 4, 'Dịch vụ của chúng tôi'),
  ('Bảng giá',          'pricing',       'published', 5, 'Bảng giá dịch vụ'),
  ('Chính sách bảo mật','privacy-policy','published', 6, 'Chính sách bảo mật & điều khoản')
ON CONFLICT (slug) DO NOTHING;

-- ── Media Library ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.media_library (
  id            BIGSERIAL   PRIMARY KEY,
  filename      TEXT        NOT NULL,
  original_name TEXT        DEFAULT '',
  bucket        TEXT        NOT NULL DEFAULT 'site-assets',
  storage_path  TEXT        NOT NULL,
  url           TEXT        NOT NULL,
  mime_type     TEXT        DEFAULT 'image/webp',
  size          BIGINT      DEFAULT 0,
  alt_text      TEXT        DEFAULT '',
  width         INT,
  height        INT,
  uploaded_by   UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_bucket     ON public.media_library(bucket);
CREATE INDEX IF NOT EXISTS idx_media_created    ON public.media_library(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_uploader   ON public.media_library(uploaded_by);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_public_read" ON public.media_library
  FOR SELECT USING (true);

CREATE POLICY "media_admin_all" ON public.media_library
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin'
  );

-- Also allow site-assets bucket to be created (idempotent)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-assets', 'site-assets', true,
  10485760,
  ARRAY['image/jpeg','image/png','image/webp','image/svg+xml','image/gif']
)
ON CONFLICT (id) DO NOTHING;
