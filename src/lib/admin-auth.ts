import { createHash } from "crypto";

export const ADMIN_COOKIE = "admin_session";

/**
 * Token phiên admin = SHA-256("rog-admin:" + ADMIN_PASSWORD).
 * Cùng công thức với middleware.ts (Web Crypto) — sửa 1 nơi phải sửa cả 2.
 */
export function expectedSessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHash("sha256").update(`rog-admin:${password}`).digest("hex");
}

/** Guard cho API routes (Node runtime) — dùng ở mọi route /api/admin/* và leads GET/PATCH. */
export function isAdminRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(/;\s*/)
    .find((c) => c.startsWith(`${ADMIN_COOKIE}=`))
    ?.slice(ADMIN_COOKIE.length + 1);
  const expected = expectedSessionToken();
  return expected !== null && token === expected;
}
