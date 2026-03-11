-- Migration 030: Tracking notification đã-xem cho user

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS verified_notified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS rejection_notified BOOLEAN DEFAULT false;
