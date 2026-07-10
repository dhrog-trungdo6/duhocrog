"use client";

import { useFormContext, type FieldPath } from "react-hook-form";
import { Plus, Trash2, X } from "lucide-react";
import type { TableRow } from "@/types";
import type { SchoolEditFormValues } from "@/lib/validations";
import { FieldErr, inputClasses } from "./ui";

/** Lỗi field của 1 table section (cast từ FieldErrors union). */
type TableErrors = { headers?: ({ message?: string } | undefined)[] };

/**
 * Editor bảng động cho TableSection (rows = Record<header, value>).
 * Không dùng dot-path cho key động (tên cột có thể chứa ".") —
 * mọi thay đổi cell/cột ghi qua setValue cả object/array.
 */
export function TableSectionEditor({ sectionIndex }: { sectionIndex: number }) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<SchoolEditFormValues>();

  const p = (suffix: string) =>
    `content_sections.${sectionIndex}.${suffix}` as FieldPath<SchoolEditFormValues>;

  const headers = (watch(p("headers")) as string[] | undefined) ?? [];
  const rows = (watch(p("rows")) as TableRow[] | undefined) ?? [];
  const tableErrors = errors.content_sections?.[sectionIndex] as TableErrors | undefined;

  const setDirty = { shouldDirty: true } as const;

  const renameHeader = (hIdx: number, newName: string) => {
    const oldName = headers[hIdx];
    const nextHeaders = headers.map((h, i) => (i === hIdx ? newName : h));
    const nextRows = rows.map((row) => {
      const { [oldName]: value, ...rest } = row;
      return { ...rest, [newName]: value ?? "" };
    });
    setValue(p("headers"), nextHeaders, setDirty);
    setValue(p("rows"), nextRows, setDirty);
  };

  const addColumn = () => {
    let name = `Cột ${headers.length + 1}`;
    while (headers.includes(name)) name = `${name}*`;
    setValue(p("headers"), [...headers, name], setDirty);
    setValue(p("rows"), rows.map((row) => ({ ...row, [name]: "" })), setDirty);
  };

  const removeColumn = (hIdx: number) => {
    const name = headers[hIdx];
    setValue(p("headers"), headers.filter((_, i) => i !== hIdx), setDirty);
    setValue(
      p("rows"),
      rows.map((row) => {
        const { [name]: _removed, ...rest } = row;
        return rest;
      }),
      setDirty
    );
  };

  const addRow = () => {
    const empty: TableRow = Object.fromEntries(headers.map((h) => [h, ""]));
    setValue(p("rows"), [...rows, empty], setDirty);
  };

  const removeRow = (rIdx: number) =>
    setValue(p("rows"), rows.filter((_, i) => i !== rIdx), setDirty);

  const setCell = (rIdx: number, header: string, value: string) =>
    setValue(
      p("rows"),
      rows.map((row, i) => (i === rIdx ? { ...row, [header]: value } : row)),
      setDirty
    );

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr>
              {headers.map((header, h) => (
                <th key={h} className="p-1 align-top">
                  <div className="flex items-center gap-1">
                    <input
                      value={header}
                      onChange={(e) => renameHeader(h, e.target.value)}
                      aria-label={`Tên cột ${h + 1}`}
                      className={`${inputClasses} font-semibold`}
                    />
                    <button
                      type="button"
                      onClick={() => removeColumn(h)}
                      aria-label={`Xóa cột ${header}`}
                      className="text-slate-400 hover:text-accent"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                  <FieldErr message={tableErrors?.headers?.[h]?.message} />
                </th>
              ))}
              <th className="w-8 p-1" aria-hidden />
            </tr>
          </thead>
          <tbody>
            {rows.map((row, r) => (
              <tr key={r}>
                {headers.map((header) => (
                  <td key={header} className="p-1">
                    <input
                      value={row[header] ?? ""}
                      onChange={(e) => setCell(r, header, e.target.value)}
                      aria-label={`${header} — hàng ${r + 1}`}
                      className={inputClasses}
                    />
                  </td>
                ))}
                <td className="p-1">
                  <button
                    type="button"
                    onClick={() => removeRow(r)}
                    aria-label={`Xóa hàng ${r + 1}`}
                    className="text-slate-400 hover:text-accent"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden /> Thêm hàng
        </button>
        <button
          type="button"
          onClick={addColumn}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden /> Thêm cột
        </button>
      </div>
    </div>
  );
}
