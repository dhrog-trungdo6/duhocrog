"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Download,
  Loader2,
  Mail,
  MessageSquare,
  MousePointerClick,
  Phone,
  RefreshCw,
  Search,
  StickyNote,
} from "lucide-react";
import type { ActivityType, LeadActivity, LeadRow, LeadStatus } from "@/types";
import { ACTIVITY_TYPE_LABELS, LEAD_STATUS_LABELS } from "@/types";
import { destinations } from "@/data/destinations";

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  consulting: "bg-purple-100 text-purple-700",
  converted: "bg-green-100 text-green-700",
  lost: "bg-slate-200 text-slate-500",
};

const SOURCE_LABELS: Record<string, string> = {
  homepage_form: "Form trang chủ",
  floating_cta: "Nút CTA nổi",
  footer_newsletter: "Footer newsletter",
};

const ACTIVITY_ICONS: Record<ActivityType, typeof StickyNote> = {
  note: StickyNote,
  call: Phone,
  email: Mail,
  status_change: RefreshCw,
  other: MessageSquare,
};

// Loại nhập tay từ panel — status_change do server tự ghi khi đổi trạng thái
const MANUAL_ACTIVITY_TYPES: ActivityType[] = ["note", "call", "email", "other"];

const PAGE_SIZE = 15;
const EXPORT_PAGE_SIZE = 100;
const EXPORT_MAX_PAGES = 20; // chặn tối đa 2.000 dòng / lần xuất

