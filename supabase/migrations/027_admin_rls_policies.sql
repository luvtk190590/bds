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
