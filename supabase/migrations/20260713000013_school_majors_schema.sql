-- Migration #13: Ngành học (Majors) — mô hình Nhiều-Nhiều chuẩn hóa
-- ============================================================================
-- Chuẩn bị cho "Tìm trường theo ngành học" + AI Smart Matching (rule 11:
-- tiêu chí query nằm ở bảng/cột quan hệ có index, KHÔNG giấu trong JSONB).
-- GIỮ NGUYÊN cột schools.programs (JSONB) — dữ liệu hiển thị cũ, migrate sau.
--
-- Apply TAY qua Supabase Dashboard → SQL Editor. Idempotent.

-- ── 1. Bảng majors — danh mục ngành học chuẩn ──────────────────────────────
create table if not exists public.majors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,          -- 'computer-science' — sinh bằng slugify (src/lib/slug.ts)
  name_vi text not null,              -- 'Khoa học máy tính'
  name_en text not null,              -- 'Computer Science'
  category text not null,             -- nhóm ngành: 'STEM' | 'Business' | 'Health'... (text tự do)
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.majors is
  'Danh mục ngành học chuẩn hóa — nguồn cho Tìm trường theo ngành + AI Smart Matching (migration #13)';
comment on column public.majors.category is
  'Nhóm ngành (Business, STEM, Health...) — text tự do, facet phụ khi lọc';

-- ── 2. Junction table school_majors — trường ↔ ngành (N-N) ────────────────
create table if not exists public.school_majors (
  school_id uuid not null references public.schools(id) on delete cascade,
  major_id uuid not null references public.majors(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (school_id, major_id)
);

comment on table public.school_majors is
  'Liên kết N-N trường ↔ ngành học — PK kép chống trùng link (migration #13)';

-- ── 3. RLS ──────────────────────────────────────────────────────────────────
-- Anon/authenticated: CHỈ SELECT (majors phải active; link phải trỏ tới trường
-- + ngành đang active — không lộ liên kết của row đã tắt).
-- INSERT/UPDATE/DELETE: không policy → chỉ service role (bypass RLS) ghi được.
alter table public.majors enable row level security;
alter table public.school_majors enable row level security;

drop policy if exists "Public read active majors" on public.majors;
create policy "Public read active majors"
  on public.majors for select
  using (is_active = true);

drop policy if exists "Public read links of active school+major" on public.school_majors;
create policy "Public read links of active school+major"
  on public.school_majors for select
  using (
    exists (
      select 1 from public.schools s
      where s.id = school_majors.school_id and s.is_active = true
    )
    and exists (
      select 1 from public.majors m
      where m.id = school_majors.major_id and m.is_active = true
    )
  );

-- ── 4. Indexes ──────────────────────────────────────────────────────────────
-- PK (school_id, major_id) đã phủ chiều "ngành của 1 trường".
-- Chiều ngược "trường theo ngành" (query chính của tính năng) cần index riêng:
create index if not exists idx_school_majors_major
  on public.school_majors (major_id, school_id);

-- Lọc/gợi ý ngành theo nhóm (chỉ ngành active — partial cho nhỏ gọn):
create index if not exists idx_majors_category
  on public.majors (category)
  where is_active = true;
