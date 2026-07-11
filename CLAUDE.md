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
@.claude/rules/12-dynamic-toc-and-embeds.md
@.claude/rules/13-ai-web-scraping-extraction.md
@.claude/rules/14-idempotent-upsert-pattern.md

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
| 8 | `20260711000008` | Thay partial index `idx_schools_slug` bằng unique constraint `schools_slug_key` — mở khóa PostgREST `on_conflict=slug` (partial index làm mọi upsert REST trả 400) | ✅ Applied (2026-07-11, verify: POST on_conflict=slug trả 200) |
| 9 | `20260711000009` | `schools.official_rss_url` (text) + `auto_sync_enabled` (boolean default false) — cấu hình automation rule 10 (n8n theo dõi RSS) | ✅ Applied (2026-07-11, verify cột trả giá trị) |
| 10 | `20260711000010` | `schools.show_cta` (boolean default true) + `related_slugs` (text[] default '{}') — khối CTA + Bài viết liên quan trang chi tiết | ✅ Applied (2026-07-11, verify cột trả giá trị) |
| 11 | `20260711000011` | Student Portal: `leads.portal_code_hash` (text) + bảng `student_documents` (lead_id FK cascade, document_type, file_path, file_name, status, notes, RLS khóa anon, index lead_id+created_at desc) + bucket Storage `student-documents` (private, 10MB, PDF/JPEG/PNG) | ❌ **CHƯA apply** — chạy tay Dashboard |

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

