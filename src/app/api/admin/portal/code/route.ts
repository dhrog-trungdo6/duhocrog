import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/admin-auth";
import { generatePortalCode, hashPortalCode } from "@/lib/portal-auth";

const generateCodeSchema = z.object({
  lead_id: z.string().uuid(),
});

/**
 * POST /api/admin/portal/code — tư vấn viên cấp mã truy cập Student Portal cho 1 lead.
 * Trả về mã plaintext (hiển thị 1 lần). DB chỉ lưu hash SHA-256.
 */
export async function POST(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = generateCodeSchema.safeParse(body);
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

    const code = generatePortalCode();
    const hash = hashPortalCode(code);

    const { error } = await supabase
      .from("leads")
      .update({ portal_code_hash: hash })
      .eq("id", parsed.data.lead_id);

    if (error) {
      console.error("[api/admin/portal/code]:", error.message);
      return NextResponse.json({ error: "Không lưu được mã truy cập" }, { status: 500 });
    }

    // CRM logging — graceful failure: lỗi log không chặn việc cấp mã
    try {
      await supabase.from("lead_activities").insert({
        lead_id: parsed.data.lead_id,
        staff_name: "Admin CRM",
        action_type: "other",
        content: "Đã cấp mã truy cập Student Portal (mã cũ bị vô hiệu)",
      });
    } catch (logError) {
      console.error("[api/admin/portal/code] CRM log fail (bỏ qua):", logError);
    }

    return NextResponse.json({ code });
  } catch (error) {
    console.error("[api/admin/portal/code] unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}