-- Migration #5 — Crawler data: Quick Facts + Rich Content Sections
-- Chạy trên Supabase Dashboard → SQL Editor
-- KHÔNG DROP bảng cũ — chỉ ALTER TABLE ADD COLUMN

-- ── Khối 1: Quick Facts (Sidebar tĩnh) ─────────────────────────

alter table public.schools
  add column if not exists founded_year integer,
  add column if not exists school_type text,        -- 'Công lập' | 'Tư thục' | ...
  add column if not exists total_students integer,
  add column if not exists intakes text[] not null default '{}',
  add column if not exists map_embed_url text;      -- Google Maps iframe embed URL

-- ── Khối 2: Rich Content Sections (JSONB) ───────────────────────
-- Mỗi phần tử là 1 section: { type: 'html'|'list'|'table', title, content/items/headers/rows }
-- Cho phép crawler đẩy nội dung động không cần thay đổi schema

alter table public.schools
  add column if not exists content_sections jsonb not null default '[]'::jsonb;

-- ── Index cho tìm kiếm ─────────────────────────────────────────

create index if not exists idx_schools_founded_year on public.schools (founded_year);
create index if not exists idx_schools_school_type on public.schools (school_type);
create index if not exists idx_schools_content_sections_gin
  on public.schools using gin (content_sections jsonb_path_ops);

-- ── Comment ────────────────────────────────────────────────────

comment on column public.schools.founded_year is 'Năm thành lập trường (VD: 1968)';
comment on column public.schools.school_type is 'Loại trường: Công lập, Tư thục, ...';
comment on column public.schools.total_students is 'Tổng số sinh viên đang theo học';
comment on column public.schools.intakes is 'Các kỳ nhập học (VD: ARRAY[''Tháng 1'', ''Tháng 9''])';
comment on column public.schools.map_embed_url is 'Link iframe Google Maps Embed';
comment on column public.schools.content_sections is 'JSONB: mảng các section động [{type, title, ...}]. Xem types/index.ts SchoolSection để biết cấu trúc discriminated union';