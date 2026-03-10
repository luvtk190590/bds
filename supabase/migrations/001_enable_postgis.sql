-- ============================================================
-- Migration 001: Enable PostGIS Extension
-- ============================================================
-- Cho phép sử dụng kiểu dữ liệu geography/geometry và
-- các hàm spatial query (ST_Distance, ST_DWithin, ST_MakeBox2D...)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;
