import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { schoolQuerySchema, type SchoolQueryOutput } from "@/lib/validations";
import type { School, SchoolRow } from "@/types";

// Đọc request.url (query filter) → luôn chạy realtime, không prerender lúc build
export const dynamic = "force-dynamic";

const BASE_COLUMNS =
  "id, name, country, province, level, tuition_usd, scholarship_up_to, logo_url, slug";
// Migration #12 — Program Tags; select fallback về BASE_COLUMNS khi cloud chưa apply (42703)
const TAG_COLUMNS = ", is_high_demand, no_visa_cap, is_top_school, has_coop, program_tags";

/** Slug tag boolean trên URL → cột vật lý (composite/single index — rule 11). */
const BOOLEAN_TAG_COLUMNS: Record<string, string> = {
  high_demand: "is_high_demand",
  no_visa_cap: "no_visa_cap",
  top_school: "is_top_school",
  coop: "has_coop",
};

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

/**
 * Query 1 trang kết quả với đầy đủ filter.
 * Thứ tự filter tối ưu composite index (country, province, level, tuition_usd):
 * eq trước → range sau; tag boolean = cột vật lý; tag động = GIN contains.
 */
function buildQuery(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  columns: string,
  filters: SchoolQueryOutput,
  applyTagFilters: boolean,
  from: number,
  to: number,
) {
  // Lọc theo ngành (N-N migration #13): embed junction với !inner để CHỈ giữ trường
  // có ngành đó. Embed (không phải flat join) → mỗi trường trả về 1 lần, KHÔNG duplicate.
  const select = filters.major ? `${columns}, majors!inner(slug)` : columns;
  let query = supabase.from("schools").select(select).eq("is_active", true);

  if (filters.country) query = query.eq("country", filters.country);
  if (filters.province) query = query.eq("province", filters.province);
  if (filters.level) query = query.eq("level", filters.level);
  if (filters.major) query = query.eq("majors.slug", filters.major);
  if (filters.min_tuition > 0) query = query.gte("tuition_usd", filters.min_tuition);
  if (filters.max_tuition !== undefined) query = query.lte("tuition_usd", filters.max_tuition);
  if (filters.min_scholarship > 0) {
    query = query.gte("scholarship_up_to", filters.min_scholarship);
  }

  if (applyTagFilters && filters.tags.length > 0) {
    const dynamicTags: string[] = [];
    for (const tag of filters.tags) {
      const column = BOOLEAN_TAG_COLUMNS[tag];
      if (column) query = query.eq(column, true);
      else dynamicTags.push(tag);
    }
    if (dynamicTags.length > 0) query = query.contains("program_tags", dynamicTags);
  }

  if (filters.search) {
    // Bỏ ký tự phá cú pháp or= của PostgREST (,()) — chống injection filter
    const safe = filters.search.replace(/[,()%]/g, " ").trim();
    if (safe) query = query.or(`name.ilike.%${safe}%,description.ilike.%${safe}%`);
  }

  // Ưu tiên học bổng cao → học phí rẻ; name làm tiebreaker để phân trang không trùng/sót
  return query
    .order("scholarship_up_to", { ascending: false, nullsFirst: false })
    .order("tuition_usd", { ascending: true })
    .order("name", { ascending: true })
    .range(from, to);
}

/**
 * GET /api/schools — public: trường active cho SchoolFinder + /tim-truong.
 * Faceted filtering (v1.13.0): ?country=&province=&level=&min_tuition=&max_tuition=
 * &min_scholarship=&search=&tags=high_demand,coop,Popular
 * Không tham số → trả toàn bộ trường active (tương thích client cũ).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = schoolQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
    if (!parsed.success) {
      return NextResponse.json(
        { schools: [], error: "Tham số truy vấn không hợp lệ", details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const filters = parsed.data;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ schools: [] });
    }

    // PostgREST cap 1000 row/request — phân trang lặp để lấy đủ (hiện ~1071 trường active)
    const PAGE = 1000;
    const MAX_ROWS = 5000; // chốt an toàn
    let columns = BASE_COLUMNS + TAG_COLUMNS;
    let applyTagFilters = true;
    const rows: ListRow[] = [];
    for (let from = 0; from < MAX_ROWS; from += PAGE) {
      let { data, error } = await buildQuery(
        supabase, columns, filters, applyTagFilters, from, from + PAGE - 1,
      );

      // 42703 = cột tags chưa tồn tại (chưa apply migration #12) — thử lại không tags
      if (error && error.code === "42703" && applyTagFilters) {
        columns = BASE_COLUMNS;
        applyTagFilters = false;
        ({ data, error } = await buildQuery(
          supabase, columns, filters, applyTagFilters, from, from + PAGE - 1,
        ));
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
    return NextResponse.json({ schools, count: schools.length });
  } catch (error) {
    console.error("[api/schools] unexpected:", error);
    return NextResponse.json({ schools: [] });
  }
}
