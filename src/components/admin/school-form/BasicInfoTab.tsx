"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import type { StudyLevel } from "@/types";
import { STUDY_LEVEL_LABELS } from "@/types";
import type { SchoolEditFormValues } from "@/lib/validations";
import { destinations, provinces } from "@/data/destinations";
import { FieldErr, inputClasses, labelClasses } from "./ui";

const LEVELS = Object.entries(STUDY_LEVEL_LABELS) as [StudyLevel, string][];

/** Tab 1 — Tổng quan: tên, slug, quốc gia/tỉnh, bậc học, logo, trạng thái. */
export function BasicInfoTab() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<SchoolEditFormValues>();

  const country = watch("country");
  const province = watch("province");
  const provinceOptions = useMemo(
    () => provinces.filter((p) => p.countryCode === country),
    [country]
  );
  // Dữ liệu crawler có thể chứa country/province ngoài danh mục tĩnh — giữ làm option
  const countryUnknown = country !== "" && !destinations.some((d) => d.code === country);
  const provinceUnknown = province !== "" && !provinces.some((p) => p.code === province);

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="sf-name" className={labelClasses}>Tên trường *</label>
        <input id="sf-name" {...register("name")} className={inputClasses} />
        <FieldErr message={errors.name?.message} />
      </div>

      <div>
        <label htmlFor="sf-slug" className={labelClasses}>
          Slug <span className="font-normal text-slate-400">(bỏ trống → tự sinh từ tên)</span>
        </label>
        <input
          id="sf-slug"
          placeholder="vd: ball-state-university"
          {...register("slug", {
            setValueAs: (v: string) => (v === "" || v == null ? undefined : v),
          })}
          className={inputClasses}
        />
        <FieldErr message={errors.slug?.message} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="sf-country" className={labelClasses}>Quốc gia *</label>
          <select
            id="sf-country"
            {...register("country", { onChange: () => setValue("province", "") })}
            className={inputClasses}
          >
            <option value="">— Chọn quốc gia —</option>
            {countryUnknown && <option value={country}>{country} (từ crawler)</option>}
            {destinations.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name.replace("Du học ", "")}
              </option>
            ))}
          </select>
          <FieldErr message={errors.country?.message} />
        </div>
        <div>
          <label htmlFor="sf-province" className={labelClasses}>Tỉnh bang / Thành phố *</label>
          <select
            id="sf-province"
            {...register("province")}
            disabled={!country}
            className={`${inputClasses} disabled:opacity-50`}
          >
            <option value="">— Chọn tỉnh bang —</option>
            {provinceUnknown && <option value={province}>{province} (từ crawler)</option>}
            {provinceOptions.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
          <FieldErr message={errors.province?.message} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="sf-level" className={labelClasses}>Bậc học *</label>
          <select id="sf-level" {...register("level")} className={inputClasses}>
            {LEVELS.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <FieldErr message={errors.level?.message} />
        </div>
        <div>
          <label htmlFor="sf-logo" className={labelClasses}>Logo URL</label>
          <input
            id="sf-logo"
            placeholder="/partners/placeholder.svg"
            {...register("logo_url")}
            className={inputClasses}
          />
          <FieldErr message={errors.logo_url?.message} />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 pt-1 text-sm font-semibold text-slate-700">
        <input type="checkbox" {...register("is_active")} className="h-4 w-4 accent-primary" />
        Hiển thị trên website (Active)
      </label>
    </div>
  );
}
