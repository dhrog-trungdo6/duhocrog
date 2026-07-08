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
Primary Blue:  #005BAA   ← header nav, section titles (khai báo tailwind: primary)
Light Blue:    #0078D7   ← hover state (primary-light)
Dark Blue:     #004A8C   ← gradient SchoolFinder (primary-dark)
Accent Red:    #DC2626   ← hotline, CTA, badge học bổng (accent) — theo mẫu thinkEDU
Navy:          #0B2545   ← footer, testimonial section (navy)
```

> Màu khai báo trong `tailwind.config.ts` theme extend — KHÔNG hardcode hex trong className.

---

## 8 Nguyên tắc bất biến (kế thừa Nam Ngân Travel)

1. **KHÔNG** tự ý xóa file hoặc module — chỉ patch/extend
2. **KHÔNG** dùng third-party UI library nặng (MUI, Ant Design, Chakra...)
3. **KHÔNG** merge code nếu chưa kiểm tra type contract với `src/types/index.ts`
4. `<ErrorBoundary>` bọc toàn trang ở `layout.tsx` — lỗi 1 module không crash toàn trang
5. Mọi form/input **phải validate bằng Zod** (schema trong `src/lib/validations.ts`) trước khi ghi Supabase
6. Mọi API fetch **phải có `try/catch`** và UI fallback khi lỗi mạng (xem LeadForm `submitError`)
7. Thông tin thương hiệu **chỉ lấy từ `src/config/site.ts`** — không hardcode hotline/email/địa chỉ
8. Mock data đặt trong `src/data/*.ts` (typed array) — KHÔNG hardcode trong JSX, để dễ nối API sau

> Luồng kép Email+Realtime của Nam Ngân **chưa áp dụng** (chưa có Resend key) — TODO đã đánh dấu trong `/api/leads`.

---

## Data Contract cốt lõi (v1.0.0)

> Schema nguồn: `supabase/migrations/20260708000001_initial_schema.sql`
> Types: `src/types/index.ts` (1 file duy nhất)

```typescript
// ── Quy ước chung ────────────────────────────────────────────
Mọi timestamp  → string ISO 8601, UI convert sang UTC+7 (Asia/Ho_Chi_Minh)
Học phí        → number USD/năm (tuitionUsd) — KHÔNG lưu chuỗi "$28,000"
Mã quốc gia    → Country['code'] lowercase: 'us' | 'ca' | 'au' | 'uk' | 'sg' | ...

// ── leads (bảng leads — POST /api/leads) ─────────────────────
Lead.full_name        → text NOT NULL
Lead.phone            → text NOT NULL (Zod: regex VN 0xxx / +84xxx)
Lead.country_interest → text (mã quốc gia)
Lead.source           → 'homepage_form' | 'floating_cta' | 'footer_newsletter'
Lead.status           → 'new' | 'contacted' | 'consulting' | 'converted' | 'lost'
Lead.utm_source / utm_medium / utm_campaign → text nullable
// Honeypot chống bot: body field `website_hp` phải là chuỗi rỗng

// ── schools (SchoolFinder — hiện dùng mock src/data/schools.ts) ──
School.level          → 'thpt' | 'cao-dang' | 'dai-hoc' | 'sau-dai-hoc' | 'anh-ngu'
School.tuitionUsd     → number (filter slider $0–$60,000, step $1,000)
School.scholarshipUpTo → number? (% học bổng — sort DESC ưu tiên, rồi tuition ASC)
School.province       → Province['code'] dạng '{country}-{city}': 'us-ca', 'au-nsw'

// ── events (EventsTabs) ──────────────────────────────────────
EventItem.startsAt    → ISO 8601 — status upcoming/past DERIVE từ ngày, không lưu cột status

// ── LeadFormData (react-hook-form + zod) ─────────────────────
LeadFormData = { fullName: string; phone: string; country: string }
// leadFormSchema trong src/lib/validations.ts — phone transform bỏ khoảng trắng/./- trước khi regex
```

### Bảng → TypeScript type mapping

| Bảng SQL | TypeScript type | Ghi chú |
|----------|----------------|---------|
| `leads` | `LeadFormData` (+ server fields) | RLS: KHÔNG policy anon — chỉ service role |
| `events` | `EventItem` | RLS: public read `is_active = true` |
| `schools` | `School` | RLS: public read `is_active = true`; FE fetch `/api/schools`, fallback mock |

---

## Kiến trúc tính năng chính

| Module | File chính | Ghi chú |
|--------|-----------|---------|
| ⭐ **SchoolFinder** (lõi) | `src/components/home/SchoolFinder.tsx` | Cascading select quốc gia→tỉnh bang (`useMemo` derive, reset khi đổi country) + dual-handle Slider học phí + client-side filter (phương án A). Nâng cấp: phương án B `router.push('/tim-truong?...')` khi có trang riêng |
| FloatingCTA | `src/components/layout/FloatingCTA.tsx` | 3 nút Zalo/Hotline/Đăng ký — dọc trái desktop, ngang đáy mobile, collapse được, modal tái sử dụng LeadForm |
| LeadForm | `src/components/home/LeadForm.tsx` | Dùng chung WhyChooseUs (variant dark) + FloatingCTA modal (variant light); prop `source` đo kênh |
| Destination Hub | `src/components/home/StudyDestinations.tsx` | 12 quốc gia, clip-path lục giác, hover scale-110. Ảnh = gradient+emoji placeholder |
| StatsCounter | `src/components/home/StatsCounter.tsx` | IntersectionObserver, đếm 1 lần, easeOutCubic |
| EventsTabs | `src/components/home/EventsTabs.tsx` | Tab sắp/đã diễn ra + empty state "Không có sự kiện nào!" |
| TestimonialCarousel | `src/components/home/TestimonialCarousel.tsx` | Nền navy, prev/next, nút "Danh sách visa thành công" (href="#" chờ trang) |
| RogHeader / RogFooter | `src/components/layout/` | Footer có SVG inline Facebook/YouTube/TikTok (lucide đã gỡ brand icons) |

---

## Trạng thái API Routes

| Route | Method | Trạng thái | Ghi chú |
|-------|--------|-----------|---------|
| `/api/leads` | POST | ✅ v1.0.0 | Zod + honeypot `website_hp`; 400 chi tiết; 503 thiếu env; **201 đã verify trên Supabase thật** |
| `/api/leads` | GET | ✅ v1.3.0 | Admin only; filter `?status= ?source= ?q= ?page= ?limit=`; `?withCounts=1` → đếm toàn cục theo trạng thái (head query) |
| `/api/leads/[id]` | PATCH | ✅ v1.2.0 | Admin only; `status` và/hoặc `note`; đổi status tự ghi nhật ký `status_change` (best-effort) |
| `/api/leads/[id]/activities` | GET+POST | ✅ v1.0.0 | Nhật ký chăm sóc (note/call/email/status_change/other); ⚠️ cần migration #3; 42P01/PGRST205→báo hướng dẫn |
| `/api/events` | GET | ✅ v1.0.0 | Public; `is_active=true`; revalidate 300s; lỗi/thiếu env → `{events:[]}` |
| `/api/schools` | GET | ✅ v1.0.0 | Public; `is_active=true`; lỗi/thiếu env → `{schools:[]}` |
| `/api/admin/login` | POST | ✅ v1.0.0 | So `ADMIN_PASSWORD` → set cookie `admin_session` (SHA-256) |
| `/api/admin/logout` | POST | ✅ v1.0.0 | Xóa cookie |
| `/api/admin/events` (+`[id]`) | CRUD | ✅ v1.0.0 | Admin only; Zod `eventInputSchema` |
| `/api/admin/schools` (+`[id]`) | CRUD | ✅ v1.0.0 | Admin only; Zod `schoolInputSchema` |

> Auth admin: `src/middleware.ts` chặn `/admin/*` (Edge, Web Crypto) + `isAdminRequest()` trong
> `src/lib/admin-auth.ts` guard API (Node crypto) — **cùng công thức token, sửa 1 nơi phải sửa cả 2**.

---

## Hạ tầng & Tích hợp bên ngoài

```
GitHub  : https://github.com/dhrog-trungdo6/duhocrog.git (branch: main) ✅ ĐÃ PUSH
          gh CLI đăng nhập account `dhrog-trungdo6` (device flow, 2026-07-08)
          Push dùng: git -c credential.helper='!gh auth git-credential' push
          (keychain osxkeychain vẫn lưu `trungdotest8` cho dự án Nam Ngân — KHÔNG xóa)
          ⚠️ Admin CRM (phiên #3) CHƯA COMMIT — đang nằm working tree local
Vercel  : ✅ ĐÃ LINK — có `.vercel/repo.json`; `.env.local` có VERCEL_OIDC_TOKEN (đã `vercel env pull`)
Supabase: ✅ ĐÃ KẾT NỐI — migration initial_schema đã apply; bảng leads có 1 lead test
          ("TEST Claude production - xoá sau" — cần xóa qua Dashboard, app không có nút xóa lead)
          Bảng events/schools còn TRỐNG → FE đang fallback mock
Resend  : ❌ chưa dùng (TODO luồng kép notification)
```

---

## Lệnh thường dùng

```bash
pnpm dev              # Dev server (mặc định :3000)
pnpm build            # TypeScript check + build
pnpm lint             # ESLint
pnpm start -p 3111    # Production server test local
```

---

## Biến môi trường cần thiết

Xem `.env.example`. Giá trị thật trong `.env.local` (gitignored — `.gitignore` đã có `.env*`):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY    ← server-only, /api/leads dùng qua getSupabaseAdmin()
ADMIN_PASSWORD               ← mật khẩu /admin/login; token = SHA-256("rog-admin:" + password)
```

Thiếu env → `/api/leads` trả 503 "Hệ thống đang bảo trì" (chủ đích: không nhận lead ảo).

---

## Cấu trúc thư mục nhanh

```
src/
├── app/
│   ├── layout.tsx         ← Header + Footer + FloatingCTA + ErrorBoundary + metadata
│   ├── page.tsx           ← Hero → Destinations → Stats → WhyChooseUs → Events → News → SchoolFinder → Testimonial → Partners
│   └── api/leads/         ← POST lead capture (Supabase adminClient)
├── components/
│   ├── ui/                ← Button, Slider (radix), Skeleton, ErrorBoundary
│   ├── layout/            ← RogHeader, RogFooter, FloatingCTA
│   └── home/              ← 9 sections + LeadForm
├── config/site.ts         ← ⚠️ thông tin thương hiệu (placeholder)
├── data/                  ← destinations, schools, news, events, stats, partners, testimonials (mock typed)
├── lib/
│   ├── supabase/admin.ts  ← getSupabaseAdmin() — null-safe khi thiếu env
│   └── validations.ts     ← leadFormSchema (Zod)
└── types/index.ts         ← toàn bộ interfaces
supabase/migrations/       ← 20260708000001_initial_schema.sql (leads+events+schools+RLS)
```

---

## 📝 CẬP NHẬT GẦN NHẤT & HÀNH ĐỘNG TIẾP THEO

> ⚙️ **Mục này được tự động ghi đè bởi lệnh `/handover`.**
> Không sửa tay — mọi thay đổi sẽ bị overwrite lần `/handover` tiếp theo.
> Trigger: khi context > 70% HOẶC khi kết thúc một giai đoạn lập trình lớn.

### Trạng thái Modules

| Module | Trạng thái | Files chính |
|--------|-----------|-------------|
| Homepage v1 (13 sections) | ✅ v1.0.0 | `src/app/page.tsx` — build 0 lỗi, lint 0 warning |
| ⭐ SchoolFinder | ✅ v1.1.0 | fetch `/api/schools` fallback mock; cascading + dual slider + sort học bổng |
| EventsTabs | ✅ v1.1.0 | fetch `/api/events` fallback mock; empty state đúng mẫu thinkEDU |
| Lead Capture API | ✅ v1.1.0 | `/api/leads` POST (201 verify Supabase thật) + GET admin |
| Admin CRM | ✅ v1.0.0 ⚠️ CHƯA COMMIT | `/admin` 3 tab Leads/Events/Schools + `/admin/login`; `src/components/admin/` |
| Admin Auth | ✅ v1.0.0 ⚠️ CHƯA COMMIT | `src/middleware.ts` (Edge) + `src/lib/admin-auth.ts` (Node) — cookie `admin_session` |
| Supabase schema | ✅ ĐÃ APPLY cloud | bảng leads có 1 lead test; events/schools trống |
| GitHub push | ⚠️ LỆCH | origin/main = 3 commits cũ; toàn bộ phiên #3 chưa commit |

### Đã test thực tế (2026-07-08, production server :3111)

- Login admin đúng password → 200 + cookie; `/admin` không cookie → 307 về `/admin/login`
- `GET /api/leads` không cookie → 401; có cookie → 200 kèm data thật từ Supabase
- `GET /api/events` + `/api/schools` → 200 `[]` (bảng trống, FE fallback mock)

### Vấn đề đang mở

- [x] Migration #2 (cột `leads.note`) — ✅ ĐÃ APPLY cloud (2026-07-09, user chạy Dashboard)
- [ ] **Migration #3 chưa apply cloud** — `20260709000003_lead_activities.sql` (bảng nhật ký chăm sóc): chạy trên Supabase Dashboard → SQL Editor. Trước khi apply, panel nhật ký báo lỗi hướng dẫn, các phần khác vẫn chạy bình thường
- [ ] Lead test `"TEST Claude production - xoá sau"` trong bảng leads — xóa qua Supabase Dashboard
- [ ] Thông tin thương hiệu `src/config/site.ts` vẫn placeholder toàn bộ
- [ ] Ảnh placeholder: hero, hexagon quốc gia, logo trường, minh chứng visa
- [ ] Luồng kép Email (Resend) chưa áp dụng

### Next Steps (làm ngay khi mở phiên mới)

1. **Commit + push Admin CRM** — rủi ro lớn nhất: cả tính năng hoàn chỉnh chỉ nằm local (7 file sửa + 14 file mới)
2. **Nhập dữ liệu events/schools thật qua `/admin`** — bảng đang trống, homepage vẫn hiện mock
3. **Điền thông tin thương hiệu thật** vào `src/config/site.ts` + xóa lead test trên Supabase Dashboard

### Change Log

| Ngày | Giai đoạn | Thay đổi |
|------|-----------|---------|
| 2026-07-09 | Phiên #5 — CRM 2 cột kiểu Nam Ngân | Panel chi tiết + nhật ký chăm sóc (migration #3); stats toàn cục click-để-lọc; nút gọi/Zalo; /crm alias; auto-log status_change server-side |
| 2026-07-09 | Phiên #4 — CRM quản lý thông tin | LeadsTab: tìm kiếm ?q (tên/SĐT), lọc nguồn, ghi chú note/lead (migration #2 ✅ cloud), xuất Excel CSV BOM |
| 2026-07-08 | Phiên #3 — Admin CRM + Supabase live | Admin CRM (/admin + login + middleware); 9 API routes; FE fetch Supabase fallback mock; Supabase + Vercel đã kết nối; lệnh /handover |
| 2026-07-08 | Phiên #2 — Supabase + Events + GitHub | EventsTabs empty state; migration #1 (leads/events/schools+RLS); POST /api/leads (Zod+honeypot); LeadForm nối API + fallback lỗi; commit main; push 403 pending |
| 2026-07-08 | Phiên #1 — Homepage v1.0.0 | Scaffold Next.js 14.2.5; 13 sections theo spec + mẫu thinkEDU; SchoolFinder cascading+slider; siteConfig placeholder |
