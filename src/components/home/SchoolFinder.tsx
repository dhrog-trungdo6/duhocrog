"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { GraduationCap, Percent, Search, SearchX } from "lucide-react";
import type { School, StudyLevel } from "@/types";
import { STUDY_LEVEL_LABELS } from "@/types";
import { destinations, provinces } from "@/data/destinations";
import {
  countryLabelByCode,
  formatUsd,
  provinceLabelByCode,
  searchSchools,
} from "@/lib/schools";
import { useSchools } from "@/hooks/useSchools";
import { Slider } from "@/components/ui/Slider";
import { Button } from "@/components/ui/Button";

const TUITION_MIN = 0;
const TUITION_MAX = 60_000;
const TUITION_STEP = 1_000;

const LEVELS = Object.entries(STUDY_LEVEL_LABELS) as [StudyLevel, string][];

const selectClasses =
  "w-full rounded-md border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white focus:border-white focus:outline-none [&>option]:text-slate-900";

/**
 * ⭐ Công cụ tìm trường & học bổng — tính năng lõi.
 * Client-side filter (logic chung `searchSchools` trong src/lib/schools.ts):
 * lọc theo 4 tiêu chí và hiển thị kết quả ngay bên dưới (kèm empty state).
 * Trang kết quả riêng: /tim-truong (dùng chung searchSchools + useSchools).
 */
export function SchoolFinder() {
  const [country, setCountry] = useState("");
  const [province, setProvince] = useState("");
  const [level, setLevel] = useState<StudyLevel | "">("");
  const [tuitionRange, setTuitionRange] = useState<[number, number]>([
    TUITION_MIN,
    TUITION_MAX,
  ]);
  const [results, setResults] = useState<School[] | null>(null);
  const schools = useSchools();

  // Cascading select: chỉ derive tỉnh bang của quốc gia đang chọn
  const provinceOptions = useMemo(
    () => provinces.filter((p) => p.countryCode === country),
    [country]
  );

  const handleCountryChange = (value: string) => {
    setCountry(value);
    setProvince(""); // reset tỉnh bang khi đổi quốc gia
  };

  const handleSearch = () => {
    setResults(searchSchools(schools, { country, province, level, tuitionRange }));
  };

  return (
    <section
      id="school-finder"
      className="bg-gradient-to-r from-primary-dark via-primary to-navy py-14 text-white"
      aria-labelledby="finder-title"
    >
      <div className="mx-auto max-w-7xl px-4">
        <h2 id="finder-title" className="mb-2 text-center text-2xl font-extrabold uppercase">
          Tìm trường &amp; học bổng phù hợp
        </h2>
        <p className="mb-8 text-center text-sm text-white/80">
          Chọn quốc gia, thành phố, bậc học và ngân sách — ROG gợi ý trường tối ưu học bổng cho bạn.
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          <div>
            <label htmlFor="finder-country" className="mb-1.5 block text-sm font-semibold">
              Quốc gia
            </label>
            <select
              id="finder-country"
              className={selectClasses}
              value={country}
              onChange={(e) => handleCountryChange(e.target.value)}
            >
              <option value="">— Chọn quốc gia —</option>
              {destinations.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name.replace("Du học ", "")}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="finder-province" className="mb-1.5 block text-sm font-semibold">
              Tỉnh bang / Thành phố
            </label>
            <select
              id="finder-province"
              className={`${selectClasses} disabled:opacity-50`}
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              disabled={!country}
            >
              <option value="">
                {country ? "— Tất cả tỉnh bang/thành phố —" : "— Chọn quốc gia trước —"}
              </option>
              {provinceOptions.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="finder-level" className="mb-1.5 block text-sm font-semibold">
              Bậc học
            </label>
            <select
              id="finder-level"
              className={selectClasses}
              value={level}
              onChange={(e) => setLevel(e.target.value as StudyLevel | "")}
            >
              <option value="">— Chọn bậc học —</option>
              {LEVELS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Thanh trượt học phí dual-handle */}
        <div className="mt-6 grid items-end gap-5 md:grid-cols-[1fr_auto]">
          <div>
            <div className="mb-3 flex items-center justify-between text-sm font-semibold">
              <span>Học phí tham khảo / năm</span>
              <span className="rounded-md bg-white/15 px-3 py-1 tabular-nums">
                {formatUsd(tuitionRange[0])} — {formatUsd(tuitionRange[1])}
              </span>
            </div>
            <Slider
              min={TUITION_MIN}
              max={TUITION_MAX}
              step={TUITION_STEP}
              value={tuitionRange}
              onValueChange={(v) => setTuitionRange([v[0], v[1]])}
              minStepsBetweenThumbs={1}
            />
            <div className="mt-1.5 flex justify-between text-xs text-white/60">
              <span>{formatUsd(TUITION_MIN)}</span>
              <span>{formatUsd(TUITION_MAX)}</span>
            </div>
          </div>
          <Button variant="accent" size="lg" onClick={handleSearch} className="md:mb-6">
            <Search className="h-4 w-4" aria-hidden />
            Tìm trường
          </Button>
        </div>

        {/* Kết quả */}
        {results !== null && (
          <div className="mt-10" aria-live="polite">
            {results.length === 0 ? (
              <div className="mx-auto max-w-md rounded-lg bg-white/10 p-8 text-center">
                <SearchX className="mx-auto h-10 w-10 text-white/60" aria-hidden />
                <p className="mt-3 font-semibold">Không tìm thấy trường phù hợp</p>
                <p className="mt-1 text-sm text-white/70">
                  Vui lòng điều chỉnh bộ lọc (mở rộng ngân sách hoặc bỏ chọn tỉnh bang).
                </p>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-white/80">
                  Tìm thấy <strong>{results.length}</strong> trường phù hợp:
                </p>
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {results.map((school) => {
                    const countryName =
                      countryLabelByCode.get(school.country) ?? school.country;
                    const provinceName =
                      provinceLabelByCode.get(school.province) ?? school.province;
                    return (
                      <li
                        key={school.id}
                        className="rounded-lg bg-white p-5 text-slate-800 shadow-md"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold leading-snug">
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
                          <GraduationCap className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {provinceName}, {countryName} · {STUDY_LEVEL_LABELS[school.level]}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-primary">
                            {formatUsd(school.tuitionUsd)}/năm
                          </span>
                          {school.scholarshipUpTo !== undefined && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                              <Percent className="h-3 w-3" aria-hidden />
                              Học bổng đến {school.scholarshipUpTo}%
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
