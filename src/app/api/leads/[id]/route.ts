import { NextResponse } from "next/server";
import { leadUpdateSchema } from "@/lib/validations";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/admin-auth";
import { LEAD_STATUS_LABELS } from "@/types";

/** PATCH /api/leads/[id] — admin cập nhật trạng thái chăm sóc và/hoặc ghi chú lead. */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = leadUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu cập nhật không hợp lệ" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    const updates: { status?: string; note?: string } = {};
    if (parsed.data.status !== undefined) updates.status = parsed.data.status;
    if (parsed.data.note !== undefined) updates.note = parsed.data.note;

    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", params.id)
      .select("id, status")
      .single();

    if (error) {
      // 42703 (SQL) / PGRST204 (schema cache) = cột note chưa tồn tại — cloud chưa apply migration #2
      if (error.code === "42703" || error.code === "PGRST204") {
        return NextResponse.json(
          {
            error:
              "Chưa bật tính năng ghi chú — chạy migration 20260708000002_leads_note.sql trên Supabase Dashboard → SQL Editor",
          },
          { status: 500 }
        );
      }
      // PGRST116 = không tìm thấy bản ghi
      const status = error.code === "PGRST116" ? 404 : 500;
      return NextResponse.json({ error: "Không cập nhật được lead" }, { status });
    }

    // Đổi trạng thái → tự ghi nhật ký chăm sóc (best-effort: bỏ qua khi chưa apply migration #3)
    if (parsed.data.status !== undefined) {
      const { error: logError } = await supabase.from("lead_activities").insert({
        lead_id: params.id,
        action_type: "status_change",
        content: `Trạng thái → ${LEAD_STATUS_LABELS[parsed.data.status]}`,
        staff_name: "Hệ thống",
      });
      if (logError && logError.code !== "42P01" && logError.code !== "PGRST205") {
        console.error("[api/leads/[id]] log status_change:", logError);
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/leads/[id]] PATCH:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
