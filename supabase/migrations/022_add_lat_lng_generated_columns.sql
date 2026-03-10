-- Migration 022: Thêm generated columns lat / lng vào bảng properties
-- Sau migration này, SELECT * sẽ tự trả về lat và lng mà không cần gọi PostGIS thủ công

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS lat double precision
    GENERATED ALWAYS AS (
      CASE
        WHEN location IS NOT NULL
          THEN extensions.ST_Y(location::extensions.geometry)
        ELSE NULL
      END
    ) STORED,

  ADD COLUMN IF NOT EXISTS lng double precision
    GENERATED ALWAYS AS (
      CASE
        WHEN location IS NOT NULL
          THEN extensions.ST_X(location::extensions.geometry)
        ELSE NULL
      END
    ) STORED;

-- Index để tìm kiếm nhanh theo vị trí (optional nhưng useful)
CREATE INDEX IF NOT EXISTS idx_properties_lat_lng
  ON public.properties (lat, lng)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;
