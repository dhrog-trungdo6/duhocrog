"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { GraduationCap, Percent, SearchX } from "lucide-react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { School, FilterOption, ProvinceFilterOption, FilterState } from "@/types";
import { STUDY_LEVEL_LABELS } from "@/types";
import { destinations, provinces } from "@/data/destinations";
import { schools as mockSchools } from "@/data/schools";
import SchoolFilter from "@/components/schools/SchoolFilter";

/** Format USD */
function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

/** Build filter options từ destinations */
function buildCountryOptions(): FilterOption[] {
  return destinations.map((d) => ({
    label: d.name.replace("Du học ", ""),
    value: d.code,
  }));
}

/** Build province options từ data/destinations.ts */
function buildProvinceOptions(): ProvinceFilterOption[] {
  return provinces.map((p) => ({
    label: p.name,
    value: p.code,
    countryValue: p.countryCode,
  }));
}

export default function TimTruongPage() {
  const searchParams = useSearchParams();
  const initialCountry = searchParams.get("country") ?? "";

  const [schools, setSchools] = useState<School[]>(mockSchools);
  const [results, setResults] = useState<School[] | null>(null);
  const [lastFilter, setLastFilter] = useState<Omit<FilterState, "level"> & { level: string }>({
    country: initialCountry,
    province: "",
    level: "",
    tuitionRange: [0, 60000],
  });

  // Fetch schools từ Supabase — fallback mock
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch("/api/schools", { signal: controller.signal });
        if (!response.ok) return;
        const payload = (await response.json()) as { schools: School[] };
        if (payload.schools.length > 0) setSchools(payload.schools);
      } catch {
        // giữ mock
      }
    })();
    return () => controller.abort();
  }, []);

  // Auto-search khi có ?country= hoặc khi schools load
  const doSearch = useCallback(
    (filters: Omit<FilterState, "level"> & { level: string }) => {
      const [minTuition, maxTuition] = filters.tuitionRange;
      const matched = schools
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
      setResults(matched);
    },
    [schools],
  );

  // Chạy tìm kiếm lần đầu khi schools load xong (hiển thị tất cả hoặc theo ?country=)
  useEffect(() => {
    if (schools.length > 0) {
      doSearch(lastFilter);
    }
  }, [schools]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback(
    (filters: Omit<FilterState, "level"> & { level: string }) => {
      setLastFilter(filters);
      doSearch(filters);
    },
    [doSearch],
  );

  const countryOptions = useMemo(() => buildCountryOptions(), []);
  const provinceOptions = useMemo(() => buildProvinceOptions(), []);

  const countryNameFromFilter = destinations.find((d) => d.code === lastFilter.country)?.name;

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <nav
            className="flex items-center gap-2 text-xs text-slate-500"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-primary">
              Trang chủ
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="font-semibold text-primary">
              {countryNameFromFilter
                ? `${countryNameFromFilter} — Tìm trường & Học bổng`
                : "Tìm trường & Học bổng"}
            </span>
          </nav>
        </div>
      </section>

      {/* SchoolFilter Banner */}
      <div className="px-4 py-8">
        <div className="mx-auto max-w-7xl">
          <SchoolFilter
            onSearch={handleSearch}
            countries={countryOptions}
            provinces={provinceOptions}
          />
        </div>
      </div>

      {/* Kết quả — hiển thị mặc định tất cả trường */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        {results === null ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : results.length === 0 ? (
          <div className="mx-auto max-w-md rounded-xl bg-white p-10 text-center shadow-sm">
            <SearchX className="mx-auto h-12 w-12 text-slate-300" aria-hidden />
            <h2 className="mt-4 text-lg font-bold text-slate-700">
              Không tìm thấy trường phù hợp
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Vui lòng điều chỉnh bộ lọc (mở rộng ngân sách hoặc bỏ chọn tỉnh bang) để
              tìm thêm trường.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {countryNameFromFilter
                  ? `${countryNameFromFilter}: `
                  : "Tất cả quốc gia: "}
                <strong className="text-primary">{results.length}</strong> trường
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((school) => {
                const countryLabel =
                  destinations
                    .find((c) => c.code === school.country)
                    ?.name.replace("Du học ", "") ?? school.country;
                const provinceLabel =
                  provinces.find((p) => p.code === school.province)?.name ??
                  school.province;
                return (
                  <div
                    key={school.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold leading-snug text-slate-800">
                          {school.name}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {provinceLabel}, {countryLabel} ·{" "}
                          {STUDY_LEVEL_LABELS[school.level]}
                        </p>
                      </div>
                      <GraduationCap
                        className="h-5 w-5 shrink-0 text-primary"
                        aria-hidden
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-base font-bold text-primary">
                        {formatUsd(school.tuitionUsd)}
                        <span className="text-xs font-normal text-slate-400">/năm</span>
                      </span>
                      {school.scholarshipUpTo !== undefined && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                          <Percent className="h-3 w-3" aria-hidden />
                          Học bổng đến {school.scholarshipUpTo}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}