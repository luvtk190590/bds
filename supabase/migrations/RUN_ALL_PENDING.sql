-- Migration 024: Admin System - Verification Requests

-- Add verification_status to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));

-- Add admin_note to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_note TEXT;

-- Create verification_requests table
CREATE TABLE IF NOT EXISTS public.verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('seller', 'broker', 'buyer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  -- For broker: certificate file URL
  certificate_url TEXT,
  -- For seller: property document file URL
  property_doc_url TEXT,
  -- For buyer: email confirmed (auto-approve on email confirm)
  email_confirmed BOOLEAN DEFAULT false,
  -- Requester note
  note TEXT,
  -- Admin review
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add approval fields to properties
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending'
    CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS approval_note TEXT;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Index
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON public.verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_properties_approval_status ON public.properties(approval_status);

-- Enable RLS
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Policies: admin can read all, user can read own
CREATE POLICY "Users can read own verification requests"
  ON public.verification_requests FOR SELECT
  USING (user_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own verification requests"
  ON public.verification_requests FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

-- For now allow service role full access (admin operations done via service role or RLS bypass)
-- Update properties approval status: allow all updates (admin will use service role)
CREATE POLICY "Allow update verification requests"
  ON public.verification_requests FOR UPDATE
  USING (true);
-- Migration 025: Add SEO fields and status to posts table

-- Status workflow
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived'));

-- Author
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.profiles(id);

-- SEO fields
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS seo_title TEXT;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS seo_description TEXT;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS focus_keyword TEXT;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS og_title TEXT;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS og_description TEXT;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS og_image TEXT;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS canonical_url TEXT;

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS no_index BOOLEAN DEFAULT false;

-- Tags
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Reading time (minutes, computed on save)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS reading_time INT;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);

-- Update RLS: published posts public, drafts only author/admin
DROP POLICY IF EXISTS "Allow public read access to posts" ON public.posts;

CREATE POLICY "Public can read published posts"
  ON public.posts FOR SELECT
  USING (status = 'published' OR status IS NULL);

CREATE POLICY "Authors can read own posts"
  ON public.posts FOR SELECT
  USING (author_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid()));

CREATE POLICY "Allow insert for authenticated users"
  ON public.posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow update for authenticated users"
  ON public.posts FOR UPDATE
  USING (true);

CREATE POLICY "Allow delete for authenticated users"
  ON public.posts FOR DELETE
  USING (true);
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
-- Migration 027: Admin RLS policies cho các bảng mới

-- ── verification_requests ────────────────────────────────────
-- Admin đọc tất cả verification requests
CREATE POLICY "Admin can read all verification requests"
  ON public.verification_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admin update verification requests
CREATE POLICY "Admin can update verification requests"
  ON public.verification_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- ── profiles ─────────────────────────────────────────────────
-- Admin update bất kỳ profile nào (để approve/reject)
CREATE POLICY "Admin can update all profiles"
  ON public.profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.auth_user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- ── posts ────────────────────────────────────────────────────
-- Admin đọc tất cả bài viết kể cả draft
DROP POLICY IF EXISTS "Public can read published posts" ON public.posts;
DROP POLICY IF EXISTS "Authors can read own posts" ON public.posts;

CREATE POLICY "Public can read published posts"
  ON public.posts FOR SELECT
  USING (
    status = 'published'
    OR status IS NULL
    OR author_id = (SELECT id FROM public.profiles WHERE auth_user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );
