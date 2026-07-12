"use client";

/**
 * SchoolFilter — Khối banner lọc trường (nền primary-dark).
 * Đích: src/components/schools/SchoolFilter.tsx
 *
 * Presentational component thuần frontend:
 * - KHÔNG fetch, KHÔNG Supabase, KHÔNG router — chỉ nhận props + gọi onSearch().
 * - Types import từ src/types/index.ts (Nguyên tắc #3 — không khai báo type mới ở đây).
 * - Màu lấy từ tailwind theme (primary / primary-dark / primary-light) — không hardcode hex.
 * - Dual-handle slider: dùng Radix trực tiếp (không dùng ui/Slider vì cần badge giá trị
 *   bám thumb + phối màu trắng trên nền primary-dark, khác thiết kế accent của SchoolFinder).
 */

import { useMemo, useState } from "react";
import * as Slider from "@radix-ui/react-slider";
import { Search } from "lucide-react";
import type { FilterState, SchoolFilterProps } from "@/types";
import { STUDY_LEVEL_LABELS } from "@/types";
import { formatUsd } from "@/lib/schools";
import { groupMajorsByCategory } from "@/hooks/useMajors";

const TUITION_MIN = 0;
const TUITION_MAX = 60000;
const TUITION_STEP = 1000;

/** Bậc học — derive từ nguồn chuẩn STUDY_LEVEL_LABELS (types/index.ts) */
const LEVEL_OPTIONS = Object.entries(STUDY_LEVEL_LABELS).map(([value, label]) => ({
  label,
  value,
}));

/** $60,000 → "$60,000+" (chạm trần slider), còn lại "$xx,xxx" */
function formatTuition(value: number): string {
  return value >= TUITION_MAX ? `${formatUsd(value)}+` : formatUsd(value);
}

const selectClassName =
  "w-full appearance-none rounded-md border border-gray-200 bg-white px-4 py-3 pr-10 text-sm text-gray-800 " +
  "shadow-sm outline-none transition focus:ring-2 focus:ring-primary-light " +
  "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

