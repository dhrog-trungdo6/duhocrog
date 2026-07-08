-- Du học ROG — schema khởi tạo
-- Chạy trong Supabase Dashboard → SQL Editor (hoặc `supabase db push`).

create extension if not exists "uuid-ossp";

-- ── leads: đăng ký tư vấn từ LeadForm / FloatingCTA ──────────────────
create table if not exists public.leads (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  phone text not null,
  country_interest text not null,          -- mã quốc gia, khớp Country['code']
  source text not null default 'homepage_form', -- 'homepage_form' | 'floating_cta' | 'footer_newsletter'
  status text not null default 'new',      -- 'new' | 'contacted' | 'consulting' | 'converted' | 'lost'
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_leads_status on public.leads (status);

-- ── events: sự kiện tư vấn du học (tab sắp/đã diễn ra) ───────────────
create table if not exists public.events (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  location text,
  href text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_events_starts_at on public.events (starts_at desc);

-- ── schools: dữ liệu SchoolFinder (thay mock src/data/schools.ts) ─────
create table if not exists public.schools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  country text not null,
  province text not null,
  level text not null check (level in ('thpt','cao-dang','dai-hoc','sau-dai-hoc','anh-ngu')),
  tuition_usd integer not null,
  scholarship_up_to integer,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_schools_filter on public.schools (country, province, level, tuition_usd);

-- ── RLS ───────────────────────────────────────────────────────────────
alter table public.leads enable row level security;
alter table public.events enable row level security;
alter table public.schools enable row level security;

-- leads: KHÔNG có policy cho anon — chỉ service role (API route) đọc/ghi.
-- events + schools: cho phép đọc công khai các bản ghi active.
create policy "Public read active events"
  on public.events for select
  using (is_active = true);

create policy "Public read active schools"
  on public.schools for select
  using (is_active = true);
