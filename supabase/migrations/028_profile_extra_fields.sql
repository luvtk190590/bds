-- Migration 028: Add extra profile fields for user profile page

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS position TEXT,
  ADD COLUMN IF NOT EXISTS office_phone TEXT,
  ADD COLUMN IF NOT EXISTS office_address TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS facebook TEXT,
  ADD COLUMN IF NOT EXISTS zalo TEXT;
