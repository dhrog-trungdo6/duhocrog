-- Migration #9: Cột cấu hình automation cho schools (rule 10 — content enrichment)
-- ============================================================================
-- official_rss_url  : nguồn RSS/tin tức chính thức của trường — n8n theo dõi
-- auto_sync_enabled : bật/tắt bot tự cào & append content_sections cho trường này
--
-- Apply TAY qua Supabase Dashboard → SQL Editor. Idempotent.

alter table public.schools
  add column if not exists official_rss_url text,
  add column if not exists auto_sync_enabled boolean not null default false;

comment on column public.schools.official_rss_url is 'Nguồn RSS/news chính thức — n8n dùng để theo dõi (rule 10)';
comment on column public.schools.auto_sync_enabled is 'Bật bot tự động làm giàu content_sections (rule 10)';
