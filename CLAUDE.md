# DU HỌC ROG — CLAUDE PROJECT MEMORY

## Tên dự án
**ROG Education (Du học ROG)** — Nền tảng tư vấn du học.
Tên miền dự kiến: `duhocrog.com` (TODO: xác nhận domain thật).
Tham chiếu thiết kế: website **thinkEDU** (think.edu.vn) — ảnh mẫu user cung cấp.
Spec gốc: file prompt `CLAUDE (1).md` (Senior Frontend Engineer — Homepage).

## Thông tin liên lạc chính thức

> ⚠️ **TOÀN BỘ ĐANG LÀ PLACEHOLDER** — tập trung tại `src/config/site.ts`, KHÔNG hardcode trong component.
> Khi có thông tin thật chỉ cần sửa 1 file này.

| Trường | Giá trị hiện tại | Trạng thái |
|--------|-----------------|-----------|
| **Hotline** | 0909 000 000 | ❌ TODO |
| **Email** | info@duhocrog.com | ❌ TODO |
| **Địa chỉ** | 123 Đường ABC, Phường X, Quận Y, TP.HCM | ❌ TODO |
| **Zalo** | zalo.me/0909000000 | ❌ TODO |
| **Facebook / YouTube / TikTok** | facebook.com/duhocrog ... | ❌ TODO |

---

## Tech Stack

| Lớp | Công nghệ |
|-----|-----------|
| Framework | Next.js 14.2.5, App Router, TypeScript strict |
| Styling | Tailwind CSS v3 — KHÔNG dùng MUI / Ant Design |
| Form | react-hook-form + Zod — BẮT BUỘC với mọi form và API route |
| UI primitives | @radix-ui/react-slider (dual-handle), lucide-react icons |
| Database | Supabase (PostgreSQL + RLS) — ✅ ĐÃ kết nối, env trong `.env.local` |
| Font | Be Vietnam Pro (next/font) |
| Package manager | pnpm |
| Deploy | Vercel — ✅ ĐÃ link repo (`.vercel/repo.json`) |

> **KHÔNG dùng Zustand/MongoDB.** User từng gửi chuỗi `mongodb+srv://...` gọi nhầm là "Supabase" —
> đã thống nhất dùng Supabase PostgreSQL. Nếu user nhắc lại MongoDB → giải thích lại.

---

## Màu sắc thương hiệu

```
Primary Blue:  #005BAA   ← header nav, section titles (primary)
Light Blue:    #0078D7   ← hover state (primary-light)
Dark Blue:     #004A8C   ← gradient SchoolFinder (primary-dark)
Accent Red:    #DC2626   ← hotline, CTA, badge học bổng (accent)
Accent Orange: #FF6B00   ← giá tiền, hover sub-link dropdown (accent-orange)
Navy:          #0B2545   ← footer, testimonial, Mega Menu bg (navy)
```

> Màu khai báo trong `tailwind.config.ts` theme extend — KHÔNG hardcode hex trong className.

---

## 8 Nguyên tắc bất biến

1. **KHÔNG** tự ý xóa file hoặc module — chỉ patch/extend
2. **KHÔNG** dùng third-party UI library nặng (MUI, Ant Design, Chakra...)
3. **KHÔNG** merge code nếu chưa kiểm tra type contract với `src/types/index.ts`
4. `<ErrorBoundary>` bọc toàn trang ở `layout.tsx` — lỗi 1 module không crash toàn trang
5. Mọi form/input **phải validate bằng Zod** trước khi ghi Supabase
6. Mọi API fetch **phải có `try/catch`** và UI fallback khi lỗi mạng
7. Thông tin thương hiệu **chỉ lấy từ `src/config/site.ts`** — không hardcode hotline/email/địa chỉ
8. Mock data đặt trong `src/data/*.ts` (typed array) — KHÔNG hardcode trong JSX

---

## Bộ 5 Skill cốt lõi (ruleset chi tiết — `.claude/rules/`)

> Chia nhỏ 8 nguyên tắc + tech stack thành ruleset chuyên đề. Nội dung được nạp qua import bên dưới.
> ⚠️ 2 điểm đã sửa so với template ngoài: dự án **KHÔNG dùng Zustand** và **KHÔNG dùng @supabase/ssr**
> (kiến trúc thật: getSupabaseAdmin() service-role + cookie admin tự quản).

