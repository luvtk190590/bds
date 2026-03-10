-- Migration 021: Create Posts Table for Blog
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  image_url TEXT,
  category TEXT,
  author_name TEXT,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Select policy (public)
CREATE POLICY "Allow public read access to posts"
  ON public.posts FOR SELECT
  USING (true);

-- Insert/Update/Delete policy (admin only, but for now allow all if no auth)
-- In a real app, you'd restrict this to admin roles.
CREATE POLICY "Allow individual insert for authenticated users" 
  ON public.posts FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow individual update for authenticated users"
  ON public.posts FOR UPDATE
  USING (true);

CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_published_at ON public.posts(published_at DESC);
