"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { SchoolEditFormValues } from "@/lib/validations";
import { FieldErr, inputClasses, labelClasses } from "./ui";

/** "" → undefined cho field text optional (Zod min(1) khi có giá trị). */
const emptyToUndef = (v: string) => (v === "" || v == null ? undefined : v);
/** "" → undefined cho field số optional. */
const numOrUndef = (v: string) => (v === "" || v == null ? undefined : Number(v));
/** "" → null cho field số nullable. */
const numOrNull = (v: string) => (v === "" || v == null ? null : Number(v));

/** Tab 2 — Thông số nhanh (quick_facts JSONB) + Chi phí (tuition + cost_breakdown JSONB). */
export function QuickFactsCostTab() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<SchoolEditFormValues>();

  const costRows = useFieldArray({ control, name: "cost_breakdown.rows" });

  return (
    <div className="space-y-5">
      {/* ── Học phí hiển thị (cột phẳng, dùng cho filter/tìm trường) ── */}
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="sf-tuition" className={labelClasses}>Học phí USD/năm *</label>
          <input
            id="sf-tuition"
            type="number"
            min={0}
            {...register("tuition_usd", { setValueAs: numOrUndef })}
            className={inputClasses}
          />
          <FieldErr message={errors.tuition_usd?.message} />
        </div>
        <div>
          <label htmlFor="sf-scholarship" className={labelClasses}>% học bổng tối đa</label>
          <input
            id="sf-scholarship"
            type="number"
            min={0}
            max={100}
            placeholder="Bỏ trống nếu không có"
            {...register("scholarship_up_to", { setValueAs: numOrNull })}
            className={inputClasses}
          />
          <FieldErr message={errors.scholarship_up_to?.message} />
        </div>
      </fieldset>

      {/* ── Quick Facts (JSONB quick_facts) ── */}
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-slate-800">Quick Facts (sidebar trang chi tiết)</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="qf-founded" className={labelClasses}>Năm thành lập</label>
            <input
              id="qf-founded"
              type="number"
              {...register("quick_facts.foundedYear", { setValueAs: numOrUndef })}
              className={inputClasses}
            />
            <FieldErr message={errors.quick_facts?.foundedYear?.message} />
          </div>
          <div>
            <label htmlFor="qf-type" className={labelClasses}>Loại trường</label>
            <input
              id="qf-type"
              placeholder="Công lập / Tư thục / Nội trú..."
              {...register("quick_facts.schoolType", { setValueAs: emptyToUndef })}
              className={inputClasses}
            />
            <FieldErr message={errors.quick_facts?.schoolType?.message} />
          </div>
          <div>
            <label htmlFor="qf-students" className={labelClasses}>Số sinh viên</label>
            <input
              id="qf-students"
              placeholder="vd: 25,000+"
              {...register("quick_facts.studentCount", { setValueAs: emptyToUndef })}
              className={inputClasses}
            />
            <FieldErr message={errors.quick_facts?.studentCount?.message} />
          </div>
          <div>
            <label htmlFor="qf-city" className={labelClasses}>Thành phố campus</label>
            <input
              id="qf-city"
              {...register("quick_facts.campusCity", { setValueAs: emptyToUndef })}
              className={inputClasses}
            />
            <FieldErr message={errors.quick_facts?.campusCity?.message} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="qf-web" className={labelClasses}>Website chính thức</label>
            <input
              id="qf-web"
              placeholder="https://..."
              {...register("quick_facts.websiteUrl", { setValueAs: emptyToUndef })}
              className={inputClasses}
            />
            <FieldErr message={errors.quick_facts?.websiteUrl?.message} />
          </div>
        </div>
      </fieldset>

      {/* ── Bảng chi phí (JSONB cost_breakdown) ── */}
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-slate-800">Bảng chi phí chi tiết</legend>
        <div className="mb-3 max-w-[160px]">
          <label htmlFor="cb-currency" className={labelClasses}>Đơn vị tiền</label>
          <input
            id="cb-currency"
            placeholder="USD, CAD..."
            {...register("cost_breakdown.currency")}
            className={inputClasses}
          />
          <FieldErr message={errors.cost_breakdown?.currency?.message} />
        </div>

        <div className="space-y-2">
          {costRows.fields.map((field, i) => (
            <div key={field.id} className="flex flex-wrap items-start gap-2 rounded-md border border-slate-200 p-2">
              <div className="min-w-[180px] flex-1">
                <input
                  placeholder="Khoản mục (vd: Học phí trung học) *"
                  aria-label={`Khoản mục ${i + 1}`}
                  {...register(`cost_breakdown.rows.${i}.label`)}
                  className={inputClasses}
                />
                <FieldErr message={errors.cost_breakdown?.rows?.[i]?.label?.message} />
              </div>
              <input
                type="number"
                placeholder="Từ"
                aria-label={`Số tiền tối thiểu ${i + 1}`}
                {...register(`cost_breakdown.rows.${i}.amountMin`, { setValueAs: numOrNull })}
                className={`${inputClasses} w-24 flex-none`}
              />
              <input
                type="number"
                placeholder="Đến"
                aria-label={`Số tiền tối đa ${i + 1}`}
                {...register(`cost_breakdown.rows.${i}.amountMax`, { setValueAs: numOrNull })}
                className={`${inputClasses} w-24 flex-none`}
              />
              <input
                placeholder="Đơn vị (CAD/năm)"
                aria-label={`Đơn vị ${i + 1}`}
                {...register(`cost_breakdown.rows.${i}.unit`)}
                className={`${inputClasses} w-32 flex-none`}
              />
              <button
                type="button"
                onClick={() => costRows.remove(i)}
                aria-label={`Xóa khoản mục ${i + 1}`}
                className="mt-2 text-slate-400 hover:text-accent"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => costRows.append({ label: "", amountMin: null, amountMax: null, unit: "" })}
          className="mt-2 inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden /> Thêm khoản chi phí
        </button>
      </fieldset>
    </div>
  );
}
