# Skill 1: nextjs-app-router-expert (Core Framework)

- App Router duy nhất (`src/app/`) — TUYỆT ĐỐI không tạo thư mục `pages/`.
- Mặc định component là Server Component. CHỈ thêm `"use client"` khi cần state
  (useState), lifecycle (useEffect), event handler (onClick...), hoặc hook trình duyệt.
- Đẩy `"use client"` xuống leaf component sâu nhất có thể — giữ page/layout là Server Component.
- ⚠️ Bài học thực tế: component gọi `useSearchParams()` BẮT BUỘC bọc trong `<Suspense>`
  boundary, nếu không `pnpm build` fail khi prerender static (đã dính ở `/tim-truong`).
- Data fetching: ưu tiên fetch tại Server Component. Mọi fetch/API call BẮT BUỘC có
  `try/catch` + UI fallback khi lỗi mạng (Nguyên tắc #6 — xem LeadForm `submitError`,
  hook `useSchools` fallback mock).
- Route mới phải chạy `pnpm build` xác nhận 0 lỗi trước khi commit (build = type check + lint).
