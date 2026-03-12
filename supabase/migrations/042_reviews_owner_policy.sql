-- Migration 042: Thêm rating vào property_reviews + RLS cho chủ tin

ALTER TABLE property_reviews
  ADD COLUMN IF NOT EXISTS rating SMALLINT CHECK (rating BETWEEN 1 AND 5);

-- Cho phép chủ tin đăng xem tất cả đánh giá trên tin của mình
CREATE POLICY IF NOT EXISTS "reviews_property_owner_select"
  ON property_reviews FOR SELECT
  USING (
    property_id IN (
      SELECT p.id FROM properties p
      JOIN profiles pr ON pr.id = p.owner_id
      WHERE pr.auth_user_id = auth.uid()
    )
  );
