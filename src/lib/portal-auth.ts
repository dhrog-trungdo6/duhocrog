import { createHash, randomBytes } from "crypto";

export const STUDENT_COOKIE = "student_session";

/**
 * Phiên Student Portal — cookie `student_session` = "{leadId}.{sig}" với
 * sig = SHA-256("rog-student:" + leadId + ":" + ADMIN_PASSWORD).
 * Cùng công thức với middleware.ts (Web Crypto) — sửa 1 nơi phải sửa cả 2.
 * Dùng ADMIN_PASSWORD làm secret ký (như admin_session) — không thêm env mới.
 */
export function studentSessionSig(leadId: string): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHash("sha256").update(`rog-student:${leadId}:${password}`).digest("hex");
}

/** Dựng giá trị cookie phiên cho lead — null khi thiếu env. */
export function buildStudentSession(leadId: string): string | null {
  const sig = studentSessionSig(leadId);
  return sig ? `${leadId}.${sig}` : null;
}

/** Xác thực cookie từ Request (API route, Node runtime) → leadId hoặc null. */
export function getStudentLeadId(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const raw = cookieHeader
    .split(/;\s*/)
    .find((c) => c.startsWith(`${STUDENT_COOKIE}=`))
    ?.slice(STUDENT_COOKIE.length + 1);
  return verifyStudentSession(raw);
}

/** Xác thực giá trị cookie (dùng chung cho API route + Server Component). */
export function verifyStudentSession(value: string | undefined): string | null {
  if (!value) return null;
  const dot = value.indexOf(".");
  if (dot <= 0) return null;
  const leadId = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  const expected = studentSessionSig(leadId);
  return expected !== null && sig === expected ? leadId : null;
}

/** Bảng mã sinh mã truy cập — bỏ ký tự dễ nhầm (0/O, 1/I/L). */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Sinh mã truy cập portal 8 ký tự cho tư vấn viên gửi học sinh (hiện 1 lần duy nhất). */
export function generatePortalCode(): string {
  const bytes = randomBytes(8);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/** Hash lưu DB: leads.portal_code_hash = SHA-256("rog-portal:" + code). */
export function hashPortalCode(code: string): string {
  return createHash("sha256").update(`rog-portal:${code.trim().toUpperCase()}`).digest("hex");
}
