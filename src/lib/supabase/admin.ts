import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase admin client — CHỈ dùng trong API routes (server-side).
 * Service role key bypass RLS, tuyệt đối không import vào client component.
 * Trả về null khi chưa cấu hình env để API tự fallback thay vì crash.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.warn("[supabase] Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      // Next.js patch global fetch: mặc định force-cache → response Supabase bị
      // Data Cache giữ vô thời hạn XUYÊN build (kể cả build cache Vercel), làm
      // /api/schools + trang ISR đóng băng dữ liệu cũ. no-store = luôn query DB
      // thật; caching vẫn do route-level `revalidate` (ISR) đảm nhiệm.
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
