-- Migration 029: Storage bucket cho ảnh blog

INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Cho phép authenticated users upload
CREATE POLICY "Authenticated upload blog images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-images');

-- Cho phép public đọc
CREATE POLICY "Public read blog images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'blog-images');

-- Cho phép user xóa ảnh của mình
CREATE POLICY "Authenticated delete blog images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-images');