/** Mũi tên dropdown tự vẽ (appearance-none đã tắt mũi tên mặc định) */
function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.06l3.71-3.83a.75.75 0 1 1 1.08 1.04l-4.25 4.39a.75.75 0 0 1-1.08 0L5.23 8.27a.75.75 0 0 1 .02-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export default function SchoolFilter({
  onSearch,
  countries,
  provinces,
  majors = [],
  major = "",
}: SchoolFilterProps) {
  // Local state — chỉ đẩy lên cha khi bấm "Tìm trường"
  const [filters, setFilters] = useState<FilterState>({
    country: "",
    province: "",
    level: "",
    tuitionRange: [TUITION_MIN, TUITION_MAX],
    major, // khởi tạo từ URL ?major= (page truyền xuống)
  });

  // Cascading: derive danh sách tỉnh bang theo quốc gia đang chọn (không lưu state thừa)
  const provinceOptions = useMemo(
    () => provinces.filter((p) => p.countryValue === filters.country),
    [provinces, filters.country],
  );

  const handleCountryChange = (country: string) => {
    // Đổi quốc gia → reset tỉnh bang (tránh giữ province không thuộc country mới)
    setFilters((prev) => ({ ...prev, country, province: "" }));
  };

  const handleSubmit = () => {
    onSearch(filters);
  };

  return (
    <section
      aria-label="Bộ lọc tìm trường"
      className="relative overflow-hidden rounded-xl bg-primary-dark px-5 py-8 sm:px-8 md:py-10"
    >
      {/* Họa tiết chéo mờ phía sau — mô phỏng đường nét trong thiết kế thinkEDU */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-full w-1/3 -skew-x-12 bg-white/5" />
        <div className="absolute left-1/3 top-0 h-full w-16 -skew-x-12 bg-white/5" />
        <div className="absolute -right-20 -top-16 h-64 w-64 rotate-45 bg-white/5" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        {/* ── Hàng 1: 4 dropdown — 1 cột mobile, 2 cột tablet, 4 cột desktop ── */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Quốc gia */}
          <div className="relative">
            <label htmlFor="filter-country" className="mb-1.5 block text-sm font-medium text-white">
              Quốc gia
            </label>
            <div className="relative">
              <select
                id="filter-country"
                value={filters.country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className={selectClassName}
              >
                <option value="">Chọn quốc gia</option>
                {countries.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>

          {/* Tỉnh bang / Thành phố — cascading theo quốc gia */}
          <div className="relative">
            <label htmlFor="filter-province" className="mb-1.5 block text-sm font-medium text-white">
              Tỉnh bang / Thành phố
            </label>
            <div className="relative">
              <select
                id="filter-province"
                value={filters.province}
                onChange={(e) => setFilters((prev) => ({ ...prev, province: e.target.value }))}
                disabled={!filters.country || provinceOptions.length === 0}
                className={selectClassName}
              >
                <option value="">
                  {!filters.country
                    ? "Chọn quốc gia trước"
                    : provinceOptions.length === 0
                      ? "Chưa có dữ liệu tỉnh bang"
                      : "Tất cả tỉnh bang"}
                </option>
                {provinceOptions.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>

          {/* Bậc học */}
          <div className="relative">
            <label htmlFor="filter-level" className="mb-1.5 block text-sm font-medium text-white">
              Bậc học
            </label>
            <div className="relative">
              <select
                id="filter-level"
                value={filters.level}
                onChange={(e) => setFilters((prev) => ({ ...prev, level: e.target.value }))}
                className={selectClassName}
              >
                <option value="">Tất cả bậc học</option>
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>

          {/* Ngành học — optgroup theo nhóm (majors do page truyền, migration #13) */}
          <div className="relative">
            <label htmlFor="filter-major" className="mb-1.5 block text-sm font-medium text-white">
              Ngành học
            </label>
            <div className="relative">
              <select
                id="filter-major"
                value={filters.major ?? ""}
                onChange={(e) => setFilters((prev) => ({ ...prev, major: e.target.value }))}
                className={selectClassName}
              >
                <option value="">Tất cả ngành học</option>
                {groupMajorsByCategory(majors).map(([category, list]) => (
                  <optgroup key={category} label={category}>
                    {list.map((m) => (
                      <option key={m.slug} value={m.slug}>
                        {m.name_vi}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>
        </div>

        {/* ── Hàng 2: Slider (≈70%) + Nút tìm (≈30%) ───────────────────────── */}
        <div className="mt-8 grid grid-cols-1 items-end gap-6 md:grid-cols-10 md:gap-8">
          {/* Slider học phí */}
          <div className="md:col-span-7">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-white">Học phí tham khảo (USD/năm)</p>
              <p className="text-xs text-white/70">
                {formatTuition(TUITION_MIN)} – {formatTuition(TUITION_MAX)}
              </p>
            </div>

            {/* pb-8: chừa chỗ cho 2 badge giá trị dưới thumb */}
            <div className="pb-8 pt-2">
              <Slider.Root
                value={filters.tuitionRange}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    tuitionRange: value as [number, number],
                  }))
                }
                min={TUITION_MIN}
                max={TUITION_MAX}
                step={TUITION_STEP}
                minStepsBetweenThumbs={1}
                aria-label="Khoảng học phí"
                className="relative flex h-5 w-full touch-none select-none items-center"
              >
                <Slider.Track className="relative h-1.5 grow rounded-full bg-white/25">
                  <Slider.Range className="absolute h-full rounded-full bg-white" />
                </Slider.Track>

                {filters.tuitionRange.map((value, index) => (
                  <Slider.Thumb
                    key={index}
                    aria-label={index === 0 ? "Học phí tối thiểu" : "Học phí tối đa"}
                    className="relative block h-5 w-5 rounded-full border-2 border-primary-dark bg-white shadow
                               outline-none transition-transform focus-visible:ring-2 focus-visible:ring-white
                               focus-visible:ring-offset-2 focus-visible:ring-offset-primary-dark hover:scale-110"
                  >
                    {/* Badge giá trị bám theo thumb — giống tooltip trong ảnh mẫu */}
                    <span
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded
                                 bg-white px-2 py-0.5 text-xs font-semibold text-primary-dark shadow"
                    >
                      {formatTuition(value)}
                    </span>
                  </Slider.Thumb>
                ))}
              </Slider.Root>
            </div>
          </div>

          {/* Nút Tìm trường */}
          <div className="md:col-span-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5
                         text-base font-semibold text-white shadow-md transition-colors
                         hover:bg-primary-light focus-visible:outline-none focus-visible:ring-2
                         focus-visible:ring-white focus-visible:ring-offset-2
                         focus-visible:ring-offset-primary-dark"
            >
              <Search className="h-5 w-5" aria-hidden="true" />
              Tìm trường
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}