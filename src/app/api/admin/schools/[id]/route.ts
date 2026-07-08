import { NextResponse } from "next/server";
import { schoolInputSchema } from "@/lib/validations";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/admin-auth";

type Params = { params: { id: string } };

/** PATCH /api/admin/schools/[id] — sửa trường (partial, dùng toggle is_active). */
export async function PATCH(request: Request, { params }: Params) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body: unknown = await request.json();
    const parsed = schoolInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("schools")
      .update(parsed.data)
      .eq("id", params.id)
      .select("*")
      .single();

    if (error) {
      const status = error.code === "PGRST116" ? 404 : 500;
      return NextResponse.json({ error: "Không cập nhật được trường" }, { status });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("[api/admin/schools/[id]] PATCH:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

/** DELETE /api/admin/schools/[id] — soft delete (is_active=false) theo nguyên tắc không xóa cứng. */
export async function DELETE(request: Request, { params }: Params) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    const { error } = await supabase
      .from("schools")
      .update({ is_active: false })
      .eq("id", params.id);

    if (error) {
      console.error("[api/admin/schools/[id]] DELETE:", error);
      return NextResponse.json({ error: "Không ẩn được trường" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[api/admin/schools/[id]] DELETE unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
