import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { School, SchoolRow } from "@/types";

export const revalidate = 300; // cache 5 phút

/** GET /api/schools — public: trường active cho SchoolFinder trang chủ. */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ schools: [] });
    }

    const { data, error } = await supabase
      .from("schools")
      .select("id, name, country, province, level, tuition_usd, scholarship_up_to, logo_url")
      .eq("is_active", true)
      .limit(500);

    if (error) {
      console.error("[api/schools]", error);
      return NextResponse.json({ schools: [] });
    }

    const schools: School[] = (
      data as Omit<SchoolRow, "is_active" | "created_at">[]
    ).map((row) => ({
      id: row.id,
      name: row.name,
      country: row.country,
      province: row.province,
      level: row.level,
      tuitionUsd: row.tuition_usd,
      scholarshipUpTo: row.scholarship_up_to ?? undefined,
      logoUrl: row.logo_url ?? "",
    }));
    return NextResponse.json({ schools });
  } catch (error) {
    console.error("[api/schools] unexpected:", error);
    return NextResponse.json({ schools: [] });
  }
}
