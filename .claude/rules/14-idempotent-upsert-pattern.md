# Skill 14: idempotent-upsert-pattern (Cập nhật không trùng lặp)

# Kỹ năng: Upsert & Idempotency trong Supabase

- **Slug Determinism (Định tuyến slug)**: Mọi trường học cào về BẮT BUỘC tạo slug
  chuẩn hóa từ tên trường bằng `slugify` trong `src/lib/slug.ts` (lowercase, bỏ dấu
  tiếng Việt) — KHÔNG viết hàm slug mới, không dùng thư viện ngoài.
- **Upsert 1 bước**: Dùng `upsert()` của Supabase (hoặc PostgREST
  `on_conflict=slug` + `Prefer: resolution=merge-duplicates`) — dựa trên unique
  constraint `schools_slug_key` (migration #8, ✅ đã apply 2026-07-11).
  Chiến lược 2 bước GET→PATCH/POST trong `scripts/batch-crawl.ts` là phương án
  cũ thời chưa có constraint — code mới ưu tiên 1 bước.
- **Tránh ghi đè trường quan trọng** (bài học sự cố crawl 2026-07-10: lần chạy đầu
  đè `is_active=false` + xóa logo 3 trường seed đang active):
  - Upsert ghi đè MỌI cột có trong payload → chỉ đưa vào payload các cột thực sự
    muốn cập nhật (dữ liệu giàu: quick_facts, cost_breakdown, content_sections,
    source_url, scraped_at...).
  - KHÔNG bao giờ đưa `is_active`, `logo_url`, `image_url`, `show_cta` vào payload
    upsert của crawler/webhook — đó là cột do Admin quản lý.
  - Basics (country, province, tuition_usd...) chỉ gửi khi parse ra giá trị thật,
    không gửi giá trị rỗng/0 đè dữ liệu tốt.
- Idempotency tổng quát (webhook n8n retry, lead trùng...) theo rule 07.
