"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { DatabaseZap, Loader2, Plus } from "lucide-react";
import type { SchoolRow, StudyLevel } from "@/types";
import { STUDY_LEVEL_LABELS } from "@/types";
import { destinations, provinces } from "@/data/destinations";
import { Button } from "@/components/ui/Button";

const EMPTY_FORM = {
  name: "",
  country: "",
  province: "",
  level: "dai-hoc" as StudyLevel,
  tuition_usd: "",
  scholarship_up_to: "",
};

export function SchoolsTab() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const provinceOptions = useMemo(
    () => provinces.filter((p) => p.countryCode === form.country),
    [form.country]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/schools");
      if (!response.ok) throw new Error("Không tải được danh sách trường");
      const payload = (await response.json()) as { schools: SchoolRow[] };
      setSchools(payload.schools);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi mạng — thử tải lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          country: form.country,
          province: form.province,
          level: form.level,
          tuition_usd: Number(form.tuition_usd),
          scholarship_up_to: form.scholarship_up_to ? Number(form.scholarship_up_to) : null,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Không tạo được trường");
      }
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi mạng — thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const seed = async () => {
    setSeeding(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seed: true }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { error?: string; inserted?: number }
        | null;
      if (!response.ok) throw new Error(payload?.error ?? "Seed thất bại");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi mạng — thử lại.");
    } finally {
      setSeeding(false);
    }
  };

  const toggleActive = async (school: SchoolRow) => {
    try {
      const response = await fetch(`/api/admin/schools/${school.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !school.is_active }),
      });
      if (!response.ok) throw new Error();
      await load();
    } catch {
      setError("Không cập nhật được — thử lại.");
    }
  };

  const inputClasses =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
      {/* Form thêm trường */}
      <form onSubmit={handleCreate} className="h-fit rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold text-slate-800">Thêm trường mới</h2>
        <div className="space-y-3">
          <input
            required
            placeholder="Tên trường *"
            aria-label="Tên trường"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className={inputClasses}
          />
          <select
            required
            aria-label="Quốc gia"
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value, province: "" }))}
            className={inputClasses}
          >
            <option value="">— Quốc gia * —</option>
            {destinations.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name.replace("Du học ", "")}
              </option>
            ))}
          </select>
          <select
            required
            aria-label="Tỉnh bang / thành phố"
            value={form.province}
            onChange={(e) => setForm((f) => ({ ...f, province: e.target.value }))}
            disabled={!form.country}
            className={`${inputClasses} disabled:opacity-50`}
          >
            <option value="">— Tỉnh bang/Thành phố * —</option>
            {provinceOptions.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            aria-label="Bậc học"
            value={form.level}
            onChange={(e) => setForm((f) => ({ ...f, level: e.target.value as StudyLevel }))}
            className={inputClasses}
          >
            {(Object.entries(STUDY_LEVEL_LABELS) as [StudyLevel, string][]).map(([v, label]) => (
              <option key={v} value={v}>
                {label}
              </option>
            ))}
          </select>
          <input
            required
            type="number"
            min={0}
            placeholder="Học phí USD/năm *"
            aria-label="Học phí USD mỗi năm"
            value={form.tuition_usd}
            onChange={(e) => setForm((f) => ({ ...f, tuition_usd: e.target.value }))}
            className={inputClasses}
          />
          <input
            type="number"
            min={0}
            max={100}
            placeholder="% học bổng tối đa (bỏ trống nếu không)"
            aria-label="Phần trăm học bổng tối đa"
            value={form.scholarship_up_to}
            onChange={(e) => setForm((f) => ({ ...f, scholarship_up_to: e.target.value }))}
            className={inputClasses}
          />
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            Thêm trường
          </Button>
        </div>
      </form>

      {/* Danh sách */}
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => void seed()} disabled={seeding}>
            {seeding ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <DatabaseZap className="h-4 w-4" aria-hidden />
            )}
            Seed 22 trường mẫu (khi bảng trống)
          </Button>
          {error && (
            <p role="alert" className="text-sm font-semibold text-accent">
              {error}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-white py-16 text-slate-500 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Đang tải...
          </div>
        ) : schools.length === 0 ? (
          <p className="rounded-lg bg-white py-16 text-center text-slate-500 shadow-sm">
            Bảng schools trống — bấm &quot;Seed 22 trường mẫu&quot; hoặc thêm thủ công.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                  <th className="px-4 py-3">Trường</th>
                  <th className="px-4 py-3">Quốc gia</th>
                  <th className="px-4 py-3">Bậc học</th>
                  <th className="px-4 py-3">Học phí/năm</th>
                  <th className="px-4 py-3">Học bổng</th>
                  <th className="px-4 py-3">Hiển thị</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr
                    key={school.id}
                    className={`border-b last:border-0 hover:bg-slate-50 ${
                      school.is_active ? "" : "opacity-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-800">{school.name}</td>
                    <td className="px-4 py-3">
                      {destinations
                        .find((c) => c.code === school.country)
                        ?.name.replace("Du học ", "") ?? school.country}
                    </td>
                    <td className="px-4 py-3">{STUDY_LEVEL_LABELS[school.level]}</td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      ${school.tuition_usd.toLocaleString("en-US")}
                    </td>
                    <td className="px-4 py-3">
                      {school.scholarship_up_to !== null ? (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-bold text-accent">
                          đến {school.scholarship_up_to}%
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => void toggleActive(school)}
                        aria-label={`${school.is_active ? "Ẩn" : "Hiện"} ${school.name}`}
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          school.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {school.is_active ? "Đang hiện" : "Đang ẩn"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
