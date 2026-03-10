-- ============================================================
-- Migration 008: Add missing fields based on Batdongsan.com.vn structure
-- ============================================================

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS floors INT,
  ADD COLUMN IF NOT EXISTS balcony_direction TEXT CHECK (
    balcony_direction IS NULL OR balcony_direction IN ('north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest')
  ),
  ADD COLUMN IF NOT EXISTS furniture_status TEXT,
  ADD COLUMN IF NOT EXISTS project_name TEXT,
  ADD COLUMN IF NOT EXISTS legal_status TEXT;

-- Update the FTS search to include project name and legal status
ALTER TABLE properties DROP COLUMN IF EXISTS fts CASCADE;

ALTER TABLE properties ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(address, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(project_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(legal_status, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_properties_fts
  ON properties USING GIN (fts);
