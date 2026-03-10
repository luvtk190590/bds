-- ============================================================
-- Migration 007: Phân cấp Loại BĐS theo yêu cầu (Bán, Cho Thuê, Dự Án) - FIXED IDEMPOTENT
-- ============================================================

-- 1. Đảm bảo bảng có cột parent_id
ALTER TABLE property_types ADD COLUMN IF NOT EXISTS parent_id INT REFERENCES property_types(id) ON DELETE CASCADE;

-- 2. Chèn các nhóm CHA và lưu ID vào biến để dùng cho nhóm CON
DO $$
DECLARE
    v_ban_id INT;
    v_thue_id INT;
    v_duan_id INT;
BEGIN
    -- Nhóm Cha
    INSERT INTO property_types (name, slug) VALUES ('Nhà đất bán', 'nha-dat-ban')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_ban_id;

    INSERT INTO property_types (name, slug) VALUES ('Nhà đất cho thuê', 'nha-dat-cho-thue')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_thue_id;

    INSERT INTO property_types (name, slug) VALUES ('Dự án', 'du-an')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO v_duan_id;

    -- Con của Nhà đất bán (Parent: v_ban_id)
    INSERT INTO property_types (name, slug, parent_id) VALUES
      ('Bán căn hộ chung cư', 'ban-can-ho-chung-cu', v_ban_id),
      ('Bán chung cư mini, căn hộ dịch vụ', 'ban-chung-cu-mini-can-ho-dich-vu', v_ban_id),
      ('Bán nhà riêng', 'ban-nha-rieng', v_ban_id),
      ('Bán nhà biệt thự, liền kề', 'ban-nha-biet-thu-lien-ke', v_ban_id),
      ('Bán nhà mặt phố', 'ban-nha-mat-pho', v_ban_id),
      ('Bán shophouse, nhà phố thương mại', 'ban-shophouse-nha-pho-thuong-mai', v_ban_id),
      ('Bán đất nền dự án', 'ban-dat-nen-du-an', v_ban_id),
      ('Bán đất', 'ban-dat', v_ban_id),
      ('Bán trang trại, khu nghỉ dưỡng', 'ban-trang-trai-khu-nghi-duong', v_ban_id),
      ('Bán condotel', 'ban-condotel', v_ban_id),
      ('Bán kho, nhà xưởng', 'ban-kho-nha-xuong', v_ban_id),
      ('Bán loại bất động sản khác', 'ban-loai-bat-dong-san-khac', v_ban_id)
    ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, name = EXCLUDED.name;

    -- Con của Nhà đất cho thuê (Parent: v_thue_id)
    INSERT INTO property_types (name, slug, parent_id) VALUES
      ('Cho thuê căn hộ chung cư', 'cho-thue-can-ho-chung-cu', v_thue_id),
      ('Cho thuê chung cư mini, căn hộ dịch vụ', 'cho-thue-chung-cu-mini-can-ho-dich-vu', v_thue_id),
      ('Cho thuê nhà riêng', 'cho-thue-nha-rieng', v_thue_id),
      ('Cho thuê nhà biệt thự, liền kề', 'cho-thue-nha-biet-thu-lien-ke', v_thue_id),
      ('Cho thuê nhà mặt phố', 'cho-thue-nha-mat-pho', v_thue_id),
      ('Cho thuê shophouse, nhà phố thương mại', 'cho-thue-shophouse-nha-pho-thuong-mai', v_thue_id),
      ('Cho thuê nhà trọ, phòng trọ', 'cho-thue-nha-tro-phong-tro', v_thue_id),
      ('Cho thuê văn phòng', 'cho-thue-van-phong', v_thue_id),
      ('Cho thuê, sang nhượng cửa hàng, ki ốt', 'cho-thue-sang-nhuong-cua-hang-ki-ot', v_thue_id),
      ('Cho thuê kho, nhà xưởng, đất', 'cho-thue-kho-nha-xuong-dat', v_thue_id),
      ('Cho thuê loại bất động sản khác', 'cho-thue-loai-bat-dong-san-khac', v_thue_id)
    ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, name = EXCLUDED.name;

    -- Con của Dự án (Parent: v_duan_id)
    INSERT INTO property_types (name, slug, parent_id) VALUES
      ('Căn hộ chung cư (Dự án)', 'du-an-can-ho-chung-cu', v_duan_id),
      ('Cao ốc văn phòng', 'du-an-cao-oc-van-phong', v_duan_id),
      ('Trung tâm thương mại', 'du-an-trung-tam-thuong-mai', v_duan_id),
      ('Khu đô thị mới', 'du-an-khu-do-thi-moi', v_duan_id),
      ('Khu phức hợp', 'du-an-khu-phuc-hop', v_duan_id),
      ('Nhà ở xã hội', 'du-an-nha-o-xa-hoi', v_duan_id),
      ('Khu nghỉ dưỡng, Sinh thái', 'du-an-khu-nghi-duong-sinh-thai', v_duan_id),
      ('Khu công nghiệp', 'du-an-khu-cong-nghiep', v_duan_id),
      ('Biệt thự, liền kề (Dự án)', 'du-an-biet-thu-lien-ke', v_duan_id),
      ('Shophouse (Dự án)', 'du-an-shophouse', v_duan_id),
      ('Nhà mặt phố (Dự án)', 'du-an-nha-mat-pho', v_duan_id),
      ('Dự án khác', 'du-an-khac', v_duan_id)
    ON CONFLICT (slug) DO UPDATE SET parent_id = EXCLUDED.parent_id, name = EXCLUDED.name;
