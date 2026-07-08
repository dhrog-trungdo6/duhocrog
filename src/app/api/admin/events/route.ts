import { NextResponse } from "next/server";
import { eventInputSchema } from "@/lib/validations";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/admin-auth";

/** GET /api/admin/events — toàn bộ sự kiện (kể cả inactive) cho CMS. */
export async function GET(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("starts_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("[api/admin/events] GET:", error);
      return NextResponse.json({ error: "Không tải được sự kiện" }, { status: 500 });
    }
    return NextResponse.json({ events: data });
  } catch (error) {
    console.error("[api/admin/events] GET unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

/** POST /api/admin/events — thêm sự kiện mới. */
export async function POST(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body: unknown = await request.json();
    const parsed = eventInputSchema.safeParse(body);
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
      .from("events")
      .insert(parsed.data)
      .select("*")
      .single();

    if (error) {
      console.error("[api/admin/events] POST:", error);
      return NextResponse.json({ error: "Không tạo được sự kiện" }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[api/admin/events] POST unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
