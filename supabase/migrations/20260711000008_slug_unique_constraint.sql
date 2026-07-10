-- Migration #8: Thay partial unique index của schools.slug bằng UNIQUE CONSTRAINT thường
-- ============================================================================
-- Lý do: PostgREST `on_conflict=slug` sinh `ON CONFLICT (slug)` — Postgres KHÔNG suy ra
-- được partial index (where slug is not null) cho ON CONFLICT → REST trả 400 với mọi upsert.
-- Unique constraint thường vẫn cho phép nhiều row slug NULL (NULLS DISTINCT mặc định),
-- nên không mất tính năng gì so với partial index cũ.
--
-- Apply TAY qua Supabase Dashboard → SQL Editor (project chưa link CLI).
-- Idempotent: chạy lại nhiều lần không lỗi.

-- 1. Gỡ partial index cũ (migration #4)
drop index if exists public.idx_schools_slug;

-- 2. Thêm unique constraint thường (ON CONFLICT suy ra được)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'schools_slug_key' and conrelid = 'public.schools'::regclass
  ) then
    alter table public.schools add constraint schools_slug_key unique (slug);
  end if;
end $$;

-- Verify (chạy tay sau khi apply):
--   select conname from pg_constraint where conrelid = 'public.schools'::regclass and conname = 'schools_slug_key';
