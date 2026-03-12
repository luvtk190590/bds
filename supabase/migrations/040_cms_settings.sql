-- Migration 040: CMS Settings — Menu, Footer, Categories, Site Settings

-- ── Site Settings (key-value) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_public_read" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "settings_admin_all" ON public.site_settings
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin'
  );

INSERT INTO public.site_settings (key, value) VALUES
  ('address',    '101 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh'),
  ('phone',      '0901 234 567'),
  ('email',      'info@homelengo.vn'),
  ('facebook',   '#'),
  ('youtube',    '#'),
  ('zalo',       '#'),
  ('instagram',  '#'),
  ('twitter',    '#'),
  ('linkedin',   '#'),
  ('copyright',  '© 2025 HomeLengo. Bản quyền thuộc về HomeLengo.'),
  ('description','Chuyên trang bất động sản uy tín — mua, bán, cho thuê nhà đất toàn quốc.')
ON CONFLICT (key) DO NOTHING;

-- ── Menu Items ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.menu_items (
  id            SERIAL PRIMARY KEY,
  menu_location TEXT    NOT NULL DEFAULT 'main',
  label         TEXT    NOT NULL,
  url           TEXT             DEFAULT '#',
  parent_id     INT     REFERENCES public.menu_items(id) ON DELETE CASCADE,
  sort_order    INT              DEFAULT 0,
  open_new_tab  BOOLEAN          DEFAULT false,
  is_active     BOOLEAN          DEFAULT true,
  created_at    TIMESTAMPTZ      DEFAULT now(),
  updated_at    TIMESTAMPTZ      DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_menu_location ON public.menu_items(menu_location);
CREATE INDEX IF NOT EXISTS idx_menu_parent   ON public.menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_sort     ON public.menu_items(sort_order);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "menu_public_read" ON public.menu_items
  FOR SELECT USING (is_active = true);

CREATE POLICY "menu_admin_all" ON public.menu_items
  FOR ALL
  USING (
    (SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin'
  );

-- Seed menu data from data/menu.js
DO $$
DECLARE
  p1 INT; p2 INT; p3 INT; p4 INT; p5 INT; p6 INT;
BEGIN
  -- Parent items
  INSERT INTO public.menu_items (menu_location, label, url, sort_order) VALUES ('main', 'Nhà đất bán', '#', 1) RETURNING id INTO p1;
  INSERT INTO public.menu_items (menu_location, label, url, sort_order) VALUES ('main', 'Nhà đất cho thuê', '#', 2) RETURNING id INTO p2;
  INSERT INTO public.menu_items (menu_location, label, url, sort_order) VALUES ('main', 'Dự án', '#', 3) RETURNING id INTO p3;
  INSERT INTO public.menu_items (menu_location, label, url, sort_order) VALUES ('main', 'Tin tức', '/blog', 4) RETURNING id INTO p4;
  INSERT INTO public.menu_items (menu_location, label, url, sort_order) VALUES ('main', 'Wiki BĐS', '/faq', 5) RETURNING id INTO p5;
  INSERT INTO public.menu_items (menu_location, label, url, sort_order) VALUES ('main', 'Phân tích', '#', 6) RETURNING id INTO p6;

  -- Children of "Nhà đất bán"
  INSERT INTO public.menu_items (menu_location, label, url, parent_id, sort_order) VALUES
    ('main', 'Bán căn hộ chung cư',              '/properties-map?type=ban-can-ho-chung-cu',          p1, 1),
    ('main', 'Bán chung cư mini, căn hộ dịch vụ', '/properties-map?type=ban-chung-cu-mini-can-ho-dich-vu', p1, 2),
    ('main', 'Bán nhà riêng',                     '/properties-map?type=ban-nha-rieng',                p1, 3),
    ('main', 'Bán nhà biệt thự, liền kề',          '/properties-map?type=ban-nha-biet-thu-lien-ke',     p1, 4),
    ('main', 'Bán nhà mặt phố',                   '/properties-map?type=ban-nha-mat-pho',              p1, 5),
    ('main', 'Bán shophouse, nhà phố thương mại',  '/properties-map?type=ban-shophouse-nha-pho-thuong-mai', p1, 6),
    ('main', 'Bán đất nền dự án',                  '/properties-map?type=ban-dat-nen-du-an',            p1, 7),
    ('main', 'Bán đất',                            '/properties-map?type=ban-dat',                      p1, 8),
    ('main', 'Bán trang trại, khu nghỉ dưỡng',     '/properties-map?type=ban-trang-trai-khu-nghi-duong',p1, 9),
    ('main', 'Bán condotel',                       '/properties-map?type=ban-condotel',                 p1, 10),
    ('main', 'Bán kho, nhà xưởng',                 '/properties-map?type=ban-kho-nha-xuong',            p1, 11),
    ('main', 'Bán loại bất động sản khác',          '/properties-map?type=ban-loai-bat-dong-san-khac',   p1, 12);

  -- Children of "Nhà đất cho thuê"
  INSERT INTO public.menu_items (menu_location, label, url, parent_id, sort_order) VALUES
    ('main', 'Cho thuê căn hộ chung cư',               '/properties-map?type=cho-thue-can-ho-chung-cu',          p2, 1),
    ('main', 'Cho thuê chung cư mini, căn hộ dịch vụ', '/properties-map?type=cho-thue-chung-cu-mini-can-ho-dich-vu', p2, 2),
    ('main', 'Cho thuê nhà riêng',                     '/properties-map?type=cho-thue-nha-rieng',                p2, 3),
    ('main', 'Cho thuê nhà biệt thự, liền kề',          '/properties-map?type=cho-thue-nha-biet-thu-lien-ke',     p2, 4),
    ('main', 'Cho thuê nhà mặt phố',                   '/properties-map?type=cho-thue-nha-mat-pho',              p2, 5),
    ('main', 'Cho thuê shophouse, nhà phố thương mại',  '/properties-map?type=cho-thue-shophouse-nha-pho-thuong-mai', p2, 6),
    ('main', 'Cho thuê nhà trọ, phòng trọ',             '/properties-map?type=cho-thue-nha-tro-phong-tro',        p2, 7),
    ('main', 'Cho thuê văn phòng',                     '/properties-map?type=cho-thue-van-phong',                p2, 8),
    ('main', 'Cho thuê, sang nhượng cửa hàng, ki ốt',  '/properties-map?type=cho-thue-sang-nhuong-cua-hang-ki-ot', p2, 9),
    ('main', 'Cho thuê kho, nhà xưởng, đất',            '/properties-map?type=cho-thue-kho-nha-xuong-dat',        p2, 10),
    ('main', 'Cho thuê loại bất động sản khác',         '/properties-map?type=cho-thue-loai-bat-dong-san-khac',   p2, 11);

  -- Children of "Dự án"
  INSERT INTO public.menu_items (menu_location, label, url, parent_id, sort_order) VALUES
    ('main', 'Căn hộ chung cư',        '/properties-map?type=du-an-can-ho-chung-cu',      p3, 1),
    ('main', 'Cao ốc văn phòng',        '/properties-map?type=du-an-cao-oc-van-phong',     p3, 2),
    ('main', 'Trung tâm thương mại',    '/properties-map?type=du-an-trung-tam-thuong-mai', p3, 3),
    ('main', 'Khu đô thị mới',          '/properties-map?type=du-an-khu-do-thi-moi',       p3, 4),
    ('main', 'Khu phức hợp',            '/properties-map?type=du-an-khu-phuc-hop',         p3, 5),
    ('main', 'Nhà ở xã hội',            '/properties-map?type=du-an-nha-o-xa-hoi',         p3, 6),
    ('main', 'Khu nghỉ dưỡng, Sinh thái','/properties-map?type=du-an-khu-nghi-duong-sinh-thai', p3, 7),
    ('main', 'Khu công nghiệp',         '/properties-map?type=du-an-khu-cong-nghiep',      p3, 8),
    ('main', 'Biệt thự, liền kề',       '/properties-map?type=du-an-biet-thu-lien-ke',     p3, 9),
    ('main', 'Shophouse',               '/properties-map?type=du-an-shophouse',            p3, 10),
    ('main', 'Nhà mặt phố',             '/properties-map?type=du-an-nha-mat-pho',          p3, 11),
    ('main', 'Dự án khác',              '/properties-map?type=du-an-khac',                 p3, 12);

  -- Children of "Tin tức"
  INSERT INTO public.menu_items (menu_location, label, url, parent_id, sort_order) VALUES
    ('main', 'Tin tức BĐS', '/blog', p4, 1),
    ('main', 'Phong thủy',  '/blog', p4, 2),
    ('main', 'Luật BĐS',    '/blog', p4, 3);

  -- Children of "Wiki BĐS"
  INSERT INTO public.menu_items (menu_location, label, url, parent_id, sort_order) VALUES
    ('main', 'Cẩm nang mua nhà',   '/faq', p5, 1),
    ('main', 'Kinh nghiệm đầu tư', '/faq', p5, 2);

  -- Children of "Phân tích"
  INSERT INTO public.menu_items (menu_location, label, url, parent_id, sort_order) VALUES
    ('main', 'Báo cáo thị trường', '/', p6, 1);
END;
$$;

-- ── Footer Sections ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.footer_sections (
  id         SERIAL PRIMARY KEY,
  title      TEXT    NOT NULL,
  sort_order INT              DEFAULT 0,
  is_active  BOOLEAN          DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.footer_links (
  id           SERIAL PRIMARY KEY,
  section_id   INT     NOT NULL REFERENCES public.footer_sections(id) ON DELETE CASCADE,
  label        TEXT    NOT NULL,
  url          TEXT    NOT NULL DEFAULT '#',
  sort_order   INT              DEFAULT 0,
  open_new_tab BOOLEAN          DEFAULT false,
  is_active    BOOLEAN          DEFAULT true
);

ALTER TABLE public.footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_links    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "footer_sec_public_read" ON public.footer_sections FOR SELECT USING (true);
CREATE POLICY "footer_sec_admin_all"   ON public.footer_sections FOR ALL
  USING ((SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin');

CREATE POLICY "footer_lnk_public_read" ON public.footer_links FOR SELECT USING (true);
CREATE POLICY "footer_lnk_admin_all"   ON public.footer_links FOR ALL
  USING ((SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin');

-- Seed footer data
DO $$
DECLARE s1 INT; s2 INT; s3 INT;
BEGIN
  INSERT INTO public.footer_sections (title, sort_order) VALUES ('Danh mục', 1) RETURNING id INTO s1;
  INSERT INTO public.footer_sections (title, sort_order) VALUES ('Công ty chúng tôi', 2) RETURNING id INTO s2;
  INSERT INTO public.footer_sections (title, sort_order) VALUES ('Hỗ trợ', 3) RETURNING id INTO s3;

  INSERT INTO public.footer_links (section_id, label, url, sort_order) VALUES
    (s1, 'Bảng giá dịch vụ', '/pricing',    1),
    (s1, 'Dịch vụ',          '/our-service', 2),
    (s1, 'Về chúng tôi',     '/about-us',    3),
    (s1, 'Liên hệ',          '/contact',     4);

  INSERT INTO public.footer_links (section_id, label, url, sort_order) VALUES
    (s2, 'BĐS bán',          '/properties-map?lt=sale', 1),
    (s2, 'BĐS cho thuê',     '/properties-map?lt=rent', 2),
    (s2, 'Môi giới của chúng tôi', '/contact',          3);

  INSERT INTO public.footer_links (section_id, label, url, sort_order) VALUES
    (s3, 'Câu hỏi thường gặp', '/faq',     1),
    (s3, 'Điều khoản dịch vụ', '/our-service', 2),
    (s3, 'Chính sách bảo mật', '/pricing',     3),
    (s3, 'Cookie Policy',      '/contact',     4);
END;
$$;

-- ── Property Categories CMS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.property_categories_cms (
  id          SERIAL PRIMARY KEY,
  name        TEXT    NOT NULL,
  slug        TEXT    UNIQUE,
  icon        TEXT             DEFAULT '',
  description TEXT             DEFAULT '',
  sort_order  INT              DEFAULT 0,
  is_active   BOOLEAN          DEFAULT true,
  type_ids    INT[]            DEFAULT '{}',
  created_at  TIMESTAMPTZ      DEFAULT now()
);

ALTER TABLE public.property_categories_cms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cats_public_read" ON public.property_categories_cms
  FOR SELECT USING (true);

CREATE POLICY "cats_admin_all" ON public.property_categories_cms
  FOR ALL
  USING ((SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE auth_user_id = auth.uid()) = 'admin');

INSERT INTO public.property_categories_cms (name, slug, sort_order, type_ids) VALUES
  ('Căn hộ',              'can-ho',           1, '{14,15,23,26,27,37,42}'),
  ('Nhà phố',             'nha-pho',          2, '{19,31,46}'),
  ('Đất nền',             'dat-nen',          3, '{20,21,22}'),
  ('Biệt thự',            'biet-thu',         4, '{17,29,45}'),
  ('Nhà riêng',           'nha-rieng',        5, '{16,28}'),
  ('Nhà mặt phố',         'nha-mat-pho',      6, '{18,30,47}'),
  ('Nhà xưởng, kho bãi',  'nha-xuong-kho-bai',7, '{24,35,44}'),
  ('BĐS khác',            'bds-khac',         8, '{11,12,13,25,32,33,34,36,38,39,40,41,43,48}')
ON CONFLICT (slug) DO NOTHING;
