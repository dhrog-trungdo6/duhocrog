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
| Database | Supabase (PostgreSQL + RLS) — ⚠️ CHƯA có project cloud, code đã sẵn sàng |
| Font | Be Vietnam Pro (next/font) |
| Package manager | pnpm |
| Deploy | Vercel (import từ GitHub) — ⚠️ CHƯA kết nối |

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
| `schools` | `School` | RLS: public read `is_active = true`; FE đang dùng mock |

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
| `/api/leads` | POST | ✅ v1.0.0 | Zod + honeypot `website_hp`; 400 chi tiết lỗi; **503 khi thiếu env Supabase**; 201 trả `{id}` |

---

## Hạ tầng & Tích hợp bên ngoài

```
GitHub  : https://github.com/dhrog-trungdo6/duhocrog.git (branch: main) ✅ ĐÃ PUSH
          gh CLI đăng nhập account `dhrog-trungdo6` (device flow, 2026-07-08)
          Push dùng: git -c credential.helper='!gh auth git-credential' push
          (keychain osxkeychain vẫn lưu `trungdotest8` cho dự án Nam Ngân — KHÔNG xóa)
Vercel  : ❌ CHƯA import — vercel.com → Add New Project → Import dhrog-trungdo6/duhocrog
Supabase: ❌ CHƯA có project — cần tạo rồi chạy migration 20260708000001_initial_schema.sql
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

Xem `.env.example`. Bắt buộc cho lead capture:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY    ← server-only, /api/leads dùng qua getSupabaseAdmin()
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

> ⚙️ Mục này cập nhật cuối mỗi phiên làm việc lớn (theo mô hình /handover của Nam Ngân).

### Trạng thái Modules

| Module | Trạng thái | Files chính |
|--------|-----------|-------------|
| Homepage v1 (13 sections) | ✅ v1.0.0 | `src/app/page.tsx` — build 0 lỗi, lint 0 warning |
| ⭐ SchoolFinder | ✅ v1.0.0 | cascading + dual slider + sort học bổng — client-side mock |
| EventsTabs | ✅ v1.0.0 | empty state đúng mẫu thinkEDU |
| Lead Capture API | ✅ v1.0.0 | `/api/leads` — đã test 400/503; chưa test 201 (thiếu env) |
| Supabase schema | ✅ SQL sẵn sàng | ⚠️ chưa apply (chưa có project cloud) |
| GitHub push | ✅ DONE | `main` đã lên origin (2 commits: 402bf77 + fa98209) |

### Next Steps (làm ngay khi mở phiên mới)

1. **Tạo Supabase project + apply migration** `20260708000001_initial_schema.sql` → điền 3 env vào `.env.local`, test POST /api/leads trả 201
2. **Import Vercel** từ repo `dhrog-trungdo6/duhocrog` + set 3 env Supabase
3. **Điền thông tin thương hiệu thật** vào `src/config/site.ts` (hotline, email, địa chỉ, social, domain)
4. Thay ảnh placeholder: hero banner, ảnh quốc gia hexagon, logo trường, ảnh minh chứng visa

### Change Log

| Ngày | Giai đoạn | Thay đổi |
|------|-----------|---------|
| 2026-07-08 | Phiên #2 — Supabase + Events + GitHub | EventsTabs empty state; migration #1 (leads/events/schools+RLS); POST /api/leads (Zod+honeypot); LeadForm nối API + fallback lỗi; commit main; push 403 pending |
| 2026-07-08 | Phiên #1 — Homepage v1.0.0 | Scaffold Next.js 14.2.5; 13 sections theo spec + mẫu thinkEDU; SchoolFinder cascading+slider; siteConfig placeholder |
