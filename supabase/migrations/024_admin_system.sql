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
