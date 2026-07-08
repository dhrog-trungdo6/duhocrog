-- Migration #3 — CRM: nhật ký chăm sóc lead (tham khảo Nam Ngân lead_activities)
-- Chạy trên Supabase Dashboard → SQL Editor (project chưa link CLI)

create table if not exists public.lead_activities (
  id uuid primary key default uuid_generate_v4(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  staff_name text not null default 'Admin',
  action_type text not null check (action_type in ('note','call','email','status_change','other')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_lead_activities_lead
  on public.lead_activities (lead_id, created_at desc);

-- RLS: KHÔNG có policy cho anon — chỉ service role (API route) đọc/ghi, giống bảng leads.
alter table public.lead_activities enable row level security;
