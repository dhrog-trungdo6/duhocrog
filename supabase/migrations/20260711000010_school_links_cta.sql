-- Migration #10: Khối CTA + bài viết liên quan cho trang chi tiết trường (rule 12)
-- ============================================================================
-- show_cta       : bật/tắt khối CTA "Vì sao chọn Du học ROG?" cuối bài
-- related_slugs  : mảng slug trường khác — render "Bài viết liên quan"
--
-- Apply TAY qua Supabase Dashboard → SQL Editor. Idempotent.

alter table public.schools
  add column if not exists show_cta boolean not null default true,
  add column if not exists related_slugs text[] not null default '{}';

comment on column public.schools.show_cta is 'Hiện khối CTA mặc định cuối trang chi tiết (rule 12)';
comment on column public.schools.related_slugs is 'Slug các trường liên quan — section Bài viết liên quan';
