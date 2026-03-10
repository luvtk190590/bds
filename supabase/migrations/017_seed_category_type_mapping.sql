-- ============================================================
-- Migration 017: Seed type_ids mapping cho 38 property_types thực tế
-- IDs lấy trực tiếp từ DB (range 11-48)
-- ============================================================

-- -----------------------------------------------
-- 1. Cập nhật type_ids trong property_categories
-- -----------------------------------------------

UPDATE property_categories SET type_ids = '[14, 15, 23, 26, 27, 37, 42]'::jsonb
  WHERE slug = 'can-ho';
-- 14: Bán căn hộ chung cư
-- 15: Bán chung cư mini, căn hộ dịch vụ
-- 23: Bán condotel
-- 26: Cho thuê căn hộ chung cư
-- 27: Cho thuê chung cư mini, căn hộ dịch vụ
-- 37: Căn hộ chung cư (Dự án)
-- 42: Nhà ở xã hội

UPDATE property_categories SET type_ids = '[19, 31, 46]'::jsonb
  WHERE slug = 'nha-pho';
-- 19: Bán shophouse, nhà phố thương mại
-- 31: Cho thuê shophouse, nhà phố thương mại
-- 46: Shophouse (Dự án)

UPDATE property_categories SET type_ids = '[20, 21, 22]'::jsonb
  WHERE slug = 'dat-nen';
-- 20: Bán đất nền dự án
-- 21: Bán đất
-- 22: Bán trang trại, khu nghỉ dưỡng

UPDATE property_categories SET type_ids = '[17, 29, 45]'::jsonb
  WHERE slug = 'biet-thu';
-- 17: Bán nhà biệt thự, liền kề
-- 29: Cho thuê nhà biệt thự, liền kề
-- 45: Biệt thự, liền kề (Dự án)

UPDATE property_categories SET type_ids = '[16, 28]'::jsonb
  WHERE slug = 'nha-rieng';
-- 16: Bán nhà riêng
-- 28: Cho thuê nhà riêng

UPDATE property_categories SET type_ids = '[18, 30, 47]'::jsonb
  WHERE slug = 'nha-mat-pho';
-- 18: Bán nhà mặt phố
-- 30: Cho thuê nhà mặt phố
-- 47: Nhà mặt phố (Dự án)

UPDATE property_categories SET type_ids = '[24, 35, 44]'::jsonb
  WHERE slug = 'nha-xuong-kho-bai';
-- 24: Bán kho, nhà xưởng
-- 35: Cho thuê kho, nhà xưởng, đất
-- 44: Khu công nghiệp

UPDATE property_categories SET type_ids = '[11, 12, 13, 25, 32, 33, 34, 36, 38, 39, 40, 41, 43, 48]'::jsonb
  WHERE slug = 'bds-khac';
-- 11: Nhà đất bán
-- 12: Nhà đất cho thuê
-- 13: Dự án
-- 25: Bán loại bất động sản khác
-- 32: Cho thuê nhà trọ, phòng trọ
-- 33: Cho thuê văn phòng
-- 34: Cho thuê, sang nhượng cửa hàng, ki ốt
-- 36: Cho thuê loại bất động sản khác
-- 38: Cao ốc văn phòng
-- 39: Trung tâm thương mại
-- 40: Khu đô thị mới
-- 41: Khu phức hợp
-- 43: Khu nghỉ dưỡng, Sinh thái
-- 48: Dự án khác

-- -----------------------------------------------
-- 2. Tự động điền property_category_id cho toàn bộ
--    properties dựa trên property_type_id hiện có
-- -----------------------------------------------

UPDATE public.properties p
SET property_category_id = pc.id
FROM public.property_categories pc
WHERE pc.type_ids @> to_jsonb(p.property_type_id)
  AND p.property_category_id IS NULL;

-- -----------------------------------------------
-- 3. Kiểm tra kết quả
-- -----------------------------------------------

SELECT
  pc.name AS category,
  COUNT(*) AS so_luong_bds
FROM public.properties p
JOIN public.property_categories pc ON pc.id = p.property_category_id
GROUP BY pc.name, pc.sort_order
ORDER BY pc.sort_order;