@.claude/rules/01-nextjs-app-router.md
@.claude/rules/02-ui-tailwind.md
@.claude/rules/03-typescript-zod.md
@.claude/rules/04-supabase-rls.md
@.claude/rules/05-architecture-patch.md

---

## Database Schema (Supabase PostgreSQL)

| # | Migration | Bảng/Cột | Trạng thái Cloud |
|---|-----------|---------|-----------------|
| 1 | `20260708000001` | `leads` (full_name, phone, country_interest, source, status, utm_*, created_at) + `events` (title, description, starts_at, location, href, is_active) + `schools` (name, country, province, level, tuition_usd, scholarship_up_to, logo_url, is_active) + RLS | ✅ Applied |
| 2 | `20260708000002` | `leads.note` (text — ghi chú chăm sóc CRM) | ✅ Applied |
| 3 | `20260709000003` | `lead_activities` (lead_id FK, staff_name, action_type, content, created_at) — nhật ký chăm sóc | ✅ Applied |
| 4 | `20260710000004` | `schools.*` — thêm 9 cột: `slug` (unique partial index), `description`, `website_url`, `image_url`, `video_url`, `gallery_urls[]`, `highlights[]`, `programs[]`, `requirements[]` | ⚠️ **CHƯA apply** |

### Chi tiết từng bảng:

**leads** — đăng ký tư vấn:
- RLS: **KHÔNG public** — chỉ service role (API route) đọc/ghi
- Index: `created_at DESC`, `status`
- Source: `homepage_form` | `floating_cta` | `footer_newsletter`
- Status: `new` → `contacted` → `consulting` → `converted` | `lost`

**events** — sự kiện tư vấn:
- RLS: public read `is_active = true`
- Index: `starts_at DESC`

