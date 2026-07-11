import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { School, SchoolRow } from "@/types";

export const revalidate = 300; // cache 5 phút

const BASE_COLUMNS =
  "id, name, country, province, level, tuition_usd, scholarship_up_to, logo_url, slug";
// Migration #12 — Program Tags; select fallback về BASE_COLUMNS khi cloud chưa apply (42703)
const TAG_COLUMNS = ", is_high_demand, no_visa_cap, is_top_school, has_coop, program_tags";

type ListRow = Pick<
  SchoolRow,
  | "id"
  | "name"
  | "country"
  | "province"
  | "level"
  | "tuition_usd"
  | "scholarship_up_to"
  | "logo_url"
  | "slug"
  | "is_high_demand"
  | "no_visa_cap"
  | "is_top_school"
  | "has_coop"
  | "program_tags"
>;

/** GET /api/schools — public: trường active cho SchoolFinder + /tim-truong. */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ schools: [] });
    }

    // PostgREST cap 1000 row/request — phân trang lặp để lấy đủ (hiện ~1071 trường active).
    // Order cố định theo name để các trang không trùng/sót row.
    const PAGE = 1000;
    const MAX_ROWS = 5000; // chốt an toàn
    let columns = BASE_COLUMNS + TAG_COLUMNS;
    const rows: ListRow[] = [];
    for (let from = 0; from < MAX_ROWS; from += PAGE) {
      let { data, error } = await supabase
        .from("schools")
        .select(columns)
        .eq("is_active", true)
        .order("name", { ascending: true })
        .range(from, from + PAGE - 1);

      // 42703 = cột tags chưa tồn tại (chưa apply migration #12) — thử lại cột cơ bản
      if (error && error.code === "42703" && columns !== BASE_COLUMNS) {
        columns = BASE_COLUMNS;
        ({ data, error } = await supabase
          .from("schools")
          .select(columns)
          .eq("is_active", true)
          .order("name", { ascending: true })
          .range(from, from + PAGE - 1));
      }

      if (error) {
        console.error("[api/schools]", error);
        return NextResponse.json({ schools: [] });
      }
      const batch = (data ?? []) as unknown as ListRow[];
      rows.push(...batch);
      if (batch.length < PAGE) break;
    }

    const schools: School[] = rows.map((row) => ({
      id: row.id,
      name: row.name,
      country: row.country,
      province: row.province,
      level: row.level,
      tuitionUsd: row.tuition_usd,
      scholarshipUpTo: row.scholarship_up_to ?? undefined,
      logoUrl: row.logo_url ?? "",
      slug: row.slug ?? undefined,
      isHighDemand: row.is_high_demand ?? undefined,
      noVisaCap: row.no_visa_cap ?? undefined,
      isTopSchool: row.is_top_school ?? undefined,
      hasCoop: row.has_coop ?? undefined,
      programTags: row.program_tags ?? undefined,
    }));
    return NextResponse.json({ schools });
  } catch (error) {
    console.error("[api/schools] unexpected:", error);
    return NextResponse.json({ schools: [] });
  }
}
