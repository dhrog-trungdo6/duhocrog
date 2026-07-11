import { NextRequest, NextResponse } from "next/server";
import { documentReviewSchema } from "@/lib/validations";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/admin-auth";

/**
 * PATCH /api/admin/documents/[id] — admin duyệt hoặc từ chối tài liệu học sinh.
 * Body: { status: "approved" | "rejected", notes?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const docId = params.id;
  if (!docId || docId.length < 32) {
    return NextResponse.json({ error: "ID tài liệu không hợp lệ" }, { status: 400 });
  }

  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = documentReviewSchema.safeParse(body);
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

    const updatePayload: Record<string, unknown> = {
      status: parsed.data.status,
      updated_at: new Date().toISOString(), // không có DB trigger — API tự set
      ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
    };

    const { data, error } = await supabase
      .from("student_documents")
      .update(updatePayload)
      .eq("id", docId)
      .select("id, lead_id, document_type, file_path, file_name, status, notes, created_at, updated_at")
      .single();

    if (error) {
      if (error.code === "42P01" || error.code === "PGRST205") {
        return NextResponse.json(
          { error: "Chưa bật Ví tài liệu — chạy migration 20260711000011_student_portal.sql" },
          { status: 500 }
        );
      }
      console.error("[api/admin/documents/[id]] PATCH:", error.message);
      return NextResponse.json({ error: "Không cập nhật được tài liệu" }, { status: 500 });
    }

    // CRM logging — graceful failure
    try {
      await supabase.from("lead_activities").insert({
        lead_id: data.lead_id,
        staff_name: "Admin CRM",
        action_type: "other",
        content:
          parsed.data.status === "approved"
            ? `Đã duyệt tài liệu "${data.file_name}"`
            : `Đã từ chối tài liệu "${data.file_name}"${parsed.data.notes ? ` — ${parsed.data.notes}` : ""}`,
      });
    } catch (logError) {
      console.error("[api/admin/documents/[id]] CRM log fail (bỏ qua):", logError);
    }

    return NextResponse.json({ document: data });
  } catch (error) {
    console.error("[api/admin/documents/[id]] unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}