-- Migration 031: Đảm bảo UNIQUE constraint trên verification_requests.user_id

-- Xóa duplicate nếu có (giữ cái mới nhất)
DELETE FROM public.verification_requests vr1
  USING public.verification_requests vr2
  WHERE vr1.user_id = vr2.user_id
    AND vr1.created_at < vr2.created_at;

-- Thêm constraint nếu chưa có
ALTER TABLE public.verification_requests
  DROP CONSTRAINT IF EXISTS verification_requests_user_id_key;

ALTER TABLE public.verification_requests
  ADD CONSTRAINT verification_requests_user_id_key UNIQUE (user_id);
