import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_session";
const STUDENT_COOKIE = "student_session";

/** Edge runtime không có node:crypto — SHA-256 hex bằng Web Crypto. */
async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Cùng công thức với src/lib/admin-auth.ts (Node) — sửa 1 nơi phải sửa cả 2. */
async function expectedAdminToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return sha256Hex(`rog-admin:${password}`);
}

/**
 * Cookie student_session = "{leadId}.{sig}", sig = SHA-256("rog-student:{leadId}:{ADMIN_PASSWORD}").
 * Cùng công thức với src/lib/portal-auth.ts (Node) — sửa 1 nơi phải sửa cả 2.
 */
async function isValidStudentSession(value: string | undefined): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !value) return false;
  const dot = value.indexOf(".");
  if (dot <= 0) return false;
  const leadId = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  return sig === (await sha256Hex(`rog-student:${leadId}:${password}`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Student Portal ──
  if (pathname.startsWith("/portal")) {
    if (pathname === "/portal/login") return NextResponse.next();
    const session = request.cookies.get(STUDENT_COOKIE)?.value;
    if (!(await isValidStudentSession(session))) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/portal/login";
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // ── Admin CRM ──
  if (pathname === "/admin/login") return NextResponse.next();
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const expected = await expectedAdminToken();
  if (!expected || token !== expected) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
