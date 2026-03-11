-- Migration 032: Bật Realtime cho bảng profiles
-- Cần thiết để frontend tự động nhận cập nhật khi admin thay đổi verification_status

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
