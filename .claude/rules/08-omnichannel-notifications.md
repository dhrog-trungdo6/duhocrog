# Skill 8: omnichannel-notifications (Gửi thông báo Email/Zalo/Telegram/SMS)

> Tham chiếu luồng kép Nam Ngân Travel: vừa lưu Supabase, vừa gửi Email (Resend) +
> Realtime notification. Mục tiêu: module hóa để KHÔNG viết code gọi API Zalo/SMS
> lộn xộn trong file UI hoặc API route chính.

# Kỹ năng: Async Notification Pattern

- **Decoupling (Tách biệt)**: KHÔNG viết logic gọi API Zalo OA, Telegram, SMS, Resend
  trực tiếp trong route nhận Lead (`/api/leads`). Tạo Service Layer riêng tại
  `src/lib/notifications/index.ts` — mỗi kênh 1 module con (vd `resend.ts`, `zalo.ts`,
  `telegram.ts`), export 1 hàm thống nhất kiểu `notifyNewLead(lead)`.
- **Non-blocking (Không nghẽn luồng)**: Gửi thông báo có thể chậm do mạng bên thứ 3 —
  KHÔNG `await` đồng bộ làm nghẽn phản hồi HTTP. Lưu lead vào Supabase xong → trả
  response ngay; các kênh thông báo chạy `Promise.allSettled` (hoặc background
  queue/n8n webhook nếu có). Timeout mỗi kênh ngắn (≤ 5s).
- **Graceful Failure**: Gửi Zalo/SMS thất bại KHÔNG được làm sập luồng lưu Lead —
  lead đã ghi DB là thành công. Bọc `try/catch` riêng cho từng kênh, log lỗi
  server-side (`console.error("[notify/zalo]", ...)`) — không trả lỗi notification
  về client.
- Cấu hình kênh (API key, OA id, chat id...) lấy từ env — khai báo tên KEY trong
  CLAUDE.md khi thêm; null-safe khi thiếu env: skip kênh đó + log warn, không crash
  (cùng pattern `getSupabaseAdmin()`).
