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
