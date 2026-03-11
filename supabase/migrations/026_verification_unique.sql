-- Migration 026: Add unique constraint on verification_requests(user_id) for upsert support
-- Chỉ giữ 1 request mới nhất per user

-- Xóa duplicate nếu có (giữ cái mới nhất)
DELETE FROM public.verification_requests vr1
  USING public.verification_requests vr2
  WHERE vr1.user_id = vr2.user_id
    AND vr1.created_at < vr2.created_at;

-- Thêm unique constraint
ALTER TABLE public.verification_requests
  DROP CONSTRAINT IF EXISTS verification_requests_user_id_key;

ALTER TABLE public.verification_requests
  ADD CONSTRAINT verification_requests_user_id_key UNIQUE (user_id);

-- Tạo storage bucket cho documents (nếu chưa có)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('documents', 'documents', true)
  ON CONFLICT (id) DO NOTHING;

-- Policy cho documents bucket
CREATE POLICY "Allow authenticated users to upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Allow public read of documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');
