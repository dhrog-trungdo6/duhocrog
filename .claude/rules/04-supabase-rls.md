# Skill 4: supabase-postgres-rls (Backend)

- Kiến trúc thật của dự án (⚠️ KHÔNG dùng `@supabase/ssr`, KHÔNG dùng Supabase Auth):
  - Server đọc/ghi DB qua `getSupabaseAdmin()` (`src/lib/supabase/admin.ts`) —
    service role key, server-only, null-safe khi thiếu env (trả 503/fallback, không crash).
  - Auth admin tự quản: cookie `admin_session` = SHA-256("rog-admin:" + ADMIN_PASSWORD),
    kiểm tra ở `src/middleware.ts` (Edge/Web Crypto) VÀ `src/lib/admin-auth.ts` (Node) —
    cùng công thức token, sửa 1 nơi phải sửa cả 2.
- RLS: mọi bảng mới BẮT BUỘC `enable row level security` kèm policy đúng quyền:
  - `leads`, `lead_activities`: KHÔNG policy anon — chỉ service role.
  - `events`, `schools`: public read `is_active = true`.
- Mọi truy vấn định kiểu theo row types trong `src/types/index.ts`
  (LeadRow, EventRow, SchoolRow, LeadActivity) — snake_case DB ↔ camelCase FE map tại API route.
- Migration: file SQL đặt `supabase/migrations/YYYYMMDDNNNNNN_ten.sql`, apply TAY qua
  Supabase Dashboard → SQL Editor (project chưa link CLI). Sau khi viết migration mới,
  cập nhật đồng bộ: types + Zod + API select/mapping + CLAUDE.md (trạng thái apply).
- Quy ước cột: soft delete bằng `is_active=false` (không xóa cứng); timestamp `timestamptz`;
  slug unique dùng partial index `where slug is not null`.
