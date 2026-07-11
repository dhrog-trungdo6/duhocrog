import { NextResponse } from "next/server";
import { portalLoginSchema } from "@/lib/validations";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildStudentSession, hashPortalCode, STUDENT_COOKIE } from "@/lib/portal-auth";

const GENERIC_FAIL = "SĐT hoặc mã truy cập không đúng"; // không lộ trường nào sai

/** POST /api/portal/login — học sinh đăng nhập bằng SĐT + mã truy cập (tư vấn viên cấp). */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = portalLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    // Hash match tự phân giải trường hợp 1 SĐT có nhiều lead — lấy lead mới nhất khớp mã
    const { data, error } = await supabase
      .from("leads")
      .select("id")
      .eq("phone", parsed.data.phone)
      .eq("portal_code_hash", hashPortalCode(parsed.data.code))
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("[api/portal/login]:", error.message);
      return NextResponse.json({ error: "Lỗi hệ thống, thử lại sau" }, { status: 500 });
    }

    const leadId = data?.[0]?.id as string | undefined;
    const session = leadId ? buildStudentSession(leadId) : null;
    if (!session) {
      return NextResponse.json({ error: GENERIC_FAIL }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(STUDENT_COOKIE, session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 ngày
    });
    return response;
  } catch (error) {
    console.error("[api/portal/login] unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
