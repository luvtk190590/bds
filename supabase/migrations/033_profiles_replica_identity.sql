-- Migration 033: Bật REPLICA IDENTITY FULL cho bảng profiles
-- Cần thiết để Supabase Realtime có thể filter UPDATE events theo cột auth_user_id

ALTER TABLE public.profiles REPLICA IDENTITY FULL;
