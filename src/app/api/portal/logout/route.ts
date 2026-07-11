import { NextResponse } from "next/server";
import { STUDENT_COOKIE } from "@/lib/portal-auth";

/** POST /api/portal/logout — xóa cookie phiên học sinh. */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(STUDENT_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