**student_documents** — Ví tài liệu số hóa Student Portal (migration #11, ❌ chưa apply):
- FK: `lead_id → leads(id) ON DELETE CASCADE`
- RLS: **KHÔNG public** — chỉ service role; quyền học sinh enforce ở API qua cookie `student_session`
- document_type: `passport` | `transcript` | `ielts_pte` | `sop` | `lor` | `financial`
- status: `pending_review` → `approved` | `rejected` (rejected bắt buộc notes)
- File thật nằm bucket private `student-documents`, path `{leadId}/{type}/{ts}-{file}`

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
v1.12.0: Student Portal — DOCUMENT_TYPES/DocumentType/DocumentStatus (+labels), StudentDocument,
         StudentProfile (subset an toàn của LeadRow), LeadRow +portal_code_hash?;
         Zod: portalLoginSchema, fileUploadSchema (client 10MB PDF/JPEG/PNG),
         documentUploadRequestSchema, documentMetaSchema, documentReviewSchema
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
| `/api/portal/login` · `logout` | POST | ✅ v1.12.0 — SĐT + mã truy cập (so hash leads.portal_code_hash) |
| `/api/portal/documents` | GET/POST | ✅ v1.12.0 — Ví tài liệu; POST verify prefix `{leadId}/` + log lead_activities |
| `/api/portal/documents/upload-url` | POST | ✅ v1.12.0 — signed upload URL (PUT thẳng Storage, né limit 4.5MB Vercel) |
| `/api/admin/portal/code` | POST | ✅ v1.12.0 — cấp mã portal, trả plaintext 1 lần, DB chỉ lưu hash |
| `/api/admin/documents/[id]` | PATCH | ✅ v1.12.0 — duyệt/từ chối tài liệu (rejected bắt buộc notes) |

> Auth: `middleware.ts` (Edge/Web Crypto) + `admin-auth.ts` (Node crypto) — cùng SHA-256 token.
> Student Portal: cookie `student_session` = `{leadId}.{SHA-256("rog-student:"+leadId+":"+ADMIN_PASSWORD)}` —
> middleware.ts (Edge) + `portal-auth.ts` (Node) cùng công thức, sửa 1 nơi phải sửa cả 2.
> ⚠️ Middleware chỉ che PAGES (/admin, /portal) — mọi route `/api/admin/*` PHẢI tự gọi
> `isAdminRequest()`, mọi route `/api/portal/*` PHẢI tự gọi `getStudentLeadId()`.

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
│   ├── portal/            ← v1.12.0 Student Portal: login/ + (dashboard)/{layout,page,ho-so}
│   └── api/               ← 16 routes (leads, events, schools, admin/*, portal/*)
├── middleware.ts          ← bảo vệ /admin + /portal (Edge, SHA-256 Web Crypto)
├── components/
│   ├── ui/                ← Button, Slider, Skeleton, ErrorBoundary
│   ├── layout/            ← RogHeader (v1.6.0 Mega Menu), RogFooter, FloatingCTA, StudyAbroadMegaMenu (v1.6.0)
│   ├── home/              ← 9 homepage sections + LeadForm
│   ├── admin/             ← LeadsTab, EventsTab, SchoolsTab, SchoolFormModal (6 tab) + school-form/
│   ├── services/          ← v1.4.0: 5 components
│   ├── schools/           ← v1.5.0: SchoolFilter
│   └── portal/            ← v1.12.0: PortalSidebar, ApplicationProgressBar, DocumentUploadCard, DocumentList
├── data/                  ← destinations, schools, megaMenu, ctaBox, services, events, news, stats, partners, testimonials
├── config/site.ts
├── lib/                   ← supabase/admin.ts, admin-auth.ts, portal-auth.ts, portal-server.ts, validations.ts, schools-server.ts, sanitize.ts, slug.ts
└── types/index.ts         ← ~40 interfaces, 1 file duy nhất
supabase/migrations/       ← #1–#10 ✅ applied cloud; #11 (student portal) ❌ CHƯA apply
scripts/                   ← batch-crawl.ts (crawler thật), scrape-test/ (parser + kiểm chứng), generate-urls.ts
```

---

## Hạ tầng

```
GitHub  : https://github.com/dhrog-trungdo6/duhocrog.git (main) ✅
Vercel  : Auto-deploy từ main ✅ (.vercel/repo.json)
Supabase: Kết nối ✅ — 10/10 migrations applied (verify 2026-07-11); 57 schools active, RLS chuẩn
Resend  : ❌ chưa dùng
```

---

## 📝 CẬP NHẬT GẦN NHẤT & HÀNH ĐỘNG TIẾP THEO

> ⚙️ **Mục này được tự động ghi đè bởi lệnh `/handover`.**
> Không sửa tay — mọi thay đổi sẽ bị overwrite lần `/handover` tiếp theo.
> Trigger: khi context > 70% HOẶC khi kết thúc một giai đoạn lập trình lớn.

### Trạng thái Modules (verify 2026-07-11, kiểm tra toàn vẹn full-stack)

| Module | Trạng thái | Files chính |
|--------|-----------|-------------|
| Homepage (13 sections) | ✅ | src/app/page.tsx |
| ⭐ SchoolFinder (link chi tiết) | ✅ | src/components/home/SchoolFinder.tsx |
| EventsTabs | ✅ | src/components/home/EventsTabs.tsx |
| Lead Capture API | ✅ | src/app/api/leads/route.ts |
| Admin CRM (Leads/Events/Schools) | ✅ | src/app/admin/ + src/components/admin/ |
| Admin Auth (RHF login + SHA-256 cookie) | ✅ | src/middleware.ts + src/lib/admin-auth.ts |
| SchoolFormModal 6 tab v1.11.0 | ✅ | src/components/admin/school-form/ (6 sub-tabs) |
| Trang chi tiết /truong/[slug] v1.11.0 | ✅ | TOC + Map + CTA + Related (src/app/truong/[slug]/page.tsx) |
| Dịch vụ Visa / Tìm Trường / Mega Menu | ✅ | v1.4.0 / v1.5.0 / v1.6.0 |
| Crawler think.edu.vn | ✅ 38/38 | scripts/batch-crawl.ts (⚠️ 35 trường content_sections rỗng) |
| Supabase schema #1–#10 | ✅ Applied cloud | supabase/migrations/ |
| Bộ rules 14 skill | ✅ | .claude/rules/01–14 |

### API Routes (verify e2e 2026-07-11)

| Route | Method | Trạng thái | Ghi chú |
|-------|--------|-----------|---------|
| /api/leads | POST / GET | ✅ | GET không cookie → 401 |
| /api/leads/[id] (+/activities) | PATCH / GET / POST | ✅ | |
| /api/events | GET | ✅ | public |
| /api/schools | GET | ✅ | public — đã fix Data Cache (fetch no-store) |
| /api/admin/login · logout | POST | ✅ | login sai → 401, Zod rỗng → 400 |
| /api/admin/events (+[id]) | CRUD | ✅ | |
| /api/admin/schools (+[id]) | CRUD + seed | ✅ | PATCH partial (form 6 tab) |

### Hạ tầng & Tích hợp

```
GitHub  : main = origin/main ✅ (85f226b)
Vercel  : linked, auto-deploy từ main ✅
Supabase: 10/10 migrations applied; 57 schools (57 active, 0 slug null/trùng); RLS chuẩn (anon không đọc leads/inactive)
Env     : NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, VERCEL_OIDC_TOKEN, ADMIN_PASSWORD
Resend  : ❌ chưa dùng
```

### Data Contract thay đổi gần nhất

- v1.9.0–v1.11.0: SchoolFormModalProps; SchoolRow + official_rss_url/auto_sync_enabled (#9) + show_cta/related_slugs (#10); School + showCta/relatedSlugs; schoolFormSchema, schoolEditFormSchema + SchoolEditFormValues (validations)
- ⚠️ getSupabaseAdmin dùng fetch `cache: "no-store"` (fix Data Cache đóng băng xuyên build) — KHÔNG gỡ

### Nguyên tắc bất biến — trạng thái

- [x] 1–8 đều đang tuân thủ (kiểm tra 2026-07-11: mọi form RHF+Zod, API unknown+safeParse, ErrorBoundary giữ nguyên, brand info chỉ ở site.ts, mock ở src/data)

### Vấn đề đang mở

- [ ] **Coverage parser crawler**: 35/38 trường có content_sections rỗng NHƯNG đã public (user bật active cả 57) → trang chi tiết mỏng — ưu tiên cao
- [ ] Lead test trong bảng leads (1 row "TEST Claude production - xoá sau") — xóa tay Dashboard
- [ ] `src/config/site.ts` placeholder toàn bộ + ảnh thật thay placeholder
- [ ] Resend email notification (rule 08 đã có pattern, chưa implement)
- [ ] `scripts/crawler.ts` cũ (selectors giả định) — đã bị batch-crawl.ts thay thế, cân nhắc dọn

### Next Steps (3 việc làm ngay khi mở phiên mới)

1. **Fix coverage parser + crawl lại** — 35 trường đã public nhưng nội dung rỗng; tinh chỉnh selector scripts/scrape-test/parsers.ts (thử nhiều layout think.edu.vn), crawl lại theo rule 14 (upsert 1 bước, không đè cột Admin)
2. **Điền thông tin thương hiệu** src/config/site.ts + ảnh thật — site đang public dữ liệu thật mà hotline/email còn placeholder
3. **Xóa lead test** trên Supabase Dashboard (`delete from leads where full_name = 'TEST Claude production - xoá sau'`)

### Change Log

| Ngày | Giai đoạn | Thay đổi |
|------|-----------|---------|
| 2026-07-11 | #17 — Toàn vẹn + fix Data Cache + rules 13-14 + handover | Kiểm tra toàn vẹn full-stack (git/build/rules/migrations/RLS/e2e đều pass); phát hiện + fix Next Data Cache đóng băng response Supabase xuyên build (getSupabaseAdmin fetch no-store, /api/schools 22→57); rules 13 (AI scraping structured outputs) + 14 (idempotent upsert); user duyệt xong 57/57 trường active; handover |
| 2026-07-11 | #16 — Form 6 tab + CTA/Related v1.11.0 | Migration #10 (show_cta + related_slugs — CHƯA apply); SchoolFormModal 6 tab: +Vị trí & Bản đồ (map input + preview iframe sandbox live) +Liên kết & CTA (toggle show_cta, textarea related slugs mỗi dòng 1); slug tự sinh client từ tên khi tạo mới (dừng khi admin gõ tay); trang chi tiết: CtaBox "Vì sao chọn ROG?" (src/data/ctaBox.ts, ẩn khi show_cta=false) + RelatedSchoolsSection (fetchSchoolsBySlugs giữ thứ tự); từ chối multi-select bậc học (level là cột lọc vật lý + composite index — đổi sang mảng cần thiết kế riêng) |
| 2026-07-11 | #15 — TOC + Map + rule 11 | Rule 11 (AI Agent & RAG Readiness: plain_text_summary, faceted filtering cột phẳng); Trang /truong/[slug]: TableOfContents (details gập/mở, anchor + scroll-mt-24 mọi section, ≥3 mục mới hiện) + MapSection (iframe map_embed_url, guard https) ; Form Tab Tổng quan thêm website_url + map_embed_url (refine http(s)); verify e2e Ball State: TOC 16+ anchor nội dung, chi-phi/dieu-kien, tuition DB 27,496 đè mock | 
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
