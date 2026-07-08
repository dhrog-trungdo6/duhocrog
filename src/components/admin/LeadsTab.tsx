"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import {
  Download,
  Loader2,
  Phone,
  RefreshCw,
  Search,
  StickyNote,
} from "lucide-react";
import type { LeadRow, LeadStatus } from "@/types";
import { LEAD_STATUS_LABELS } from "@/types";
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

const PAGE_SIZE = 20;
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
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState(""); // giá trị đã submit — trigger gọi API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Ghi chú chăm sóc: 1 dòng mở tại 1 thời điểm
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [exporting, setExporting] = useState(false);

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
      const response = await fetch(`/api/leads?${buildParams(page, PAGE_SIZE)}`);
      if (!response.ok) throw new Error("Không tải được danh sách leads");
      const payload = (await response.json()) as { leads: LeadRow[]; total: number };
      setLeads(payload.leads);
      setTotal(payload.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi mạng — thử tải lại.");
    } finally {
      setLoading(false);
    }
  }, [page, buildParams]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStatus = async (id: string, status: LeadStatus) => {
    const previous = leads;
    setLeads((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error();
    } catch {
      setLeads(previous); // rollback optimistic update
      setError("Không cập nhật được trạng thái — thử lại.");
    }
  };

  const toggleNote = (lead: LeadRow) => {
    if (expandedId === lead.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(lead.id);
    setNoteDraft(lead.note ?? "");
  };

  const saveNote = async (id: string) => {
    setSavingNote(true);
    setError(null);
    try {
      const response = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: noteDraft }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Không lưu được ghi chú — thử lại.");
      }
      setLeads((rows) => rows.map((r) => (r.id === id ? { ...r, note: noteDraft } : r)));
      setExpandedId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không lưu được ghi chú — thử lại.");
    } finally {
      setSavingNote(false);
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

  const statusCounts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-2xl font-extrabold text-primary">{total}</p>
          <p className="text-xs font-semibold uppercase text-slate-500">Tổng leads</p>
        </div>
        {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
          <div key={s} className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-2xl font-extrabold text-slate-700">{statusCounts[s] ?? 0}</p>
            <p className="text-xs font-semibold uppercase text-slate-500">
              {LEAD_STATUS_LABELS[s]} (trang này)
            </p>
          </div>
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

      {/* Table */}
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
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Họ tên</th>
                <th className="px-4 py-3">SĐT</th>
                <th className="px-4 py-3">Quốc gia</th>
                <th className="px-4 py-3">Nguồn</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <Fragment key={lead.id}>
                  <tr className="border-b last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">{formatTime(lead.created_at)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{lead.full_name}</td>
                    <td className="px-4 py-3">
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1 font-semibold text-primary hover:underline"
                      >
                        <Phone className="h-3.5 w-3.5" aria-hidden />
                        {lead.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3">{countryName(lead.country_interest)}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {SOURCE_LABELS[lead.source] ?? lead.source}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`Trạng thái của ${lead.full_name}`}
                        value={lead.status}
                        onChange={(e) => void updateStatus(lead.id, e.target.value as LeadStatus)}
                        className={`rounded-full border-0 px-2.5 py-1 text-xs font-bold ${STATUS_COLORS[lead.status]}`}
                      >
                        {(Object.keys(LEAD_STATUS_LABELS) as LeadStatus[]).map((s) => (
                          <option key={s} value={s}>
                            {LEAD_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleNote(lead)}
                        aria-expanded={expandedId === lead.id}
                        aria-label={`Ghi chú của ${lead.full_name}`}
                        className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold ${
                          lead.note
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                            : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        }`}
                      >
                        <StickyNote className="h-3.5 w-3.5" aria-hidden />
                        {lead.note ? "Xem/Sửa" : "Thêm"}
                      </button>
                    </td>
                  </tr>
                  {expandedId === lead.id && (
                    <tr className="border-b bg-amber-50/50">
                      <td colSpan={7} className="px-4 py-3">
                        <label
                          htmlFor={`note-${lead.id}`}
                          className="mb-1 block text-xs font-bold uppercase text-slate-500"
                        >
                          Ghi chú chăm sóc — {lead.full_name}
                        </label>
                        <textarea
                          id={`note-${lead.id}`}
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          maxLength={2000}
                          rows={3}
                          placeholder="VD: Đã gọi 2 lần chưa nghe máy; quan tâm học bổng Canada; hẹn tư vấn thứ 5..."
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary"
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void saveNote(lead.id)}
                            disabled={savingNote}
                            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-light disabled:opacity-50"
                          >
                            {savingNote && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                            )}
                            Lưu ghi chú
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedId(null)}
                            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            Hủy
                          </button>
                          <span className="text-xs text-slate-400">
                            {noteDraft.length}/2000
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
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
            Trang {page}/{totalPages}
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
  );
}
