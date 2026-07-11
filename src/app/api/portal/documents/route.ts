import { NextResponse } from "next/server";
import { documentMetaSchema } from "@/lib/validations";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStudentLeadId } from "@/lib/portal-auth";
import { DOCUMENT_TYPE_LABELS } from "@/types";

/** GET /api/portal/documents — danh sách tài liệu của học sinh đang đăng nhập. */
export async function GET(request: Request) {
  try {
    const leadId = getStudentLeadId(request);
    if (!leadId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("student_documents")
      .select("id, lead_id, document_type, file_path, file_name, status, notes, created_at, updated_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[api/portal/documents] GET:", error.message);
      return NextResponse.json({ error: "Không tải được danh sách tài liệu" }, { status: 500 });
    }
    return NextResponse.json({ documents: data ?? [] });
  } catch (error) {
    console.error("[api/portal/documents] GET unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

/**
 * POST /api/portal/documents — ghi metadata SAU KHI client upload Storage thành công
 * (luồng 2 sơ đồ), rồi tự động lưu vết vào lead_activities (luồng 3 — CRM Logging).
 */
export async function POST(request: Request) {
  try {
    const leadId = getStudentLeadId(request);
    if (!leadId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = documentMetaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Chống ghi chéo hồ sơ: path bắt buộc nằm trong "thư mục" của chính lead này
    if (!parsed.data.file_path.startsWith(`${leadId}/`)) {
      return NextResponse.json({ error: "file_path không thuộc hồ sơ của bạn" }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("student_documents")
      .insert({
        lead_id: leadId,
        document_type: parsed.data.document_type,
        file_path: parsed.data.file_path,
        file_name: parsed.data.file_name,
        status: "pending_review",
      })
      .select("id, lead_id, document_type, file_path, file_name, status, notes, created_at, updated_at")
      .single();

    if (error) {
      // 42P01/PGRST205 = chưa apply migration #11
      if (error.code === "42P01" || error.code === "PGRST205") {
        return NextResponse.json(
          { error: "Chưa bật Ví tài liệu — chạy migration 20260711000011_student_portal.sql" },
          { status: 500 }
        );
      }
      console.error("[api/portal/documents] POST:", error.message);
      return NextResponse.json({ error: "Không lưu được tài liệu" }, { status: 500 });
    }

    // CRM Logging (luồng 3) — graceful failure: lỗi log KHÔNG làm hỏng upload đã thành công
    try {
      await supabase.from("lead_activities").insert({
        lead_id: leadId,
        staff_name: "Student Portal",
        action_type: "other",
        content: `Học sinh đã tải lên ${DOCUMENT_TYPE_LABELS[parsed.data.document_type]}: ${parsed.data.file_name}`,
      });
    } catch (logError) {
      console.error("[api/portal/documents] CRM log fail (bỏ qua):", logError);
    }

    return NextResponse.json({ document: data }, { status: 201 });
  } catch (error) {
    console.error("[api/portal/documents] POST unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
