"use client";

import { useFieldArray, useFormContext, type FieldPath } from "react-hook-form";
import { Code, List, Plus, Table2, Trash2 } from "lucide-react";
import type { SchoolSection } from "@/types";
import type { SchoolEditFormValues } from "@/lib/validations";
import { FieldErr, inputClasses, labelClasses } from "./ui";
import { TableSectionEditor } from "./TableSectionEditor";

/** Lỗi field của 1 section (cast từ FieldErrors discriminated union). */
type SectionErrors = {
  title?: { message?: string };
  content?: { message?: string };
  items?: ({ message?: string } | undefined)[];
};

const SECTION_LABELS: Record<SchoolSection["type"], string> = {
  html: "HTML",
  list: "Danh sách",
  table: "Bảng",
};

function defaultSection(type: SchoolSection["type"], title = ""): SchoolSection {
  switch (type) {
    case "html":
      return { type: "html", title, content: "" };
    case "list":
      return { type: "list", title, items: [""] };
    case "table":
      return {
        type: "table",
        title,
        headers: ["Cột 1", "Cột 2"],
        rows: [{ "Cột 1": "", "Cột 2": "" }],
      };
  }
}

/** Tab 3 — Rich Content Builder cho JSONB content_sections (html/list/table). */
export function ContentBuilderTab() {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<SchoolEditFormValues>();

  const sections = useFieldArray({ control, name: "content_sections" });
  const values = watch("content_sections") ?? [];

  const p = (i: number, suffix: string) =>
    `content_sections.${i}.${suffix}` as FieldPath<SchoolEditFormValues>;

  const sectionErrors = (errors.content_sections ?? []) as (SectionErrors | undefined)[];

  return (
    <div className="space-y-4">
      {sections.fields.length === 0 && (
        <p className="rounded-md bg-slate-50 p-4 text-center text-sm text-slate-500">
          Chưa có section nào — thêm HTML / Danh sách / Bảng bên dưới.
        </p>
      )}

      {sections.fields.map((field, i) => {
        const section = values[i];
        if (!section) return null;
        const err = sectionErrors[i];
        return (
          <div key={field.id} className="rounded-lg border border-slate-200 p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                #{i + 1} · {SECTION_LABELS[section.type]}
              </span>
              <select
                value={section.type}
                onChange={(e) =>
                  sections.update(
                    i,
                    defaultSection(e.target.value as SchoolSection["type"], section.title)
                  )
                }
                aria-label={`Loại section ${i + 1}`}
                className="rounded-md border border-slate-300 px-2 py-1 text-xs focus:border-primary focus:outline-none"
              >
                {(Object.keys(SECTION_LABELS) as SchoolSection["type"][]).map((t) => (
                  <option key={t} value={t}>
                    {SECTION_LABELS[t]}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => sections.remove(i)}
                aria-label={`Xóa section ${i + 1}`}
                className="ml-auto text-slate-400 hover:text-accent"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <label htmlFor={`cs-title-${i}`} className={labelClasses}>Tiêu đề section *</label>
            <input
              id={`cs-title-${i}`}
              {...register(p(i, "title"))}
              placeholder="vd: Tổng quan, Học bổng, Yêu cầu đầu vào..."
              className={inputClasses}
            />
            <FieldErr message={err?.title?.message} />

            <div className="mt-2">
              {section.type === "html" && (
                <>
                  <textarea
                    rows={5}
                    {...register(p(i, "content"))}
                    placeholder="Nội dung HTML (tạm textarea — sẽ gắn Tiptap sau)"
                    aria-label={`Nội dung HTML section ${i + 1}`}
                    className={`${inputClasses} font-mono text-xs`}
                  />
                  <FieldErr message={err?.content?.message} />
                </>
              )}

              {section.type === "list" && (
                <div className="space-y-1.5">
                  {section.items.map((item, j) => (
                    <div key={j}>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400" aria-hidden>•</span>
                        <input
                          value={item}
                          onChange={(e) =>
                            setValue(p(i, `items.${j}`), e.target.value, { shouldDirty: true })
                          }
                          aria-label={`Mục ${j + 1} của section ${i + 1}`}
                          className={inputClasses}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setValue(
                              p(i, "items"),
                              section.items.filter((_, k) => k !== j),
                              { shouldDirty: true }
                            )
                          }
                          aria-label={`Xóa mục ${j + 1}`}
                          className="text-slate-400 hover:text-accent"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      <FieldErr message={err?.items?.[j]?.message} />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setValue(p(i, "items"), [...section.items, ""], { shouldDirty: true })
                    }
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"
                  >
                    <Plus className="h-3.5 w-3.5" aria-hidden /> Thêm mục
                  </button>
                </div>
              )}

              {section.type === "table" && <TableSectionEditor sectionIndex={i} />}
            </div>
          </div>
        );
      })}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => sections.append(defaultSection("html"))}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"
        >
          <Code className="h-3.5 w-3.5" aria-hidden /> Thêm section HTML
        </button>
        <button
          type="button"
          onClick={() => sections.append(defaultSection("list"))}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"
        >
          <List className="h-3.5 w-3.5" aria-hidden /> Thêm section Danh sách
        </button>
        <button
          type="button"
          onClick={() => sections.append(defaultSection("table"))}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"
        >
          <Table2 className="h-3.5 w-3.5" aria-hidden /> Thêm section Bảng
        </button>
      </div>
    </div>
  );
}
