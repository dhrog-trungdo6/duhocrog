import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validations";
import { ADMIN_COOKIE, expectedSessionToken } from "@/lib/admin-auth";

const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 ngày

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Thiếu mật khẩu" }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return NextResponse.json(
        { error: "Chưa cấu hình ADMIN_PASSWORD trên server" },
        { status: 503 }
      );
    }

    if (parsed.data.password !== adminPassword) {
      return NextResponse.json({ error: "Mật khẩu không đúng" }, { status: 401 });
    }

    const token = expectedSessionToken();
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, token ?? "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error("[api/admin/login]", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