function countryName(code: string): string {
  return destinations.find((c) => c.code === code)?.name.replace("Du học ", "") ?? code;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Escape 1 ô CSV: bọc ngoặc kép, nhân đôi ngoặc kép bên trong. */
function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function LeadsTab() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState(""); // giá trị đã submit — trigger gọi API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Panel chi tiết (mẫu CRM Nam Ngân): chọn 1 lead → ghi chú ghim + nhật ký chăm sóc
  const [selected, setSelected] = useState<LeadRow | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [actType, setActType] = useState<ActivityType>("note");
  const [actContent, setActContent] = useState("");
  const [savingActivity, setSavingActivity] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);

  const buildParams = useCallback(
    (pageNum: number, limit: number) => {
      const params = new URLSearchParams({ page: String(pageNum), limit: String(limit) });
      if (statusFilter) params.set("status", statusFilter);
      if (sourceFilter) params.set("source", sourceFilter);
      if (query) params.set("q", query);
      return params;
    },
    [statusFilter, sourceFilter, query]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = buildParams(page, PAGE_SIZE);
      params.set("withCounts", "1");
      const response = await fetch(`/api/leads?${params}`);
      if (!response.ok) throw new Error("Không tải được danh sách leads");
      const payload = (await response.json()) as {
        leads: LeadRow[];
        total: number;
        statusCounts?: Record<string, number>;
      };
      setLeads(payload.leads);
      setTotal(payload.total);
      if (payload.statusCounts) setStatusCounts(payload.statusCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi mạng — thử tải lại.");
    } finally {
      setLoading(false);
    }
  }, [page, buildParams]);

  useEffect(() => {
    void load();
  }, [load]);

  const fetchActivities = useCallback(async (leadId: string) => {
    setActivitiesLoading(true);
    setActivitiesError(null);
    try {
      const response = await fetch(`/api/leads/${leadId}/activities`);
      const payload = (await response.json().catch(() => null)) as {
        activities?: LeadActivity[];
        error?: string;
      } | null;
      if (!response.ok) throw new Error(payload?.error ?? "Không tải được nhật ký");
      setActivities(payload?.activities ?? []);
    } catch (err) {
      setActivities([]);
      setActivitiesError(err instanceof Error ? err.message : "Không tải được nhật ký");
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  const selectLead = (lead: LeadRow) => {
    setSelected(lead);
    setNoteDraft(lead.note ?? "");
    setPanelError(null);
    setActContent("");
    void fetchActivities(lead.id);
  };

  const updateStatus = async (id: string, status: LeadStatus) => {
    const previous = leads;
    const previousSelected = selected;
    setLeads((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
    if (selected?.id === id) setSelected({ ...selected, status });
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error();
      // Server tự ghi nhật ký status_change → refresh timeline + số liệu dashboard
      if (previousSelected?.id === id) void fetchActivities(id);
      void load();
    } catch {
      setLeads(previous); // rollback optimistic update
      setSelected(previousSelected);
      setError("Không cập nhật được trạng thái — thử lại.");
    }
  };

  const saveNote = async () => {
    if (!selected) return;
    setSavingNote(true);
    setPanelError(null);
    try {
      const response = await fetch(`/api/leads/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteDraft }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Không lưu được ghi chú — thử lại.");
      }
      setLeads((rows) =>
        rows.map((r) => (r.id === selected.id ? { ...r, note: noteDraft } : r))
      );
      setSelected({ ...selected, note: noteDraft });
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "Không lưu được ghi chú — thử lại.");
    } finally {
      setSavingNote(false);
    }
  };

  const addActivity = async () => {
    if (!selected || !actContent.trim()) return;
    setSavingActivity(true);
    setPanelError(null);
    try {
      const response = await fetch(`/api/leads/${selected.id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_type: actType, content: actContent.trim() }),
      });
      const payload = (await response.json().catch(() => null)) as {
        activity?: LeadActivity;
        error?: string;
      } | null;
      if (!response.ok || !payload?.activity) {
        throw new Error(payload?.error ?? "Không lưu được nhật ký — thử lại.");
      }
      const saved = payload.activity;
      setActivities((list) => [saved, ...list]);
      setActContent("");
    } catch (err) {
      setPanelError(err instanceof Error ? err.message : "Không lưu được nhật ký — thử lại.");
    } finally {
      setSavingActivity(false);
    }
  };

  /** Xuất toàn bộ leads theo filter hiện tại ra file CSV (mở được bằng Excel — có BOM UTF-8). */
  const exportCsv = async () => {
    setExporting(true);
    setError(null);
    try {
      const rows: LeadRow[] = [];
      let expected = Infinity;
      for (let p = 1; p <= EXPORT_MAX_PAGES && rows.length < expected; p++) {
        const response = await fetch(`/api/leads?${buildParams(p, EXPORT_PAGE_SIZE)}`);
        if (!response.ok) throw new Error("Không tải được dữ liệu để xuất file");
        const payload = (await response.json()) as { leads: LeadRow[]; total: number };
        expected = payload.total;
        rows.push(...payload.leads);
        if (payload.leads.length < EXPORT_PAGE_SIZE) break;
      }

      const header = ["Thời gian", "Họ tên", "SĐT", "Quốc gia", "Nguồn", "Trạng thái", "Ghi chú"];
      const lines = [
        header.map(csvCell).join(","),
        ...rows.map((l) =>
          [
            formatTime(l.created_at),
            l.full_name,
            l.phone,
            countryName(l.country_interest),
            SOURCE_LABELS[l.source] ?? l.source,
            LEAD_STATUS_LABELS[l.status],
            l.note ?? "",
          ]
            .map(csvCell)
            .join(",")
        ),
      ];
      // BOM để Excel nhận UTF-8 tiếng Việt
      const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rog-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không xuất được file — thử lại.");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const totalAll = Object.values(statusCounts).reduce((sum, n) => sum + n, 0);

  return (
    <div>
      {/* Stats — đếm toàn cục từ DB, click để lọc nhanh theo trạng thái */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-2xl font-extrabold text-primary">{totalAll || total}</p>
          <p className="text-xs font-semibold uppercase text-slate-500">Tổng leads</p>
        </div>
        {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
          <button
            type="button"
            key={s}
            onClick={() => {
              setPage(1);
              setStatusFilter(statusFilter === s ? "" : s);
            }}
            className={`rounded-lg bg-white p-4 text-left shadow-sm transition-shadow hover:shadow ${
              statusFilter === s ? "ring-2 ring-primary" : ""
            }`}
          >
            <p className="text-2xl font-extrabold text-slate-700">{statusCounts[s] ?? 0}</p>
            <p className="text-xs font-semibold uppercase text-slate-500">
              {LEAD_STATUS_LABELS[s]}
            </p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setQuery(searchInput.trim());
          }}
          className="flex items-center overflow-hidden rounded-md border border-slate-300 bg-white"
        >
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm tên hoặc SĐT..."
            aria-label="Tìm kiếm lead theo tên hoặc số điện thoại"
            className="w-44 px-3 py-2 text-sm outline-none sm:w-56"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="border-l border-slate-200 px-3 py-2 text-slate-500 hover:bg-slate-50 hover:text-primary"
          >
            <Search className="h-4 w-4" aria-hidden />
          </button>
        </form>
        <select
          aria-label="Lọc theo trạng thái"
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
            <option key={s} value={s}>
              {LEAD_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          aria-label="Lọc theo nguồn"
          value={sourceFilter}
          onChange={(e) => {
            setPage(1);
            setSourceFilter(e.target.value);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value="">Tất cả nguồn</option>
          {Object.entries(SOURCE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void load()}
          className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Tải lại
        </button>
        <button
          type="button"
          onClick={() => void exportCsv()}
          disabled={exporting || total === 0}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-light disabled:opacity-50"
        >
          {exporting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Download className="h-4 w-4" aria-hidden />
          )}
          Xuất Excel (CSV)
        </button>
        {error && (
          <p role="alert" className="text-sm font-semibold text-accent">
            {error}
          </p>
        )}
      </div>

      {/* 2 cột theo mẫu CRM Nam Ngân: bảng leads + panel chi tiết */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ── Cột trái: bảng + pagination ── */}
        <div className="lg:col-span-2">
          <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Đang tải...
              </div>
            ) : leads.length === 0 ? (
              <p className="py-16 text-center text-slate-500">
                {query || statusFilter || sourceFilter
                  ? "Không tìm thấy lead nào khớp bộ lọc."
                  : "Chưa có lead nào."}
              </p>
            ) : (
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                    <th className="px-4 py-3">Khách hàng</th>
                    <th className="px-4 py-3">Quốc gia</th>
                    <th className="px-4 py-3">Nguồn</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="hidden px-4 py-3 xl:table-cell">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      onClick={() => selectLead(lead)}
                      className={`cursor-pointer border-b last:border-0 hover:bg-slate-50 ${
                        selected?.id === lead.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                          {lead.full_name}
                          {lead.note && (
                            <StickyNote
                              className="h-3.5 w-3.5 shrink-0 text-amber-500"
                              aria-label="Có ghi chú"
                            />
                          )}
                        </p>
                        <p className="text-xs text-slate-500">{lead.phone}</p>
                      </td>
                      <td className="px-4 py-3">{countryName(lead.country_interest)}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {SOURCE_LABELS[lead.source] ?? lead.source}
                      </td>
                      {/* stopPropagation: đổi trạng thái không trigger chọn lead */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          aria-label={`Trạng thái của ${lead.full_name}`}
                          value={lead.status}
                          onChange={(e) =>
                            void updateStatus(lead.id, e.target.value as LeadStatus)
                          }
                          className={`rounded-full border-0 px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[lead.status]}`}
                        >
                          {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {LEAD_STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-slate-400 xl:table-cell">
                        {formatTime(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold disabled:opacity-40"
              >
                ← Trước
              </button>
              <span className="text-slate-600">
                Trang {page}/{totalPages} — {total} leads
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold disabled:opacity-40"
              >
                Sau →
              </button>
            </div>
          )}
        </div>

        {/* ── Cột phải: chi tiết + ghi chú ghim + nhật ký chăm sóc ── */}
        <div className="lg:col-span-1">
          <div className="min-h-[400px] rounded-lg bg-white shadow-sm lg:sticky lg:top-4">
            {!selected ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-slate-400">
                <MousePointerClick className="h-8 w-8" aria-hidden />
                <p>Chọn khách hàng để xem chi tiết</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 p-4">
                {/* Header thông tin khách */}
                <div>
                  <h3 className="text-base font-bold text-slate-800">{selected.full_name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {countryName(selected.country_interest)} ·{" "}
                    {SOURCE_LABELS[selected.source] ?? selected.source} ·{" "}
                    {formatTime(selected.created_at)}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <a
                      href={`tel:${selected.phone}`}
                      className="flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden />
                      {selected.phone}
                    </a>
                    <a
                      href={`https://zalo.me/${selected.phone.replace(/^\+84/, "0")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-light"
                    >
                      <MessageSquare className="h-3.5 w-3.5" aria-hidden />
                      Zalo
                    </a>
                    <select
                      aria-label="Trạng thái"
                      value={selected.status}
                      onChange={(e) =>
                        void updateStatus(selected.id, e.target.value as LeadStatus)
                      }
                      className={`rounded-full border-0 px-2.5 py-1.5 text-xs font-bold ${STATUS_COLORS[selected.status]}`}
                    >
                      {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {LEAD_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {panelError && (
                  <p role="alert" className="text-xs font-semibold text-accent">
                    {panelError}
                  </p>
                )}

                {/* Ghi chú ghim (cột leads.note) */}
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Ghi chú ghim
                  </p>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    maxLength={2000}
                    rows={2}
                    placeholder="Thông tin cố định: nguyện vọng, ngân sách, hồ sơ..."
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => void saveNote()}
                    disabled={savingNote || noteDraft === (selected.note ?? "")}
                    className="mt-1.5 flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    {savingNote && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                    Lưu ghi chú
                  </button>
                </div>

                {/* Thêm nhật ký chăm sóc */}
                <div>
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Thêm nhật ký
                  </p>
                  <div className="flex gap-2">
                    <select
                      aria-label="Loại tương tác"
                      value={actType}
                      onChange={(e) => setActType(e.target.value as ActivityType)}
                      className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs font-semibold"
                    >
                      {MANUAL_ACTIVITY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {ACTIVITY_TYPE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={actContent}
                      onChange={(e) => setActContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") void addActivity();
                      }}
                      maxLength={2000}
                      placeholder="Kết quả cuộc gọi, nội dung tư vấn..."
                      className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void addActivity()}
                    disabled={savingActivity || !actContent.trim()}
                    className="mt-1.5 flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-light disabled:opacity-40"
                  >
                    {savingActivity && (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    )}
                    Lưu nhật ký
                  </button>
                </div>

                {/* Timeline nhật ký */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Nhật ký chăm sóc
                  </p>
                  {activitiesLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" aria-hidden />
                    </div>
                  ) : activitiesError ? (
                    <p className="py-2 text-xs text-accent">{activitiesError}</p>
                  ) : activities.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-400">
                      Chưa có nhật ký nào.
                    </p>
                  ) : (
                    <div className="flex max-h-72 flex-col gap-2.5 overflow-y-auto pr-1">
                      {activities.map((act) => {
                        const Icon = ACTIVITY_ICONS[act.action_type] ?? MessageSquare;
                        return (
                          <div key={act.id} className="flex gap-2 text-xs">
                            <Icon
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                              aria-label={ACTIVITY_TYPE_LABELS[act.action_type] ?? act.action_type}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="break-words text-slate-700">{act.content}</p>
                              <p className="mt-0.5 text-slate-400">
                                {act.staff_name} · {formatTime(act.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
