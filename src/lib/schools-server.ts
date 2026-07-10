/**
 * Server-only helpers cho trang trường chi tiết — fetch Supabase qua service role.
 * KHÔNG import vào client component (getSupabaseAdmin là server-only).
 */

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { School, SchoolRow } from "@/types";

/** Map SchoolRow (snake_case DB) → School (camelCase FE) — đủ cột migration #4/#5/#7. */
export function rowToSchool(row: SchoolRow): School {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    province: row.province,
    level: row.level,
    tuitionUsd: row.tuition_usd,
    scholarshipUpTo: row.scholarship_up_to ?? undefined,
    logoUrl: row.logo_url ?? "",
    slug: row.slug ?? undefined,
    description: row.description ?? undefined,
    websiteUrl: row.website_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    videoUrl: row.video_url ?? undefined,
    galleryUrls: row.gallery_urls ?? undefined,
    highlights: row.highlights ?? undefined,
    programs: row.programs ?? undefined,
    requirements: row.requirements ?? undefined,
    foundedYear: row.founded_year ?? undefined,
    schoolType: row.school_type ?? undefined,
    totalStudents: row.total_students ?? undefined,
    intakes: row.intakes ?? undefined,
    mapEmbedUrl: row.map_embed_url ?? undefined,
    contentSections: row.content_sections ?? undefined,
    quickFacts: row.quick_facts ?? undefined,
    costBreakdown: row.cost_breakdown ?? undefined,
    admissionRequirements: row.admission_requirements ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    scrapedAt: row.scraped_at ?? undefined,
  };
}

/** Fetch 1 trường active theo slug — null khi thiếu env/lỗi mạng/không tìm thấy (caller fallback mock). */
export async function fetchSchoolBySlug(slug: string): Promise<School | null> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("schools")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error("[schools-server] fetchSchoolBySlug:", error);
      return null;
    }
    return rowToSchool(data as SchoolRow);
  } catch (error) {
    console.error("[schools-server] unexpected:", error);
    return null;
  }
}

/** Giá trị "có dữ liệu thật" — dùng khi merge DB đè lên mock. */
function hasValue(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim() !== "";
  if (Array.isArray(v)) return v.length > 0;
  return true;
}

/**
 * Merge trường: field nào DB có dữ liệu thật thì đè lên mock, còn lại giữ mock.
 * Dùng cho giai đoạn chuyển tiếp: DB đã có row (seed) nhưng nội dung chi tiết
 * chưa crawl/nhập — 3 trường mock giàu nội dung vẫn hiển thị đầy đủ.
 */
export function mergeSchoolPreferDb(mock: School, db: School): School {
  const overrides = Object.fromEntries(
    Object.entries(db).filter(([, value]) => hasValue(value)),
  ) as Partial<School>;
  return { ...mock, ...overrides };
}
