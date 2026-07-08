import { NextResponse } from "next/server";
import { activityInputSchema } from "@/lib/validations";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/admin-auth";

// 42P01 (SQL) / PGRST205 (schema cache) = bảng lead_activities chưa tồn tại — chưa apply migration #3
const MIGRATION_HINT =
  "Chưa bật nhật ký chăm sóc — chạy migration 20260709000003_lead_activities.sql trên Supabase Dashboard → SQL Editor";

function isTableMissing(code: string | undefined): boolean {
  return code === "42P01" || code === "PGRST205";
}

/** GET /api/leads/[id]/activities — lịch sử chăm sóc của 1 lead (mới nhất trước). */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("lead_activities")
      .select("id, lead_id, staff_name, action_type, content, created_at")
      .eq("lead_id", params.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      if (isTableMissing(error.code)) {
        return NextResponse.json({ error: MIGRATION_HINT }, { status: 500 });
      }
      console.error("[api/leads/activities] GET:", error);
      return NextResponse.json({ error: "Không tải được nhật ký" }, { status: 500 });
    }

    return NextResponse.json({ activities: data ?? [] });
  } catch (error) {
    console.error("[api/leads/activities] GET unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

/** POST /api/leads/[id]/activities — thêm ghi chú / cuộc gọi / email vào nhật ký. */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = activityInputSchema.safeParse(body);
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

    const { data, error } = await supabase
      .from("lead_activities")
      .insert({ lead_id: params.id, ...parsed.data })
      .select("id, lead_id, staff_name, action_type, content, created_at")
      .single();

    if (error) {
      if (isTableMissing(error.code)) {
        return NextResponse.json({ error: MIGRATION_HINT }, { status: 500 });
      }
      // 23503 = lead_id không tồn tại (FK violation)
      if (error.code === "23503") {
        return NextResponse.json({ error: "Lead không tồn tại" }, { status: 404 });
      }
      console.error("[api/leads/activities] POST:", error);
      return NextResponse.json({ error: "Không lưu được nhật ký" }, { status: 500 });
    }

    return NextResponse.json({ activity: data }, { status: 201 });
  } catch (error) {
    console.error("[api/leads/activities] POST unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
