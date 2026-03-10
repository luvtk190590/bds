-- ============================================================
-- Migration 005: Setup Storage Bucket for Property Images
-- ============================================================
-- Run this in Supabase SQL Editor after creating the bucket
-- Go to Storage > Create a new bucket named "property-images" (public)
-- Then run this SQL to set up storage policies:
-- ============================================================

-- Allow authenticated users to upload images
CREATE POLICY "authenticated_upload"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'property-images');

-- Allow public read access to property images
CREATE POLICY "public_read_images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'property-images');

-- Allow users to delete their own uploaded images
CREATE POLICY "owner_delete_images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'property-images' AND (SELECT auth.uid())::text = (storage.foldername(name))[1]);
