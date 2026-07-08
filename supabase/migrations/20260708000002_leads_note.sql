-- Migration #2 — CRM: cột ghi chú chăm sóc lead
-- Chạy trên Supabase Dashboard → SQL Editor (project chưa link CLI)

alter table public.leads
  add column if not exists note text;

comment on column public.leads.note is 'Ghi chú chăm sóc khách — admin CRM nhập, tối đa 2000 ký tự (validate ở API)';
