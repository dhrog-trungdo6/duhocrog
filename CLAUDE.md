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
@.claude/rules/06-token-optimization.md
@.claude/rules/07-webhook-n8n-integrity.md
@.claude/rules/08-omnichannel-notifications.md
@.claude/rules/09-event-driven-supabase.md
@.claude/rules/10-content-enrichment-automation.md
@.claude/rules/11-ai-agent-rag-readiness.md

---

## Database Schema (Supabase PostgreSQL)

| # | Migration | Bảng/Cột | Trạng thái Cloud |
|---|-----------|---------|-----------------|
| 1 | `20260708000001` | `leads` (full_name, phone, country_interest, source, status, utm_*, created_at) + `events` (title, description, starts_at, location, href, is_active) + `schools` (name, country, province, level, tuition_usd, scholarship_up_to, logo_url, is_active) + RLS | ✅ Applied |
| 2 | `20260708000002` | `leads.note` (text — ghi chú chăm sóc CRM) | ✅ Applied |
| 3 | `20260709000003` | `lead_activities` (lead_id FK, staff_name, action_type, content, created_at) — nhật ký chăm sóc | ✅ Applied |
| 4 | `20260710000004` | `schools.*` — thêm 9 cột: `slug` (unique partial index), `description`, `website_url`, `image_url`, `video_url`, `gallery_urls[]`, `highlights[]`, `programs[]`, `requirements[]` | ✅ Applied |
| 5 | `20260710000005` | `schools.*` — thêm 6 cột: `founded_year`, `school_type`, `total_students`, `intakes[]`, `map_embed_url`, `content_sections` (JSONB discriminated union: html/list/table) + GIN index | ✅ Applied |
| 6 | `20260710000006` | Backfill data: gán `slug` cho 22 trường seed trước khi có logic slug (idempotent, chỉ update row null) | ✅ Đã chạy (verify 0 row slug null) |
| 7 | `20260711000007` | `schools.*` — thêm 5 cột: `quick_facts`, `cost_breakdown`, `admission_requirements` (JSONB, Zod là nguồn chân lý) + `source_url`, `scraped_at` (audit crawler) | ✅ Applied (kiểm chứng scrape-test: `scripts/scrape-test/output/report.md`) |
| 8 | `20260711000008` | Thay partial index `idx_schools_slug` bằng unique constraint `schools_slug_key` — mở khóa PostgREST `on_conflict=slug` (partial index làm mọi upsert REST trả 400) | ❌ CHƯA apply — chạy tay Dashboard khi tiện (crawl đã chạy OK bằng GET→PATCH/POST, không gấp) |
| 9 | `20260711000009` | `schools.official_rss_url` (text) + `auto_sync_enabled` (boolean default false) — cấu hình automation rule 10 (n8n theo dõi RSS) | ❌ CHƯA apply — Tab Automation trong SchoolFormModal chỉ gửi 2 cột này khi user điền/row đã có cột (null-safe trước khi apply) |

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
- Dữ liệu: ✅ 22 trường đã seed cloud, nhưng seed TRƯỚC khi có slug → cần chạy backfill
  `20260710000006_backfill_school_slugs.sql` trên Dashboard (gán slug từ tên, idempotent)
- FE vẫn fallback mock 22 trường (có slug sẵn) khi API lỗi

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
v1.6.0: StudyDestination, StudyAbroadMegaMenuProps, Article (+isHot?; ảnh dùng thumbnailUrl — imageUrl đã gỡ vì trùng)
v1.7.0: SchoolProgram, SchoolSection (HtmlSection|ListSection|TableSection discriminated union),
        School/SchoolRow mở rộng (slug, description, media, quick facts, content_sections)
