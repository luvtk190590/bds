-- ============================================================
-- Migration 003: Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wards ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================

-- Ai cũng xem được profile (public)
CREATE POLICY "profiles_select_public"
  ON profiles FOR SELECT
  USING (true);

-- Chỉ user sửa profile của mình
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = auth_user_id)
  WITH CHECK ((SELECT auth.uid()) = auth_user_id);

-- ============================================================
-- PROPERTIES
-- ============================================================

-- Xem BĐS: approved (public), hoặc owner xem BĐS của mình, hoặc admin xem tất cả
CREATE POLICY "properties_select"
  ON properties FOR SELECT
  USING (
    status = 'approved'
    OR owner_id IN (
      SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Seller/Broker tạo BĐS mới
CREATE POLICY "properties_insert_seller_broker"
  ON properties FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id IN (
      SELECT id FROM profiles
      WHERE auth_user_id = (SELECT auth.uid())
      AND role IN ('seller', 'broker')
    )
  );

-- Owner cập nhật BĐS của mình (draft/pending/rejected)
CREATE POLICY "properties_update_owner"
  ON properties FOR UPDATE
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid())
    )
    AND status IN ('draft', 'pending', 'rejected')
  );

-- Admin cập nhật bất kỳ BĐS nào (duyệt/từ chối)
CREATE POLICY "properties_update_admin"
  ON properties FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- Owner xóa BĐS draft/rejected
CREATE POLICY "properties_delete_owner"
  ON properties FOR DELETE
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid())
    )
    AND status IN ('draft', 'rejected')
  );

-- Admin xóa bất kỳ BĐS nào
CREATE POLICY "properties_delete_admin"
  ON properties FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- ============================================================
-- PROPERTY IMAGES
-- ============================================================

-- Xem ảnh theo quyền truy cập property
CREATE POLICY "property_images_select"
  ON property_images FOR SELECT
  USING (
    property_id IN (SELECT id FROM properties) -- relies on properties RLS
  );

-- Chủ property insert ảnh
CREATE POLICY "property_images_insert"
  ON property_images FOR INSERT
  TO authenticated
  WITH CHECK (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE pr.auth_user_id = (SELECT auth.uid())
    )
  );

-- Chủ property xóa ảnh
CREATE POLICY "property_images_delete"
  ON property_images FOR DELETE
  TO authenticated
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE pr.auth_user_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- PROPERTY TYPES (read-only cho mọi người)
-- ============================================================

CREATE POLICY "property_types_select"
  ON property_types FOR SELECT
  USING (true);

-- ============================================================
-- FAVORITES
-- ============================================================

CREATE POLICY "favorites_select_own"
  ON favorites FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "favorites_insert"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "favorites_delete"
  ON favorites FOR DELETE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- USER INTERESTS
-- ============================================================

CREATE POLICY "user_interests_select_own"
  ON user_interests FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "user_interests_manage"
  ON user_interests FOR ALL
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- PROPERTY VIEWS
-- ============================================================

CREATE POLICY "property_views_insert"
  ON property_views FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "property_views_select_own"
  ON property_views FOR SELECT
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- MESSAGES
-- ============================================================

CREATE POLICY "messages_select"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id IN (SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid()))
    OR receiver_id IN (SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid()))
  );

CREATE POLICY "messages_insert"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id IN (
      SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "messages_update_read"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    receiver_id IN (
      SELECT id FROM profiles WHERE auth_user_id = (SELECT auth.uid())
    )
  );

-- ============================================================
-- CONTACT REQUESTS
-- ============================================================

CREATE POLICY "contact_requests_insert"
  ON contact_requests FOR INSERT
  WITH CHECK (true); -- Cho phép cả guest gửi yêu cầu liên hệ

CREATE POLICY "contact_requests_select_owner"
  ON contact_requests FOR SELECT
  TO authenticated
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN profiles pr ON p.owner_id = pr.id
      WHERE pr.auth_user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- ============================================================
-- ADMINISTRATIVE TABLES (read-only)
-- ============================================================

CREATE POLICY "provinces_select" ON provinces FOR SELECT USING (true);
CREATE POLICY "districts_select" ON districts FOR SELECT USING (true);
CREATE POLICY "wards_select" ON wards FOR SELECT USING (true);
