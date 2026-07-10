"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2, X } from "lucide-react";
import type { SchoolFormModalProps, StudyLevel } from "@/types";
import { STUDY_LEVEL_LABELS } from "@/types";
import { destinations, provinces } from "@/data/destinations";
import { schoolFormSchema } from "@/lib/validations";
import { Button } from "@/components/ui/Button";

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

const inputClasses =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none";

const LEVELS = Object.entries(STUDY_LEVEL_LABELS) as [StudyLevel, string][];

/**
 * Modal Thêm/Sửa trường — overlay Tailwind thuần, form react-hook-form + zodResolver.
 * Tạo mới → POST /api/admin/schools; sửa → PATCH /api/admin/schools/[id].
 */
export function SchoolFormModal({ school, onClose, onSaved }: SchoolFormModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolFormSchema),
    defaultValues: school
      ? {
          name: school.name,
          country: school.country,
          province: school.province,
          level: school.level,
          tuition_usd: school.tuition_usd,
          scholarship_up_to: school.scholarship_up_to,
          is_active: school.is_active,
        }
      : { name: "", country: "", province: "", level: "dai-hoc", is_active: true },
  });

  const country = watch("country");
  const provinceOptions = useMemo(
    () => provinces.filter((p) => p.countryCode === country),
    [country]
  );
  // Dữ liệu từ crawler có thể chứa country/province ngoài danh mục tĩnh — giữ giá trị cũ làm option
  const countryUnknown =
    school !== null && school.country !== "" && !destinations.some((d) => d.code === school.country);
  const provinceUnknown =
    school !== null &&
    school.province !== "" &&
    !provinces.some((p) => p.code === school.province);

  const onSubmit = async (data: SchoolFormValues) => {
    setServerError(null);
    try {
      const response = await fetch(
        school ? `/api/admin/schools/${school.id}` : "/api/admin/schools",
        {
          method: school ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Không lưu được trường");
      }
      onSaved();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Lỗi mạng — thử lại.");
    }
  };

  const fieldError = (message?: string) =>
    message ? (
      <p role="alert" className="mt-1 text-xs font-semibold text-accent">
        {message}
      </p>
    ) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="school-modal-title" className="text-lg font-bold text-slate-800">
            {school ? `Sửa: ${school.name}` : "Thêm trường mới"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
          <div>
            <label htmlFor="school-name" className="mb-1 block text-sm font-semibold text-slate-700">
              Tên trường *
            </label>
            <input id="school-name" {...register("name")} className={inputClasses} />
            {fieldError(errors.name?.message)}
          </div>

          <div>
            <label htmlFor="school-country" className="mb-1 block text-sm font-semibold text-slate-700">
              Quốc gia *
            </label>
            <select
              id="school-country"
              {...register("country", {
                onChange: () => setValue("province", ""),
              })}
              className={inputClasses}
            >
              <option value="">— Chọn quốc gia —</option>
              {countryUnknown && (
                <option value={school.country}>{school.country} (từ crawler)</option>
              )}
              {destinations.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name.replace("Du học ", "")}
                </option>
              ))}
            </select>
            {fieldError(errors.country?.message)}
          </div>

          <div>
            <label htmlFor="school-province" className="mb-1 block text-sm font-semibold text-slate-700">
              Tỉnh bang / Thành phố *
            </label>
            <select
              id="school-province"
              {...register("province")}
              disabled={!country}
              className={`${inputClasses} disabled:opacity-50`}
            >
              <option value="">— Chọn tỉnh bang —</option>
              {provinceUnknown && school.country === country && (
                <option value={school.province}>{school.province} (từ crawler)</option>
              )}
              {provinceOptions.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
            {fieldError(errors.province?.message)}
          </div>

          <div>
            <label htmlFor="school-level" className="mb-1 block text-sm font-semibold text-slate-700">
              Bậc học *
            </label>
            <select id="school-level" {...register("level")} className={inputClasses}>
              {LEVELS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {fieldError(errors.level?.message)}
          </div>

          <div>
            <label htmlFor="school-tuition" className="mb-1 block text-sm font-semibold text-slate-700">
              Học phí USD/năm *
            </label>
            <input
              id="school-tuition"
              type="number"
              min={0}
              {...register("tuition_usd", {
                setValueAs: (v: string) => (v === "" || v == null ? undefined : Number(v)),
              })}
              className={inputClasses}
            />
            {fieldError(errors.tuition_usd?.message)}
          </div>

          <div>
            <label htmlFor="school-scholarship" className="mb-1 block text-sm font-semibold text-slate-700">
              % học bổng tối đa
            </label>
            <input
              id="school-scholarship"
              type="number"
              min={0}
              max={100}
              placeholder="Bỏ trống nếu không có"
              {...register("scholarship_up_to", {
                setValueAs: (v: string) => (v === "" || v == null ? null : Number(v)),
              })}
              className={inputClasses}
            />
            {fieldError(errors.scholarship_up_to?.message)}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
            <input type="checkbox" {...register("is_active")} className="h-4 w-4 accent-primary" />
            Hiển thị trên website
          </label>

          {serverError && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-accent">
              {serverError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Lưu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
