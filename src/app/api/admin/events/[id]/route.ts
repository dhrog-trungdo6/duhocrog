import { NextResponse } from "next/server";
import { eventInputSchema } from "@/lib/validations";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/admin-auth";

type Params = { params: { id: string } };

/** PATCH /api/admin/events/[id] — sửa sự kiện (partial). */
export async function PATCH(request: Request, { params }: Params) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body: unknown = await request.json();
    const parsed = eventInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("events")
      .update(parsed.data)
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) {
      const status = error.code === "PGRST116" ? 404 : 500;
      return NextResponse.json({ error: "Không cập nhật được sự kiện" }, { status });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/admin/events/[id]] PATCH:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

/** DELETE /api/admin/events/[id] — xóa cứng (sự kiện không có ràng buộc khác). */
export async function DELETE(request: Request, { params }: Params) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    const { error } = await supabase.from("events").delete().eq("id", params.id);
    if (error) {
      console.error("[api/admin/events/[id]] DELETE:", error);
      return NextResponse.json({ error: "Không xóa được sự kiện" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/events/[id]] DELETE unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
