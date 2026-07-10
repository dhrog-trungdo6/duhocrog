-- Migration #7 — Rich content JSONB theo schema scrape-test (quick facts, bảng chi phí,
-- bảng điều kiện nhập học) + cột audit nguồn cào.
-- Chạy trên Supabase Dashboard → SQL Editor — ⚠️ CHỜ kết luận scrape-test rồi mới apply.
--
-- Đánh số #7 vì: #5 (rich_school_details) ĐÃ apply cloud, #6 là backfill slug (data fix).
-- Các cột này SONG SONG với cột #5 (founded_year, school_type, intakes, content_sections
-- giữ nguyên) — Zod là nguồn chân lý cho shape JSONB, SQL chỉ CHECK nhẹ kiểu gốc.

alter table public.schools
  -- SchoolQuickFacts: { foundedYear?, schoolType?, intakes?[], studentCount?, campusCity?, websiteUrl? }
  add column if not exists quick_facts jsonb,
  -- SchoolCostBreakdown: { currency, rows: [{label, amountMin, amountMax, unit, note?}], totalEstimate? }
  add column if not exists cost_breakdown jsonb,
  -- SchoolAdmissionRequirements: { rows: [{level, gpa?, ielts?, other?}], notes? }
  add column if not exists admission_requirements jsonb,
  -- URL gốc đã cào (audit trail)
  add column if not exists source_url text,
  -- Thời điểm cào gần nhất
  add column if not exists scraped_at timestamptz;

-- CHECK nhẹ: đúng kiểu gốc JSONB (object) — cho phép NULL khi chưa có dữ liệu
alter table public.schools
  add constraint chk_schools_quick_facts_obj
    check (quick_facts is null or jsonb_typeof(quick_facts) = 'object') not valid,
  add constraint chk_schools_cost_breakdown_obj
    check (cost_breakdown is null or jsonb_typeof(cost_breakdown) = 'object') not valid,
  add constraint chk_schools_admission_req_obj
    check (admission_requirements is null or jsonb_typeof(admission_requirements) = 'object') not valid;

comment on column public.schools.quick_facts is
  'JSONB SchoolQuickFacts — xem src/types/index.ts + schoolQuickFactsSchema (Zod là nguồn chân lý)';
comment on column public.schools.cost_breakdown is
  'JSONB SchoolCostBreakdown — bảng chi phí theo mục, min/max + đơn vị tiền theo quốc gia';
comment on column public.schools.admission_requirements is
  'JSONB SchoolAdmissionRequirements — bảng điều kiện đầu vào theo bậc học';
comment on column public.schools.source_url is 'URL trang gốc đã cào (audit)';
comment on column public.schools.scraped_at is 'Thời điểm cào dữ liệu gần nhất';
