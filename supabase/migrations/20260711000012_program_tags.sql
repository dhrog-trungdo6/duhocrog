-- Migration #12: Program Tags — nhãn thông minh kiểu ApplyBoard (rule 11: faceted filtering)
-- ============================================================================
-- 4 cờ boolean = cột vật lý lọc nhanh (KHÔNG giấu trong JSONB — rule 11) +
-- program_tags TEXT[] cho tag phụ động mở rộng (GIN index).
--
-- Apply TAY qua Supabase Dashboard → SQL Editor. Idempotent.

-- 1. Cột nhãn trên bảng schools
alter table public.schools
  add column if not exists is_high_demand boolean not null default false,
  add column if not exists no_visa_cap boolean not null default false,
  add column if not exists is_top_school boolean not null default false,
  add column if not exists has_coop boolean not null default false,
  add column if not exists program_tags text[] not null default '{}';

comment on column public.schools.is_high_demand is 'Nhãn: Ngành khát nhân lực (danh sách thiếu hụt lao động nước sở tại)';
comment on column public.schools.no_visa_cap is 'Nhãn: Không bị giới hạn chỉ tiêu visa';
comment on column public.schools.is_top_school is 'Nhãn: Trường top đầu (xếp hạng cao)';
comment on column public.schools.has_coop is 'Nhãn: Chương trình Co-op / thực tập hưởng lương';
comment on column public.schools.program_tags is 'Tag phụ động (Popular, Incentivized...) — chỉ HIỂN THỊ, tiêu chí lọc chính dùng cột boolean';

-- 2. Composite index lọc trường (từ migration #1) → partial theo is_active = true
--    (mọi truy vấn public đều lọc active; index nhỏ hơn, nhanh hơn)
drop index if exists public.idx_schools_filter;
create index if not exists idx_schools_filter
  on public.schools (country, province, level, tuition_usd desc)
  where is_active = true;

-- 3. GIN index truy vấn mảng program_tags (@> / && operators)
create index if not exists idx_schools_program_tags_gin
  on public.schools using gin (program_tags);