END $$;

-- 3. Cập nhật lại logic gợi ý (DROP để tránh lỗi return type)
DROP FUNCTION IF EXISTS get_recommendations(uuid, integer);

CREATE OR REPLACE FUNCTION get_recommendations(
  p_user_id uuid,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  title text,
  slug text,
  price numeric,
  listing_type text,
  area numeric,
  bedrooms int,
  bathrooms int,
  address text,
  property_type_name text,
  owner_name text,
  primary_image_url text,
  match_score numeric,
  match_reasons text[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_pref record;
BEGIN
  SELECT * INTO v_pref FROM get_user_preference_profile(p_user_id);

  RETURN QUERY
  WITH property_scores AS (
    SELECT 
      p.id, p.title, p.slug, p.price, p.listing_type, p.area, p.bedrooms, p.bathrooms, p.address,
      pt.name as property_type_name,
      pr.full_name as owner_name,
      (SELECT url FROM property_images WHERE property_id = p.id AND is_primary = true LIMIT 1) as primary_image_url,
      
      (
        -- 1. Property Type Match (Max 2.0)
        CASE 
          WHEN p.property_type_id = ANY(v_pref.preferred_property_types) THEN 2.0
          WHEN pt.parent_id = ANY(SELECT parent_id FROM property_types WHERE id = ANY(v_pref.preferred_property_types)) THEN 1.0
          ELSE 0 
        END +
        
        -- Các yếu tố score khác giữ nguyên...
        CASE 
          WHEN p.province_code = v_pref.preferred_province THEN 2.0
          WHEN p.district_code = v_pref.preferred_district THEN 1.0
          ELSE 0 
        END +
        
        CASE 
          WHEN v_pref.avg_price > 0 AND p.price BETWEEN v_pref.avg_price * 0.7 AND v_pref.avg_price * 1.3 THEN 2.0
          WHEN v_pref.avg_price > 0 AND p.price BETWEEN v_pref.avg_price * 0.5 AND v_pref.avg_price * 1.5 THEN 1.0
          ELSE 0 
        END +

        CASE WHEN v_pref.avg_area > 0 AND p.area BETWEEN v_pref.avg_area * 0.8 AND v_pref.avg_area * 1.2 THEN 1.5 ELSE 0 END +

        CASE WHEN v_pref.preferred_bedrooms > 0 AND p.bedrooms = v_pref.preferred_bedrooms THEN 1.0 ELSE 0 END +

        CASE WHEN v_pref.location_centroid IS NOT NULL THEN LEAST(1.0, 10000 / GREATEST(1, ST_Distance(p.location, v_pref.location_centroid))) ELSE 0 END
      ) as final_score,
      
      ARRAY[
        CASE WHEN p.property_type_id = ANY(v_pref.preferred_property_types) THEN 'Đúng loại BĐS ưu thích' 
             WHEN pt.parent_id = ANY(SELECT parent_id FROM property_types WHERE id = ANY(v_pref.preferred_property_types)) THEN 'Cùng nhóm danh mục'
             ELSE NULL END,
        CASE WHEN p.province_code = v_pref.preferred_province THEN 'Vị trí phù hợp' ELSE NULL END,
        CASE WHEN v_pref.avg_price > 0 AND p.price BETWEEN v_pref.avg_price * 0.7 AND v_pref.avg_price * 1.3 THEN 'Giá vừa túi tiền' ELSE NULL END
      ] as match_reasons
      
    FROM properties p
    JOIN property_types pt ON p.property_type_id = pt.id
    JOIN profiles pr ON p.owner_id = pr.id
    WHERE p.status = 'approved'
      AND p.owner_id != p_user_id
  )
  SELECT 
    ps.id, ps.title, ps.slug, ps.price, ps.listing_type, ps.area, ps.bedrooms, ps.bathrooms, 
    ps.address, ps.property_type_name, ps.owner_name, ps.primary_image_url,
    ROUND(CAST(ps.final_score as numeric), 1),
    array_remove(ps.match_reasons, NULL)
  FROM property_scores ps
  WHERE ps.final_score > 0
  ORDER BY ps.final_score DESC
  LIMIT p_limit;
END;
$$;