v1.8.0: SchoolQuickFacts, CostRow, SchoolCostBreakdown, AdmissionRow, SchoolAdmissionRequirements
        (JSONB migration #7 — kiểm chứng bằng scrape-test think.edu.vn)
v1.9.0: SchoolFormModalProps (modal Thêm/Sửa trường admin; Zod: schoolFormSchema trong validations)
v1.10.0: SchoolRow +official_rss_url/auto_sync_enabled (optional — migration #9);
         schoolEditFormSchema + SchoolEditFormValues (validations — form 4 tab)
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
| Admin CRM | `src/app/admin/` + `src/components/admin/` | **v1.10.0** — LeadsTab 2 cột, EventsTab CRUD; SchoolsTab: search + bảng 8 cột + toggle active (soft delete) + seed; SchoolFormModal 4 tab (rule 10): Tổng quan / Quick Facts & Chi phí / Content Builder (useFieldArray html·list·table, thêm hàng/cột) / Automation — sub-components trong `school-form/`, Zod schoolEditFormSchema |
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
| Supabase migration #4 (school_details) | ✅ Applied cloud |
| 🆕 Supabase migration #5 (rich_school_details) | ✅ Applied cloud |

### Vấn đề đang mở

- [x] Migration #2 (`leads.note`) — ✅ Applied
- [x] Migration #3 (`lead_activities`) — ✅ Applied
- [x] **Migration #4 (`school_details`) — ✅ ĐÃ APPLY** (2026-07-10, user chạy Dashboard)
- [x] **Migration #5 (`rich_school_details`) — ✅ ĐÃ APPLY** (2026-07-10, user chạy Dashboard)
- [x] Trang `/truong/[slug]` — ✅ ĐÃ NỐI SUPABASE (v1.8.0): fetch theo slug qua `fetchSchoolBySlug`
  (lib/schools-server.ts), merge ưu tiên DB đè mock (`mergeSchoolPreferDb`), ISR 300s;
  render QuickFactsCard + CostBreakdown + AdmissionRequirements + content_sections (html sanitize)
- [x] Backfill slug (#6) — ✅ Đã chạy (0 row slug null)
- [x] Migration #7 (`school_rich_content`) — ✅ Applied (kiểm chứng scrape-test 3 trường, 0 lỗi Zod)
- [x] **Crawl thật — ✅ HOÀN THÀNH 38/38** (2026-07-10, `scripts/batch-crawl.ts` dùng parser thật
  scrape-test, upsert 2 bước GET→PATCH/POST): 35 trường mới `is_active=false` chờ duyệt,
  3 trường trùng seed (ball-state, manchester, winchester) được enrich dữ liệu giàu
  (đã khôi phục `is_active=true` + logo sau sự cố lần chạy đầu đè cột)
- [ ] **Migration #8 (`slug_unique_constraint`) — CHƯA apply**: chạy tay Dashboard (fix gốc lỗi 400
  của `on_conflict=slug`; không gấp vì batch-crawl không còn dùng on_conflict)
- [ ] **Duyệt 35 trường mới crawl** trong Admin SchoolsTab (`is_active=false`) → kiểm tra rồi bật active
- [ ] `scripts/crawler.ts` cũ — selectors GIẢ ĐỊNH, đã bị `batch-crawl.ts` thay thế trên thực tế
- [ ] Lead test trong bảng leads — xóa qua Supabase Dashboard
- [ ] `src/config/site.ts` placeholder toàn bộ
- [ ] Ảnh thật thay placeholder
- [ ] Resend email notification

### Next Steps (ưu tiên)

1. **Duyệt 35 trường mới crawl** trong Admin (`is_active=false`) — kiểm tra dữ liệu rồi bật active
2. **Apply migration #8** (`slug_unique_constraint`) trên Supabase Dashboard → SQL Editor
3. **Xóa lead test** trên Supabase Dashboard (`delete from leads where full_name = 'TEST Claude production - xoá sau'`)
4. **Điền thông tin thương hiệu** `src/config/site.ts` + ảnh thật thay placeholder

### Change Log

| Ngày | Phiên | Thay đổi |
|------|-------|---------|
| 2026-07-11 | #14 — Advanced School Form v1.10.0 + rules 07–10 | 4 rule mới (webhook n8n, notifications, event-driven, content enrichment); Migration #9 (official_rss_url + auto_sync_enabled — CHƯA apply); SchoolFormModal 4 tab: BasicInfo/QuickFactsCost/ContentBuilder/Automation (school-form/, mỗi file <300 dòng); Content Builder useFieldArray html·list·table (bảng có thêm/xóa hàng-cột, rename header remap key); schoolEditFormSchema + fix tableRowSchema annotation (z.input unknown vỡ zodResolver); payload null-safe cột #9 |
| 2026-07-11 | #13 — Admin Schools CRUD v1.9.0 + login RHF | Login page chuyển react-hook-form + zodResolver (tái dùng adminLoginSchema, tuân thủ Nguyên tắc #5); SchoolsTab viết lại: search bar, nút Thêm trường mới, cột Tỉnh/Bang + Hành động (Sửa), SchoolFormModal mới (overlay Tailwind thuần, RHF + zodResolver, schoolFormSchema tiếng Việt, option fallback country/province từ crawler); PATCH sửa trường qua modal; giữ toggle is_active = soft delete (rule 04, không xóa cứng); verify e2e auth 5/5 + schema test |
| 2026-07-10 | #12 — Crawl thật 38/38 + Migration #8 | Chẩn đoán lỗi 400 batch crawl: KHÔNG phải think.edu.vn (trả 200) mà là PostgREST `on_conflict=slug` không suy ra được partial index → viết migration #8 (unique constraint thường, CHƯA apply); `batch-crawl.ts` chuyển upsert 2 bước GET→PATCH/POST + nhánh UPDATE không đè cột phá seed (`is_active`/`logo_url`/`image_url`/basics rỗng) + `level` ưu tiên `entry.levels` từ urls.json; chạy crawl 38/38 OK (35 insert inactive, 3 update enrich); khôi phục 3 row seed bị lần chạy đầu deactivate + xóa logo (verify 22 active) |
| 2026-07-10 | #11 — Trang chi tiết nối Supabase v1.8.0 | `fetchSchoolBySlug` + `mergeSchoolPreferDb` (lib/schools-server.ts, service role, fallback mock); page async + ISR 300s; QuickFactsCard sidebar (#5+#7), CostBreakdownSection, AdmissionRequirementsSection, ContentSectionBlock (html sanitize qua lib/sanitize.ts / list / table); verify e2e: DB row 200, mock merge giữ nội dung giàu, 404 đúng |
| 2026-07-10 | #10 — Scrape-test + Migration #7 v1.8.0 | Kiểm chứng khả thi cào think.edu.vn (robots.txt OK, HTML tĩnh, selector thật: .detail-school-info/.page-content-area/#toc_container); Migration #7 (quick_facts/cost_breakdown/admission_requirements JSONB + source_url/scraped_at — CHƯA apply); +5 types v1.8.0 + 5 Zod schemas; scripts/scrape-test (scrape/parsers/report, robots-aware, delay 3s, offline re-parse); coverage report 3 trường (0 lỗi Zod); generate-urls.ts v2 nguồn danh-sach-truong theo level (38 trường + levels, hết rác); crawler.ts nhận levels từ urls.json |
| 2026-07-10 | #9 — School Detail Page v1.7.0 | Trang `/truong/[slug]` Server Component; Hero gradient + logo + badges; 2-column grid (description, highlights, programs, requirements + sticky sidebar tuition/scholarship CTA); 3 trường mock (Ball State, UMass Boston, Green River College); generateMetadata SEO |
| 2026-07-10 | #8 — Mega Menu DU HỌC v1.6.0 | StudyAbroadMegaMenu (desktop full-width, nav-bg: bg-navy, sidebar 6 nước + featured/related articles grid); Fix positioning: move Mega Menu outside `<li>` vào header-level wrapper; StudyDestination, StudyAbroadMegaMenuProps types; megaMenu mock data (6 nước, 24 bài viết); Article extended (imageUrl?, isHot?) |
| 2026-07-09 | #7 — SchoolFilter + DU HỌC dropdown v1.5.0 | SchoolFilter component (props-driven, Radix Slider); Trang `/tim-truong` + `?country=`; Dropdown "DU HỌC" 12 nước; StudyDestinations links; "Tiếng Anh" → "Tìm Trường"; +4 types |
| 2026-07-09 | #6 — Dịch vụ Visa v1.4.0 | Dropdown "DỊCH VỤ" + Trang `/dich-vu/visa` 10 section + 5 components + accent-orange |
| 2026-07-09 | #5 — CRM 2 cột | Panel chi tiết + nhật ký + stats + Zalo/gọi |
| 2026-07-09 | #4 — CRM quản lý | LeadsTab: search, filter, note, export Excel |
| 2026-07-08 | #3 — Admin CRM + Supabase | Admin + middleware + 9 API routes |
| 2026-07-08 | #2 — Supabase + Events | Migration #1 + POST /api/leads + Events empty state |
| 2026-07-08 | #1 — Homepage | Scaffold + 13 sections + SchoolFinder cascading |