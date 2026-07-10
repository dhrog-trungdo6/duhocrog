"use client";

import { useFormContext } from "react-hook-form";
import { Rss } from "lucide-react";
import type { SchoolEditFormValues } from "@/lib/validations";
import { FieldErr, inputClasses, labelClasses } from "./ui";

/** Tab 4 — Cấu hình automation: nguồn RSS + bật bot tự cào (migration #9, rule 10). */
export function AutomationTab() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SchoolEditFormValues>();

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="sf-rss" className={labelClasses}>
          <Rss className="mr-1 inline h-4 w-4 text-accent-orange" aria-hidden />
          Nguồn RSS / trang tin chính thức
        </label>
        <input
          id="sf-rss"
          placeholder="https://truong.edu/news/rss.xml"
          {...register("official_rss_url", {
            setValueAs: (v: string) => (v === "" || v == null ? undefined : v),
          })}
          className={inputClasses}
        />
        <FieldErr message={errors.official_rss_url?.message} />
        <p className="mt-1 text-xs text-slate-500">
          n8n dùng URL này để theo dõi tin tức mới của trường và append vào mục
          &quot;Nội dung chi tiết&quot; (rule 10 — không ghi đè dữ liệu cũ).
        </p>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
        <input type="checkbox" {...register("auto_sync_enabled")} className="h-4 w-4 accent-primary" />
        Bật bot tự động làm giàu nội dung cho trường này
      </label>

      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        ⚠️ Hai trường này lưu vào cột migration #9 (<code>official_rss_url</code>,{" "}
        <code>auto_sync_enabled</code>). Nếu chưa apply migration #9 trên Supabase
        Dashboard, hãy để trống/tắt — điền giá trị sẽ báo lỗi lưu.
      </p>
    </div>
  );
}
