"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, GraduationCap, Percent, SearchX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { School, FilterOption, ProvinceFilterOption, FilterState } from "@/types";
import { STUDY_LEVEL_LABELS } from "@/types";
import { destinations, provinces } from "@/data/destinations";
import {
  countryLabelByCode,
  formatUsd,
  provinceLabelByCode,
  searchSchools,
} from "@/lib/schools";
import { useSchools } from "@/hooks/useSchools";
import { useMajors } from "@/hooks/useMajors";
import SchoolFilter from "@/components/schools/SchoolFilter";
import { ProgramTags } from "@/components/schools/ProgramTags";

/** Options cho SchoolFilter — hằng module, derive từ data tĩnh nên không cần useMemo */
const countryOptions: FilterOption[] = destinations.map((d) => ({
  label: d.name.replace("Du học ", ""),
  value: d.code,
}));

const provinceOptions: ProvinceFilterOption[] = provinces.map((p) => ({
  label: p.name,
  value: p.code,
  countryValue: p.countryCode,
}));

function TimTruongContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCountry = searchParams.get("country") ?? "";
  const initialMajor = searchParams.get("major") ?? "";

  const [results, setResults] = useState<School[] | null>(null);
  const [lastFilter, setLastFilter] = useState<FilterState>({
    country: initialCountry,
    province: "",
    level: "",
    tuitionRange: [0, 60000],
    major: initialMajor,
  });

  // Ngành (N-N) lọc server-side → đẩy vào query; 4 tiêu chí còn lại lọc client bên dưới
  const majorQuery = lastFilter.major ? `major=${encodeURIComponent(lastFilter.major)}` : "";
  const schools = useSchools(majorQuery);
  const majors = useMajors();

  // Chạy lại khi nguồn schools đổi: mock→DB, hoặc đổi ngành → fetch server trả tập mới
  useEffect(() => {
    setResults(searchSchools(schools, lastFilter));
  }, [schools]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = useCallback(
    (filters: FilterState) => {
      setLastFilter(filters);
      setResults(searchSchools(schools, filters));
      // Đồng bộ URL (?country=&major=) — không reload, giữ link chia sẻ được
      const params = new URLSearchParams();
      if (filters.country) params.set("country", filters.country);
      if (filters.major) params.set("major", filters.major);
      const qs = params.toString();
      router.replace(qs ? `/tim-truong?${qs}` : "/tim-truong", { scroll: false });
    },
    [schools, router],
  );

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
            majors={majors}
            major={initialMajor}
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
                  countryLabelByCode.get(school.country) ?? school.country;
                const provinceLabel =
                  provinceLabelByCode.get(school.province) ?? school.province;
                return (
                  <div
                    key={school.id}
                    className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold leading-snug text-slate-800">
                          {school.slug ? (
                            <Link
                              href={`/truong/${school.slug}`}
                              prefetch={false}
                              className="transition-colors hover:text-primary"
                            >
                              {school.name}
                            </Link>
                          ) : (
                            school.name
                          )}
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
                    {/* Nhãn thông minh (v1.13.0) — học bổng đã có badge riêng bên dưới */}
                    <ProgramTags school={school} showScholarship={false} className="mt-3" />
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

// useSearchParams() bắt buộc có Suspense boundary khi prerender static (Next.js 14)
export default function TimTruongPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
      }
    >
      <TimTruongContent />
    </Suspense>
  );
}
