-- Migration 037: Storage bucket cho ảnh đại diện (avatars)

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public đọc được ảnh đại diện
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

-- Authenticated user upload ảnh đại diện
CREATE POLICY "Authenticated upload avatars"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- Authenticated user cập nhật ảnh đại diện
CREATE POLICY "Authenticated update avatars"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'avatars');

-- Authenticated user xóa ảnh đại diện
CREATE POLICY "Authenticated delete avatars"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'avatars');
