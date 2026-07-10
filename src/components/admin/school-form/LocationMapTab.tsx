"use client";

import { useFormContext } from "react-hook-form";
import { MapPin } from "lucide-react";
import type { SchoolEditFormValues } from "@/lib/validations";
import { FieldErr, inputClasses, labelClasses } from "./ui";

/** Tab Vị trí & Bản đồ — map_embed_url + preview live (rule 12: chỉ lưu URL src). */
export function LocationMapTab() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<SchoolEditFormValues>();

  const mapUrl = watch("map_embed_url");
  // Cùng guard với trang chi tiết: chỉ preview https (chặn javascript:/data:)
  const previewSrc = mapUrl && /^https:\/\//i.test(mapUrl.trim()) ? mapUrl.trim() : null;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="sf-map" className={labelClasses}>
          <MapPin className="mr-1 inline h-4 w-4 text-primary" aria-hidden />
          Link nhúng Google Maps (map_embed_url)
        </label>
        <input
          id="sf-map"
          placeholder="https://www.google.com/maps/embed?pb=..."
          {...register("map_embed_url")}
          className={inputClasses}
        />
        <FieldErr message={errors.map_embed_url?.message} />
        <p className="mt-1 text-xs text-slate-500">
          Google Maps → <strong>Chia sẻ</strong> → <strong>Nhúng bản đồ</strong> → chỉ copy
          URL trong thuộc tính <code>src</code> của thẻ iframe (KHÔNG dán cả thẻ
          &lt;iframe&gt; — rule 12 Embed Safety).
        </p>
      </div>

      {previewSrc ? (
        <div>
          <p className="mb-1.5 text-sm font-semibold text-slate-700">Preview bản đồ</p>
          <iframe
            src={previewSrc}
            title="Preview bản đồ"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[280px] w-full rounded-lg border border-slate-200 bg-slate-50"
          />
        </div>
      ) : (
        <p className="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-400">
          Nhập URL https hợp lệ để xem preview bản đồ tại đây.
        </p>
      )}

      <p className="rounded-md bg-primary/5 px-3 py-2 text-xs text-slate-600">
        💡 Mô tả &quot;Vị trí đắc địa – lợi thế&quot;: thêm 1 section HTML/Danh sách với
        tiêu đề đó ở tab <strong>Nội dung chi tiết</strong> — Mục lục bài viết sẽ tự
        nhận tiêu đề (TOC auto-generation, rule 12), không cần nhập tay ở đây.
      </p>
    </div>
  );
}
