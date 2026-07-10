"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Link2 } from "lucide-react";
import type { SchoolEditFormValues } from "@/lib/validations";
import { FieldErr, inputClasses, labelClasses } from "./ui";

/** Tab Liên kết & CTA — toggle khối CTA cuối bài + slug trường liên quan (migration #10). */
export function LinksCtaTab() {
  const {
    register,
    getValues,
    setValue,
    formState: { errors },
  } = useFormContext<SchoolEditFormValues>();

  // Textarea nhập slug mỗi dòng — state text cục bộ, form value là string[]
  const [slugsText, setSlugsText] = useState(() =>
    (getValues("related_slugs") ?? []).join("\n")
  );

  const onSlugsChange = (text: string) => {
    setSlugsText(text);
    const slugs = text
      .split("\n")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    setValue("related_slugs", slugs, { shouldDirty: true, shouldValidate: true });
  };

  const slugsError = errors.related_slugs;
  const slugsErrorMessage =
    slugsError?.message ??
    (Array.isArray(slugsError)
      ? slugsError.find((e) => e?.message)?.message
      : undefined);

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
        <input type="checkbox" {...register("show_cta")} className="h-4 w-4 accent-primary" />
        Hiện khối CTA &quot;Vì sao chọn Du học ROG?&quot; cuối bài
      </label>

      <div>
        <label htmlFor="sf-related" className={labelClasses}>
          <Link2 className="mr-1 inline h-4 w-4 text-primary" aria-hidden />
          Bài viết liên quan — slug trường, mỗi dòng 1 slug (tối đa 12)
        </label>
        <textarea
          id="sf-related"
          rows={5}
          value={slugsText}
          onChange={(e) => onSlugsChange(e.target.value)}
          placeholder={"university-of-winchester\nuniversity-of-stirling\nlancaster-university"}
          className={`${inputClasses} font-mono text-xs`}
        />
        <FieldErr message={slugsErrorMessage} />
        <p className="mt-1 text-xs text-slate-500">
          Trang chi tiết render section &quot;Bài viết liên quan&quot; theo đúng thứ tự
          này — chỉ hiện trường đang active, slug sai sẽ tự bị bỏ qua.
        </p>
      </div>

      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        ⚠️ Hai trường này lưu vào cột migration #10 (<code>show_cta</code>,{" "}
        <code>related_slugs</code>). Nếu chưa apply migration #10 trên Supabase
        Dashboard, hãy giữ mặc định (CTA bật, danh sách trống) — thay đổi sẽ báo lỗi lưu.
      </p>
    </div>
  );
}
