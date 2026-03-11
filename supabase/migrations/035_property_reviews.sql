-- ============================================================
-- 035: Property Reviews + Review Votes
-- ============================================================

-- Bảng đánh giá tin đăng
CREATE TABLE IF NOT EXISTS property_reviews (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id   UUID        REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  author_id     UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  author_name   TEXT,
  content       TEXT        NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by   UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at   TIMESTAMPTZ,
  rejection_note TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Mỗi user chỉ được 1 đánh giá / tin đăng
CREATE UNIQUE INDEX IF NOT EXISTS reviews_one_per_user
  ON property_reviews(property_id, author_id)
  WHERE author_id IS NOT NULL;

-- Bảng vote hữu ích / không hữu ích
-- voter_key: 'user:{profile_id}' hoặc 'anon:{session_id}'
CREATE TABLE IF NOT EXISTS review_votes (
  id          UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id   UUID  REFERENCES property_reviews(id) ON DELETE CASCADE NOT NULL,
  voter_key   TEXT  NOT NULL,
  voter_id    UUID  REFERENCES profiles(id) ON DELETE CASCADE,
  vote        TEXT  NOT NULL CHECK (vote IN ('helpful', 'not_helpful')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (review_id, voter_key)
);

-- RLS
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes     ENABLE ROW LEVEL SECURITY;

-- ── property_reviews policies ──

-- Xem: tất cả đánh giá đã duyệt (public) hoặc admin xem tất cả
CREATE POLICY "reviews_select"
  ON property_reviews FOR SELECT
  USING (
    status = 'approved'
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
    OR author_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Gửi: user đã đăng nhập
CREATE POLICY "reviews_insert"
  ON property_reviews FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id IN (
      SELECT id FROM profiles WHERE auth_user_id = auth.uid()
    )
  );

-- Admin cập nhật (duyệt / từ chối)
CREATE POLICY "reviews_update_admin"
  ON property_reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- Admin xóa
CREATE POLICY "reviews_delete_admin"
  ON property_reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );

-- ── review_votes policies ──

-- Xem: tất cả
CREATE POLICY "votes_select"
  ON review_votes FOR SELECT
  USING (true);

-- Tạo / cập nhật: tất cả (dedup qua unique constraint)
CREATE POLICY "votes_insert"
  ON review_votes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "votes_update"
  ON review_votes FOR UPDATE
  USING (true) WITH CHECK (true);

CREATE POLICY "votes_delete"
  ON review_votes FOR DELETE
  USING (true);
