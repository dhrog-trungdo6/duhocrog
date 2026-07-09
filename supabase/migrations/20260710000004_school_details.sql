-- Migration #4 — Trang trường chi tiết: mở rộng bảng schools
-- Chạy trên Supabase Dashboard → SQL Editor (project chưa link CLI)
--
-- Thiết kế: giữ 1 bảng schools (không tách bảng con) — nội dung trang chi tiết
-- gắn 1-1 với trường; phần lặp (chương trình học, yêu cầu đầu vào) lưu JSONB.
-- Nếu sau này cần lọc/tìm theo chương trình → normalize ra bảng school_programs.

alter table public.schools
  -- URL trang chi tiết /truong/[slug] — sinh tự động từ name khi tạo qua admin API
  add column if not exists slug text,
  -- Giới thiệu trường (đoạn văn dài)
  add column if not exists description text,
  -- Website chính thức của trường
  add column if not exists website_url text,
  -- Ảnh cover/hero của trang chi tiết (logo_url đã có sẵn)
  add column if not exists image_url text,
  -- Video giới thiệu (YouTube embed URL)
  add column if not exists video_url text,
  -- Thư viện ảnh
  add column if not exists gallery_urls text[] not null default '{}',
  -- Điểm nổi bật (mảng chuỗi bullet): ["Top 50 US News", "Ký túc xá trong campus"]
  add column if not exists highlights jsonb not null default '[]'::jsonb,
  -- Chương trình đào tạo: [{name, level, tuitionUsd?, duration?}] — khớp type SchoolProgram
  add column if not exists programs jsonb not null default '[]'::jsonb,
  -- Yêu cầu đầu vào theo nhóm: [{category, items[]}] — khớp type DocumentRequirement
  add column if not exists requirements jsonb not null default '[]'::jsonb;

-- Slug duy nhất cho trường có trang chi tiết (partial: cho phép nhiều row slug null)
create unique index if not exists idx_schools_slug
  on public.schools (slug)
  where slug is not null;

-- RLS giữ nguyên: policy "Public read active schools" (is_active = true) đã bao phủ
-- các cột mới; ghi vẫn chỉ qua service role (admin API).
