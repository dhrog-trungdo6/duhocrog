"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { EventRow } from "@/types";
import { Button } from "@/components/ui/Button";

const EMPTY_FORM = { title: "", description: "", starts_at: "", location: "", href: "#" };

export function EventsTab() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/events");
      if (!response.ok) throw new Error("Không tải được sự kiện");
      const payload = (await response.json()) as { events: EventRow[] };
      setEvents(payload.events);
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
      // datetime-local trả "YYYY-MM-DDTHH:mm" — chuẩn hóa sang ISO có timezone VN
      const startsAtIso = new Date(`${form.starts_at}:00+07:00`).toISOString();
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, starts_at: startsAtIso }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Không tạo được sự kiện");
      }
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi mạng — thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (event: EventRow) => {
    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !event.is_active }),
      });
      if (!response.ok) throw new Error();
      await load();
    } catch {
      setError("Không cập nhật được — thử lại.");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Xóa vĩnh viễn sự kiện này?")) return;
    try {
      const response = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      await load();
    } catch {
      setError("Không xóa được — thử lại.");
    }
  };

  const inputClasses =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none";

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_1fr]">
      {/* Form thêm sự kiện */}
      <form onSubmit={handleCreate} className="h-fit rounded-lg bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-bold text-slate-800">Thêm sự kiện mới</h2>
        <div className="space-y-3">
          <input
            required
            placeholder="Tiêu đề *"
            aria-label="Tiêu đề sự kiện"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className={inputClasses}
          />
          <textarea
            placeholder="Mô tả ngắn"
            aria-label="Mô tả sự kiện"
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className={inputClasses}
          />
          <input
            required
            type="datetime-local"
            aria-label="Thời gian diễn ra"
            value={form.starts_at}
            onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
            className={inputClasses}
          />
          <input
            placeholder="Địa điểm"
            aria-label="Địa điểm"
            value={form.location}
            onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            className={inputClasses}
          />
          <input
            placeholder="Link chi tiết (mặc định #)"
            aria-label="Link chi tiết"
            value={form.href}
            onChange={(e) => setForm((f) => ({ ...f, href: e.target.value }))}
            className={inputClasses}
          />
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Plus className="h-4 w-4" aria-hidden />
            )}
            Thêm sự kiện
          </Button>
        </div>
      </form>

      {/* Danh sách */}
      <div>
        {error && (
          <p role="alert" className="mb-3 text-sm font-semibold text-accent">
            {error}
          </p>
        )}
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-white py-16 text-slate-500 shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> Đang tải...
          </div>
        ) : events.length === 0 ? (
          <p className="rounded-lg bg-white py-16 text-center text-slate-500 shadow-sm">
            Chưa có sự kiện nào trong database — thêm bằng form bên trái.
            <br />
            <span className="text-xs">
              (Trang chủ sẽ fallback về dữ liệu mẫu khi database trống)
            </span>
          </p>
        ) : (
          <ul className="space-y-3">
            {events.map((event) => (
              <li
                key={event.id}
                className={`flex items-start justify-between gap-4 rounded-lg bg-white p-4 shadow-sm ${
                  event.is_active ? "" : "opacity-50"
                }`}
              >
                <div>
                  <h3 className="font-bold text-slate-800">{event.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {new Date(event.starts_at).toLocaleString("vi-VN", {
                      timeZone: "Asia/Ho_Chi_Minh",
                    })}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                  {event.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">{event.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleActive(event)}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      event.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {event.is_active ? "Đang hiện" : "Đang ẩn"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(event.id)}
                    aria-label={`Xóa ${event.title}`}
                    className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-accent"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
