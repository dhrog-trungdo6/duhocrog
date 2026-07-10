# Skill 7: webhook-n8n-integrity (Bảo mật & Tính toàn vẹn Webhook)

> Tham chiếu kiến trúc Nam Ngân Travel: n8n xử lý webhook Zalo/Facebook,
> luồng kép thông báo (Email + Realtime). Rủi ro chính khi mở cửa cho n8n/bên thứ 3:
> dữ liệu rác và duplicate do n8n tự retry khi mạng lỗi.

- **Security**: Mọi API endpoint nhận webhook (vd `/api/webhooks/n8n`) BẮT BUỘC kiểm tra
  header xác thực (vd `x-webhook-secret`) so khớp biến môi trường (vd `N8N_WEBHOOK_SECRET`)
  TRƯỚC khi xử lý logic — sai/thiếu → 401 ngay, không đọc body. So sánh bằng
  constant-time nếu có thể (timingSafeEqual). Secret chỉ đặt trong `.env.local`/Vercel env.
- **Idempotency**: Logic xử lý webhook phải an toàn khi bị gọi 2 lần với cùng payload
  (n8n retry). Ưu tiên UPSERT theo unique constraint thay vì INSERT:
  - `schools` → `on_conflict=slug` (cần migration #8 `schools_slug_key` — partial index
    cũ KHÔNG dùng được với PostgREST on_conflict, trả 400; khi chưa apply thì dùng
    2 bước GET→PATCH/POST như `scripts/batch-crawl.ts`).
  - `leads` → cân nhắc unique theo `phone` (+ khung thời gian) trước khi mở webhook lead,
    tránh 2 lead trùng nhau.
- **Data Integrity**: Never trust webhook data. BẮT BUỘC parse payload bằng Zod schema
  tĩnh trong `src/lib/validations.ts` trước khi chạm Supabase — sai format → 400 Bad
  Request ngay lập tức kèm JSON `{ error }` (theo Data Integrity Rule ở rule 03).
- Webhook route dùng service role (`getSupabaseAdmin()`), KHÔNG đi qua RLS anon;
  luôn `try/catch` + log lỗi server-side, không lộ chi tiết lỗi ra response.
