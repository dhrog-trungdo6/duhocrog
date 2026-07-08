import { NextResponse } from "next/server";
import { schoolInputSchema } from "@/lib/validations";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/admin-auth";
import { schools as mockSchools } from "@/data/schools";

/** GET /api/admin/schools — toàn bộ trường (kể cả inactive) cho CMS. */
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
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[api/admin/schools] GET:", error);
      return NextResponse.json({ error: "Không tải được trường" }, { status: 500 });
    }
    return NextResponse.json({ schools: data });
  } catch (error) {
    console.error("[api/admin/schools] GET unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

/**
 * POST /api/admin/schools — thêm 1 trường,
 * hoặc body {seed: true} → import 22 trường mẫu từ src/data/schools.ts (chỉ khi bảng trống).
 */
export async function POST(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    // Seed dữ liệu mẫu
    if (body.seed === true) {
      const { count } = await supabase
        .from("schools")
        .select("id", { count: "exact", head: true });
      if ((count ?? 0) > 0) {
        return NextResponse.json(
          { error: `Bảng schools đã có ${count} bản ghi — không seed đè.` },
          { status: 409 }
        );
      }
      const rows = mockSchools.map((s) => ({
        name: s.name,
        country: s.country,
        province: s.province,
        level: s.level,
        tuition_usd: s.tuitionUsd,
        scholarship_up_to: s.scholarshipUpTo ?? null,
        logo_url: s.logoUrl,
        is_active: true,
      }));
      const { error } = await supabase.from("schools").insert(rows);
      if (error) {
        console.error("[api/admin/schools] seed:", error);
        return NextResponse.json({ error: "Seed thất bại" }, { status: 500 });
      }
      return NextResponse.json({ ok: true, inserted: rows.length }, { status: 201 });
    }

    // Thêm 1 trường
    const parsed = schoolInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("schools")
      .insert(parsed.data)
      .select("*")
      .single();

    if (error) {
      console.error("[api/admin/schools] POST:", error);
      return NextResponse.json({ error: "Không tạo được trường" }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[api/admin/schools] POST unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
