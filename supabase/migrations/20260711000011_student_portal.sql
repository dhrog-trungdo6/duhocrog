-- Migration #11: Student Portal — Ví tài liệu số hóa + mã truy cập portal
-- ============================================================================
-- KIẾN TRÚC AUTH (khác sơ đồ gốc — lý do: rule 04 dự án KHÔNG dùng Supabase Auth):
--   Sơ đồ đề xuất leads.student_id FK -> auth.users + RLS auth.uid().
--   Dự án dùng cookie tự quản (như admin_session): học sinh đăng nhập bằng
--   SĐT + mã truy cập do tư vấn viên cấp từ CRM. Server xác thực rồi truy cập
--   DB qua service role → RLS khóa anon HOÀN TOÀN (pattern bảng leads).
--
-- Apply TAY qua Supabase Dashboard → SQL Editor. Idempotent.

-- 1. leads: hash SHA-256 của mã truy cập portal (null = chưa cấp quyền portal)
alter table public.leads
  add column if not exists portal_code_hash text;

comment on column public.leads.portal_code_hash is
  'SHA-256("rog-portal:" + mã truy cập) — học sinh đăng nhập Student Portal bằng SĐT + mã này';

-- 2. Bảng student_documents — Ví tài liệu số hóa
create table if not exists public.student_documents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  document_type text not null check (
    document_type in ('passport', 'transcript', 'ielts_pte', 'sop', 'lor', 'financial')
  ),
  file_path text not null,          -- path trong bucket student-documents (Supabase Storage)
  file_name text not null,          -- tên file gốc học sinh upload
  status text not null default 'pending_review' check (
    status in ('pending_review', 'approved', 'rejected')
  ),
  notes text,                       -- lý do từ chối / ghi chú của admin
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.student_documents is
  'Ví tài liệu số hóa Student Portal — học sinh upload, admin duyệt (pending_review → approved/rejected)';

-- 3. RLS: KHÔNG policy anon — chỉ service role đọc/ghi (auth ở API layer, pattern leads)
alter table public.student_documents enable row level security;

-- 4. Index: truy vấn danh sách tài liệu theo hồ sơ (mới nhất trước)
create index if not exists idx_student_documents_lead_id
  on public.student_documents (lead_id, created_at desc);

-- 5. Storage bucket riêng tư — giới hạn cứng 10MB + whitelist MIME ngay tại bucket
--    (defense-in-depth: Zod chặn ở client/API, bucket chặn kẻ bypass API)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'student-documents',
  'student-documents',
  false,
  10485760, -- 10MB
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do nothing;
