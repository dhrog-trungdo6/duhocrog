import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Major } from "@/types";

// getSupabaseAdmin fetch no-store (chống Data Cache đóng băng) → route phải dynamic
export const dynamic = "force-dynamic";

/** GET /api/majors — public: danh mục ngành active, sort theo nhóm rồi tên (cho dropdown). */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ majors: [] });
    }

    const { data, error } = await supabase
      .from("majors")
      .select("id, slug, name_vi, name_en, category, is_active, created_at")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("name_vi", { ascending: true });

    if (error) {
      // 42P01/PGRST205 = bảng majors chưa tồn tại (chưa apply migration #13) → dropdown rỗng
      console.error("[api/majors]", error);
      return NextResponse.json({ majors: [] });
    }

    return NextResponse.json({ majors: (data ?? []) as Major[] });
  } catch (error) {
    console.error("[api/majors] unexpected:", error);
    return NextResponse.json({ majors: [] });
  }
}