**schools** — dữ liệu trường:
- RLS: public read `is_active = true`
- Index: composite `(country, province, level, tuition_usd)` cho filter
- Schema hiện tại (có slug từ code nhưng chưa có migration #4): FE mock 22 trường; seed API tạo slug từ name

**lead_activities** — nhật ký CRM:
- FK: `lead_id → leads(id) ON DELETE CASCADE`
- RLS: **KHÔNG public** — chỉ service role
- Index: `(lead_id, created_at DESC)`
- action_type: `note` | `call` | `email` | `status_change` | `other`

---

## Data Contract cốt lõi

> Types: `src/types/index.ts` (1 file duy nhất — hiện 276 dòng, ~30 interfaces)

```typescript
// ── Quy ước chung ────────────────────────────────────────────
Mọi timestamp  → string ISO 8601, UI convert UTC+7
Học phí        → number USD/năm
Mã quốc gia    → Country['code'] lowercase

// ── Types theo phiên bản ─────────────────────────────────────
v1.0.0: LeadFormData, School, EventItem, StudyLevel, Country, Province...
v1.4.0: ServiceMenuItem, VisaType, VisaProcessStep, DocumentRequirement, PricingItem, FAQItem
v1.5.0: FilterOption, ProvinceFilterOption, FilterState, SchoolFilterProps
v1.6.0: StudyDestination, StudyAbroadMegaMenuProps, Article extended (imageUrl?, isHot?)
```

---

## Kiến trúc tính năng chính

| Module | File chính | Phiên bản |
|--------|-----------|----------|
| ⭐ SchoolFinder | `src/components/home/SchoolFinder.tsx` | v1.1.0 — cascading + dual slider + fetch `/api/schools` fallback mock |
| Destination Hub | `src/components/home/StudyDestinations.tsx` | v1.5.0 — 12 quốc gia lục giác link `/tim-truong?country=` |
| RogHeader | `src/components/layout/RogHeader.tsx` | **v1.6.0** — 2 dropdown: Mega Menu "DU HỌC" (full-width, 6 nước sidebar + articles) + "DỊCH VỤ" (simple list). Mobile accordion |
| 🆕 Mega Menu | `src/components/layout/StudyAbroadMegaMenu.tsx` | **v1.6.0** — desktop-only, `bg-navy`, sidebar 6 quốc gia + grid featured/related articles, `next/image` có guard placeholder |
| 🆕 Mega Menu Data | `src/data/megaMenu.ts` | **v1.6.0** — 6 nước (Mỹ, Canada, Úc, Anh, Singapore, NZ), mỗi nước 1 featured + 3 related |
| SchoolFilter | `src/components/schools/SchoolFilter.tsx` | v1.5.0 — banner lọc trường, dùng Radix Slider trực tiếp |
| Tìm Trường | `src/app/tim-truong/page.tsx` | v1.5.0 — hiển thị tất cả trường + `?country=` query |
| Dịch vụ Visa | `src/app/dich-vu/visa/page.tsx` | v1.4.0 — 10 section landing |
| Service Components | `src/components/services/` | v1.4.0 — ServiceTabs, ServiceCard, CountryBadges, DataTable, FaqAccordion |
| Admin CRM | `src/app/admin/` + `src/components/admin/` | v1.3.0 — LeadsTab 2 cột (bảng + panel chi tiết/nhật ký), EventsTab CRUD, SchoolsTab CRUD + seed |
| FloatingCTA | `src/components/layout/FloatingCTA.tsx` | v1.0.0 — Zalo/Hotline/Đăng ký nổi |
| LeadForm | `src/components/home/LeadForm.tsx` | v1.0.0 — Zod + honeypot |
| EventsTabs | `src/components/home/EventsTabs.tsx` | v1.1.0 — upcoming/past tabs + empty state |
| StatsCounter | `src/components/home/StatsCounter.tsx` | v1.0.0 — IntersectionObserver |
| TestimonialCarousel | `src/components/home/TestimonialCarousel.tsx` | v1.0.0 — nền navy |

### Header NAV_ITEMS (v1.6.0):
```
Trang chủ → /
Về chúng tôi → #
DU HỌC ▼ → Mega Menu (6 nước sidebar + articles) + /tim-truong?country=
DỊCH VỤ ▼ → Simple dropdown (Visa, Gia hạn, Bảo hiểm, Dịch thuật, Luyện PV)
Tìm Trường → /tim-truong
Tuyển sinh → #school-finder
Tin tức → #news
```

---

## API Routes

| Route | Method | Status |
|-------|--------|--------|
| `/api/leads` | POST/GET | ✅ v1.3.0 |
| `/api/leads/[id]` | PATCH | ✅ v1.2.0 |
| `/api/leads/[id]/activities` | GET/POST | ✅ v1.0.0 |
| `/api/events` | GET | ✅ v1.0.0 |
| `/api/schools` | GET | ✅ v1.0.0 |
| `/api/admin/login` | POST | ✅ v1.0.0 |
| `/api/admin/logout` | POST | ✅ v1.0.0 |
| `/api/admin/events` (+[id]) | CRUD | ✅ v1.0.0 |
| `/api/admin/schools` (+[id]) | CRUD + seed | ✅ v1.0.0 |

> Auth: `middleware.ts` (Edge/Web Crypto) + `admin-auth.ts` (Node crypto) — cùng SHA-256 token.

---

## Cấu trúc thư mục nhanh

```
src/
├── app/
│   ├── layout.tsx         ← Header + Footer + FloatingCTA + ErrorBoundary
│   ├── page.tsx           ← 13 sections homepage
│   ├── admin/             ← CRM (Leads/Events/Schools tabs) + login
│   ├── crm/               ← redirect → /admin
│   ├── dich-vu/visa/      ← v1.4.0
│   ├── tim-truong/        ← v1.5.0
│   └── api/               ← 10 routes
├── middleware.ts
├── components/
│   ├── ui/                ← Button, Slider, Skeleton, ErrorBoundary
│   ├── layout/            ← RogHeader (v1.6.0 Mega Menu), RogFooter, FloatingCTA, StudyAbroadMegaMenu (v1.6.0)
│   ├── home/              ← 9 homepage sections + LeadForm
│   ├── admin/             ← LeadsTab, EventsTab, SchoolsTab
│   ├── services/          ← v1.4.0: 5 components
│   └── schools/           ← v1.5.0: SchoolFilter
├── data/                  ← destinations (+studyAbroadMenuData), schools, megaMenu (v1.6.0), services, events, news, stats, partners, testimonials
├── config/site.ts
├── lib/                   ← supabase/admin.ts, admin-auth.ts, validations.ts
└── types/index.ts         ← ~30 interfaces, 1 file duy nhất
supabase/migrations/       ← #1 (initial), #2 (leads.note), #3 (lead_activities), #4 (school_details — CHƯA apply)
```

---

## Hạ tầng

```
GitHub  : https://github.com/dhrog-trungdo6/duhocrog.git (main) ✅
Vercel  : Auto-deploy từ main ✅
Supabase: Kết nối + 3 migrations applied ✅
Resend  : ❌ chưa dùng
```

---

## 📝 CẬP NHẬT GẦN NHẤT & HÀNH ĐỘNG TIẾP THEO

### Trạng thái Modules

| Module | Trạng thái |
|--------|-----------|
| Homepage v1 | ✅ |
| SchoolFinder | ✅ |
| EventsTabs | ✅ |
| Lead Capture API | ✅ |
| Admin CRM (Leads/Events/Schools) | ✅ |
| Admin Auth (middleware + cookie) | ✅ |
| Dịch vụ Visa (v1.4.0) | ✅ |
| SchoolFilter + Tìm Trường (v1.5.0) | ✅ |
| 🆕 Mega Menu DU HỌC (v1.6.0) | ✅ |
| 🆕 School Detail Page (v1.7.0) | ✅ |
| Supabase schema #1, #2, #3 | ✅ Applied cloud |
| Supabase migration #4 (school_details) | ⚠️ **CHƯA apply** |

### Vấn đề đang mở

- [x] Migration #2 (`leads.note`) — ✅ Applied
- [x] Migration #3 (`lead_activities`) — ✅ Applied
- [ ] **Migration #4 (`school_details`) — ⚠️ CHƯA apply cloud**: chạy Dashboard → SQL Editor. API admin schools seed đã gửi `slug`, Zod đã validate các cột mới → trước khi tạo/sửa trường qua admin PHẢI apply migration này
- [x] Trang `/truong/[slug]` — ✅ ĐÃ XÂY (Server Component, 3 trường mock: Ball State, UMass Boston, Green River College). Cần nối Supabase sau khi apply migration #4
- [ ] Lead test trong bảng leads — xóa qua Supabase Dashboard
- [ ] `src/config/site.ts` placeholder toàn bộ
- [ ] Ảnh thật thay placeholder
- [ ] Resend email notification

### Next Steps (ưu tiên)

1. **Apply migration #4** trên Supabase Dashboard — cần thiết trước khi dùng admin SchoolsTab
2. ~~**Xây trang `/truong/[slug]`**~~ ✅ ĐÃ XONG — nối Supabase sau khi apply migration #4
3. **Nhập dữ liệu thật** + điền thông tin thương hiệu

### Change Log

| Ngày | Phiên | Thay đổi |
|------|-------|---------|
| 2026-07-10 | #9 — School Detail Page v1.7.0 | Trang `/truong/[slug]` Server Component; Hero gradient + logo + badges; 2-column grid (description, highlights, programs, requirements + sticky sidebar tuition/scholarship CTA); 3 trường mock (Ball State, UMass Boston, Green River College); generateMetadata SEO |
| 2026-07-10 | #8 — Mega Menu DU HỌC v1.6.0 | StudyAbroadMegaMenu (desktop full-width, nav-bg: bg-navy, sidebar 6 nước + featured/related articles grid); Fix positioning: move Mega Menu outside `<li>` vào header-level wrapper; StudyDestination, StudyAbroadMegaMenuProps types; megaMenu mock data (6 nước, 24 bài viết); Article extended (imageUrl?, isHot?) |
| 2026-07-09 | #7 — SchoolFilter + DU HỌC dropdown v1.5.0 | SchoolFilter component (props-driven, Radix Slider); Trang `/tim-truong` + `?country=`; Dropdown "DU HỌC" 12 nước; StudyDestinations links; "Tiếng Anh" → "Tìm Trường"; +4 types |
| 2026-07-09 | #6 — Dịch vụ Visa v1.4.0 | Dropdown "DỊCH VỤ" + Trang `/dich-vu/visa` 10 section + 5 components + accent-orange |
| 2026-07-09 | #5 — CRM 2 cột | Panel chi tiết + nhật ký + stats + Zalo/gọi |
| 2026-07-09 | #4 — CRM quản lý | LeadsTab: search, filter, note, export Excel |
| 2026-07-08 | #3 — Admin CRM + Supabase | Admin + middleware + 9 API routes |
| 2026-07-08 | #2 — Supabase + Events | Migration #1 + POST /api/leads + Events empty state |
| 2026-07-08 | #1 — Homepage | Scaffold + 13 sections + SchoolFinder cascading |