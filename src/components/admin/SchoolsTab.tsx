"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DatabaseZap, Loader2, Pencil, Plus, Search } from "lucide-react";
import type { SchoolRow } from "@/types";
import { STUDY_LEVEL_LABELS } from "@/types";
import { destinations, provinces } from "@/data/destinations";
import { Button } from "@/components/ui/Button";
import { SchoolFormModal } from "./SchoolFormModal";

function countryLabel(code: string): string {
  return destinations.find((c) => c.code === code)?.name.replace("Du học ", "") ?? code;
}

function provinceLabel(code: string): string {
  return provinces.find((p) => p.code === code)?.name ?? code;
}

export function SchoolsTab() {
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [search, setSearch] = useState("");
  /** null = đóng modal; "new" = thêm mới; SchoolRow = sửa */
  const [modal, setModal] = useState<SchoolRow | "new" | null>(null);

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return schools;
    return schools.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        countryLabel(s.country).toLowerCase().includes(q) ||
        provinceLabel(s.province).toLowerCase().includes(q)
    );
  }, [schools, search]);

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

  return (
    <div>
      {/* Thanh công cụ: tìm kiếm + thêm mới + seed */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Tìm tên trường, quốc gia, tỉnh bang..."
            aria-label="Tìm kiếm trường"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <Button size="sm" onClick={() => setModal("new")}>
          <Plus className="h-4 w-4" aria-hidden />
          Thêm trường mới
        </Button>
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
          Bảng schools trống — bấm &quot;Seed 22 trường mẫu&quot; hoặc &quot;Thêm trường mới&quot;.
        </p>
      ) : (
        <>
          <p className="mb-2 text-sm text-slate-500">
            {filtered.length}/{schools.length} trường
            {search.trim() ? ` khớp “${search.trim()}”` : ""}
          </p>
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            <table className="w-full min-w-[780px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                  <th className="px-4 py-3">Trường</th>
                  <th className="px-4 py-3">Quốc gia</th>
                  <th className="px-4 py-3">Tỉnh/Bang</th>
                  <th className="px-4 py-3">Bậc học</th>
                  <th className="px-4 py-3">Học phí/năm</th>
                  <th className="px-4 py-3">Học bổng</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((school) => (
                  <tr
                    key={school.id}
                    className={`border-b last:border-0 hover:bg-slate-50 ${
                      school.is_active ? "" : "opacity-50"
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-800">{school.name}</td>
                    <td className="px-4 py-3">{countryLabel(school.country)}</td>
                    <td className="px-4 py-3">{provinceLabel(school.province)}</td>
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
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setModal(school)}
                        aria-label={`Sửa ${school.name}`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-primary hover:text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {modal !== null && (
        <SchoolFormModal
          school={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null);
            void load();
          }}
        />
      )}
    </div>
  );
}
