"use client";

import { useState } from "react";
import { FormProvider, useForm, type DefaultValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import type { SchoolFormModalProps, SchoolRow } from "@/types";
import { schoolEditFormSchema, type SchoolEditFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/Button";
import { BasicInfoTab } from "./school-form/BasicInfoTab";
import { QuickFactsCostTab } from "./school-form/QuickFactsCostTab";
import { ContentBuilderTab } from "./school-form/ContentBuilderTab";
import { AutomationTab } from "./school-form/AutomationTab";

const TABS = [
  { key: "basic", label: "Tổng quan" },
  { key: "facts", label: "Quick Facts & Chi phí" },
  { key: "content", label: "Nội dung chi tiết" },
  { key: "automation", label: "Automation" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/** Field nào thuộc tab nào — để hiện chấm đỏ khi tab có lỗi validate. */
const TAB_FIELDS: Record<TabKey, (keyof SchoolEditFormValues)[]> = {
  basic: ["name", "slug", "country", "province", "level", "logo_url", "is_active"],
  facts: ["tuition_usd", "scholarship_up_to", "quick_facts", "cost_breakdown"],
  content: ["content_sections"],
  automation: ["official_rss_url", "auto_sync_enabled"],
};

function toDefaults(school: SchoolRow | null): DefaultValues<SchoolEditFormValues> {
  if (!school) {
    return {
      name: "",
      country: "",
      province: "",
      level: "dai-hoc",
      logo_url: "",
      is_active: true,
      scholarship_up_to: null,
      quick_facts: {},
      cost_breakdown: { currency: "", rows: [] },
      content_sections: [],
      auto_sync_enabled: false,
    };
  }
  return {
    name: school.name,
    slug: school.slug ?? undefined,
    country: school.country,
    province: school.province,
    level: school.level,
    logo_url: school.logo_url ?? "",
    is_active: school.is_active,
    tuition_usd: school.tuition_usd,
    scholarship_up_to: school.scholarship_up_to,
    quick_facts: school.quick_facts ?? {},
    cost_breakdown: school.cost_breakdown ?? { currency: "", rows: [] },
    content_sections: school.content_sections ?? [],
    official_rss_url: school.official_rss_url ?? undefined,
    auto_sync_enabled: school.auto_sync_enabled ?? false,
  };
}

/** quick_facts: bỏ field rỗng; toàn bộ rỗng → null (không lưu object trống vào JSONB). */
function cleanQuickFacts(qf: SchoolEditFormValues["quick_facts"]) {
  const entries = Object.entries(qf).filter(
    ([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0)
  );
  return entries.length > 0 ? Object.fromEntries(entries) : null;
}

/** cost_breakdown: không có hàng nào và không có totalEstimate → null. */
function cleanCostBreakdown(cb: SchoolEditFormValues["cost_breakdown"]) {
  return cb.rows.length === 0 && !cb.totalEstimate ? null : cb;
}

/**
 * Modal Thêm/Sửa trường v1.10.0 — 4 tab (rule 10: Advanced Admin CRUD).
 * Shell: chrome modal + tab nav + submit; field UI nằm trong school-form/*Tab.
 */
export function SchoolFormModal({ school, onClose, onSaved }: SchoolFormModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("basic");
  const [serverError, setServerError] = useState<string | null>(null);

  const methods = useForm<SchoolEditFormValues>({
    resolver: zodResolver(schoolEditFormSchema),
    defaultValues: toDefaults(school),
  });
  const {
    handleSubmit,
    formState: { errors, isSubmitting },
  } = methods;

  const tabHasError = (tab: TabKey) => TAB_FIELDS[tab].some((f) => f in errors);

  const onSubmit = async (data: SchoolEditFormValues) => {
    setServerError(null);
    try {
      const payload: Record<string, unknown> = {
        name: data.name,
        country: data.country,
        province: data.province,
        level: data.level,
        tuition_usd: data.tuition_usd,
        scholarship_up_to: data.scholarship_up_to,
        is_active: data.is_active,
        logo_url: data.logo_url,
        quick_facts: cleanQuickFacts(data.quick_facts),
        cost_breakdown: cleanCostBreakdown(data.cost_breakdown),
        content_sections: data.content_sections,
      };
      if (data.slug) payload.slug = data.slug;
      // Cột migration #9: chỉ gửi khi row đã có cột (sửa) hoặc user điền giá trị —
      // tránh lỗi column-not-exist khi cloud chưa apply migration
      const migration9Applied = school != null && school.auto_sync_enabled != null;
      if (data.official_rss_url || migration9Applied) {
        payload.official_rss_url = data.official_rss_url ?? "";
      }
      if (data.auto_sync_enabled || migration9Applied) {
        payload.auto_sync_enabled = data.auto_sync_enabled;
      }

      const response = await fetch(
        school ? `/api/admin/schools/${school.id}` : "/api/admin/schools",
        {
          method: school ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Không lưu được trường");
      }
      onSaved();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Lỗi mạng — thử lại.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
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

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4" aria-label="Tab chỉnh sửa trường">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {tabHasError(tab.key) && (
                <span
                  className="absolute right-0.5 top-2 h-1.5 w-1.5 rounded-full bg-accent"
                  aria-label="Tab có lỗi"
                />
              )}
            </button>
          ))}
        </nav>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <div className={activeTab === "basic" ? "" : "hidden"}><BasicInfoTab /></div>
              <div className={activeTab === "facts" ? "" : "hidden"}><QuickFactsCostTab /></div>
              <div className={activeTab === "content" ? "" : "hidden"}><ContentBuilderTab /></div>
              <div className={activeTab === "automation" ? "" : "hidden"}><AutomationTab /></div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              {serverError && (
                <p role="alert" className="mr-auto text-sm font-semibold text-accent">
                  {serverError}
                </p>
              )}
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                Lưu
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
