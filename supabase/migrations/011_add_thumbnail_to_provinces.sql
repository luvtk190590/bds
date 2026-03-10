-- Migration 011: Add thumbnail_url to provinces table

ALTER TABLE public.provinces
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

COMMENT ON COLUMN public.provinces.thumbnail_url IS 'URL ảnh đại diện hoặc ảnh tiêu biểu của tỉnh/thành phố';
