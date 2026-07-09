import { useEffect, useState } from "react";
import type { FilterState, School } from "@/types";
import { destinations, provinces } from "@/data/destinations";
import { schools as mockSchools } from "@/data/schools";

/** "$28,000" — học phí luôn lưu number USD/năm (Data Contract). */
export function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

/** Nhãn hiển thị theo mã quốc gia/tỉnh bang — tra O(1) trong vòng lặp render kết quả. */
export const countryLabelByCode = new Map(
  destinations.map((d) => [d.code, d.name.replace("Du học ", "")]),
);
export const provinceLabelByCode = new Map(provinces.map((p) => [p.code, p.name]));

/**
 * Lọc + xếp hạng trường theo 4 tiêu chí: quốc gia, tỉnh bang, bậc học, khoảng học phí.
 * Ưu tiên: học bổng cao nhất trước, sau đó học phí thấp nhất.
 * Dùng chung: SchoolFinder (homepage) + trang /tim-truong.
 */
export function searchSchools(schools: School[], filters: FilterState): School[] {
  const [minTuition, maxTuition] = filters.tuitionRange;
  return schools
    .filter(
      (s) =>
        (!filters.country || s.country === filters.country) &&
        (!filters.province || s.province === filters.province) &&
        (!filters.level || s.level === filters.level) &&
        s.tuitionUsd >= minTuition &&
        s.tuitionUsd <= maxTuition,
    )
    .sort(
      (a, b) =>
        (b.scholarshipUpTo ?? 0) - (a.scholarshipUpTo ?? 0) ||
        a.tuitionUsd - b.tuitionUsd,
    );
}

/** Danh sách trường: ưu tiên bảng `schools` Supabase (CMS quản lý) → fallback mock khi DB trống/lỗi. */
export function useSchools(): School[] {
  const [schools, setSchools] = useState<School[]>(mockSchools);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch("/api/schools", { signal: controller.signal });
        if (!response.ok) return;
        const payload = (await response.json()) as { schools: School[] };
        if (payload.schools.length > 0) setSchools(payload.schools);
      } catch {
        // giữ mock — không crash khi lỗi mạng
      }
    })();
    return () => controller.abort();
  }, []);

  return schools;
}
