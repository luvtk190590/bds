-- ============================================================
-- Migration 002: Create Core Tables
-- ============================================================

-- -----------------------------------------------
-- 1. Bảng Administrative (Tỉnh/Thành, Quận/Huyện, Phường/Xã)
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS provinces (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT
);

CREATE TABLE IF NOT EXISTS districts (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  province_code TEXT NOT NULL REFERENCES provinces(code) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS wards (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  district_code TEXT NOT NULL REFERENCES districts(code) ON DELETE CASCADE
);

CREATE INDEX idx_districts_province ON districts(province_code);
CREATE INDEX idx_wards_district ON wards(district_code);

-- -----------------------------------------------
-- 2. Bảng Property Types
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS property_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT
);

INSERT INTO property_types (name, slug, icon) VALUES
  ('Căn hộ / Chung cư', 'can-ho', 'apartment'),
  ('Nhà riêng', 'nha-rieng', 'house'),
  ('Nhà biệt thự / Liền kề', 'biet-thu', 'villa'),
  ('Nhà mặt phố', 'nha-mat-pho', 'shophouse'),
  ('Đất nền', 'dat-nen', 'land'),
  ('Đất dự án', 'dat-du-an', 'project-land'),
  ('Văn phòng', 'van-phong', 'office'),
  ('Kho / Xưởng', 'kho-xuong', 'warehouse'),
  ('Shop / Kiot / Mặt bằng', 'shop-kiot', 'shop'),
  ('Phòng trọ', 'phong-tro', 'room')
ON CONFLICT (slug) DO NOTHING;

-- -----------------------------------------------
-- 3. Bảng Profiles (mở rộng từ Supabase Auth)
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'broker', 'admin')),
  company_name TEXT,
  license_number TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_auth_user ON profiles(auth_user_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- -----------------------------------------------
-- 4. Bảng Properties (BĐS chính)
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  property_type_id INT REFERENCES property_types(id),
  listing_type TEXT NOT NULL DEFAULT 'sale' CHECK (listing_type IN ('sale', 'rent')),
  price NUMERIC NOT NULL CHECK (price >= 0),
  price_unit TEXT DEFAULT 'VND',
  price_negotiable BOOLEAN DEFAULT FALSE,
  area NUMERIC CHECK (area > 0),
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  floors INT DEFAULT 1,
  address TEXT,
  ward_code TEXT REFERENCES wards(code),
  district_code TEXT REFERENCES districts(code),
  province_code TEXT REFERENCES provinces(code),
  location extensions.geography(POINT, 4326),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (
    status IN ('draft', 'pending', 'approved', 'rejected', 'sold', 'rented', 'expired')
  ),
  rejection_reason TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  legal_documents JSONB DEFAULT '[]'::jsonb,
  year_built INT,
  direction TEXT CHECK (
    direction IS NULL OR direction IN ('north', 'south', 'east', 'west', 'northeast', 'northwest', 'southeast', 'southwest')
  ),
  frontage NUMERIC,
  road_width NUMERIC,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ
);

-- Full Text Search generated column
ALTER TABLE properties ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(address, '')), 'C')
  ) STORED;

-- -----------------------------------------------
-- 5. Indexes cho Properties (TỐI ƯU HIỆU SUẤT)
-- -----------------------------------------------

-- Spatial index (PostGIS) - tìm BĐS theo vùng bản đồ
CREATE INDEX idx_properties_location
  ON properties USING GIST (location);

-- Full Text Search index
CREATE INDEX idx_properties_fts
  ON properties USING GIN (fts);

-- Composite filter index
CREATE INDEX idx_properties_filter
  ON properties (status, listing_type, property_type_id, price);

-- Sorting indexes
CREATE INDEX idx_properties_created
  ON properties (created_at DESC);

CREATE INDEX idx_properties_price
  ON properties (price ASC);

-- Partial index - chỉ BĐS đã duyệt (giảm ~70% kích thước index)
CREATE INDEX idx_properties_approved
  ON properties (listing_type, property_type_id, price, area)
  WHERE status = 'approved';

-- Administrative location indexes
CREATE INDEX idx_properties_province ON properties(province_code);
CREATE INDEX idx_properties_district ON properties(district_code);
CREATE INDEX idx_properties_ward ON properties(ward_code);

-- Owner index
CREATE INDEX idx_properties_owner ON properties(owner_id);

-- Slug index
CREATE INDEX idx_properties_slug ON properties(slug);

-- -----------------------------------------------
-- 6. Bảng Property Images
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_property_images_property ON property_images(property_id);

-- -----------------------------------------------
-- 7. Bảng Favorites (Yêu thích)
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_property ON favorites(property_id);

-- -----------------------------------------------
-- 8. Bảng User Interests (Sở thích người dùng cho gợi ý)
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  interest_type TEXT NOT NULL CHECK (
    interest_type IN ('property_type', 'price_range', 'location', 'area_range', 'keyword')
  ),
  interest_value JSONB NOT NULL,
  weight INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_user_interests_user ON user_interests(user_id);

-- -----------------------------------------------
-- 9. Bảng Property Views (Tracking lượt xem)
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  view_duration_seconds INT DEFAULT 0,
  viewed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_property_views_user ON property_views(user_id);
CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_date ON property_views(viewed_at DESC);

-- -----------------------------------------------
-- 10. Bảng Messages (Tin nhắn)
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_property ON messages(property_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- -----------------------------------------------
-- 11. Bảng Contact Requests (Yêu cầu liên hệ)
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contact_requests_property ON contact_requests(property_id);

-- -----------------------------------------------
-- 12. Trigger: Auto create profile on auth.users insert
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'buyer')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------
-- 13. Trigger: Auto update updated_at
-- -----------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
