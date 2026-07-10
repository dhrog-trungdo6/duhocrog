# Skill 9: event-driven-supabase (Kiến trúc hướng sự kiện — PostgreSQL Webhooks)

> "Tuyệt chiêu" giảm token API + tối ưu chi phí serverless Vercel: thay vì bắt Next.js
> vừa lưu DB, vừa gọi n8n, vừa gửi tin nhắn — đẩy việc đó cho Supabase.

# Kỹ năng: Event-Driven DB (PostgreSQL Webhooks)

- Khi có yêu cầu tự động hóa kiểu "gửi webhook cho n8n khi có Lead mới":
  ưu tiên KHÔNG viết code HTTP POST trong Next.js API route.
- **Giải pháp tối ưu**: hướng dẫn user tạo **Database Webhook** (Dashboard →
  Database → Webhooks) hoặc **Trigger** trực tiếp trên bảng `leads` của Supabase.
  Khi INSERT dòng mới, Supabase tự bắn webhook JSON chứa toàn bộ row sang n8n —
  code Next.js giữ nguyên sự trong sạch, loại bỏ độ trễ phía frontend.
- Phân công ranh giới với rule 08 (notifications):
  - Việc bên-thứ-3 có thể async hoàn toàn (n8n, Zalo, Telegram, CRM sync) → Database
    Webhook/Trigger (rule này).
  - Việc cần kết quả ngay trong response (hiếm) hoặc cần logic TypeScript phức tạp →
    Service Layer `src/lib/notifications/` (rule 08).
- Nếu dùng Trigger + `pg_net`/`supabase_functions.http_request`: viết thành file
  migration trong `supabase/migrations/` (apply tay Dashboard theo rule 04), URL n8n
  đặt qua Vault/secret — KHÔNG hardcode URL webhook thật vào SQL commit lên repo.
- Payload n8n nhận được vẫn phải qua Zod khi quay lại hệ thống (rule 07) — event-driven
  không miễn trừ Data Integrity.
