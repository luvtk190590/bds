-- Migration 034: Storage bucket cho ảnh bất động sản

INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Cho phép authenticated users upload ảnh BĐS
CREATE POLICY "Authenticated upload property images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

-- Cho phép public đọc ảnh BĐS
CREATE POLICY "Public read property images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'property-images');

-- Cho phép user cập nhật ảnh của mình
CREATE POLICY "Authenticated update property images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'property-images');

-- Cho phép user xóa ảnh của mình
CREATE POLICY "Authenticated delete property images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images');
