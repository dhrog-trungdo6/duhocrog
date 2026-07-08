"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CalendarX2, MapPin } from "lucide-react";
import type { EventItem } from "@/types";
import { events } from "@/data/events";

type TabKey = "upcoming" | "past";

const TABS: { key: TabKey; label: string }[] = [
  { key: "upcoming", label: "Sự kiện sắp diễn ra" },
  { key: "past", label: "Sự kiện đã diễn ra" },
];

function formatEventDate(iso: string): string {
  return new Date(iso).toLocaleString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

function EventCard({ event }: { event: EventItem }) {
  return (
    <li>
      <a
        href={event.href}
        className="group flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
      >
        <h3 className="font-bold leading-snug text-slate-800 transition-colors group-hover:text-primary">
          {event.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
          {event.description}
        </p>
        <div className="mt-4 space-y-1.5 text-xs text-slate-500">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary" aria-hidden />
            <time dateTime={event.startsAt}>{formatEventDate(event.startsAt)}</time>
          </p>
          <p className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden />
            {event.location}
          </p>
        </div>
      </a>
    </li>
  );
}

/** Tabs "Sự kiện sắp diễn ra / đã diễn ra" — status derive từ startsAt, có empty state. */
export function EventsTabs() {
  const [tab, setTab] = useState<TabKey>("upcoming");

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const upcomingList: EventItem[] = [];
    const pastList: EventItem[] = [];
    for (const event of events) {
      (new Date(event.startsAt).getTime() >= now ? upcomingList : pastList).push(event);
    }
    // Sắp diễn ra: gần nhất trước; đã diễn ra: mới nhất trước
    upcomingList.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
    pastList.sort((a, b) => b.startsAt.localeCompare(a.startsAt));
    return { upcoming: upcomingList, past: pastList };
  }, []);

  const visible = tab === "upcoming" ? upcoming : past;

  return (
    <section className="bg-white py-14" aria-label="Sự kiện du học">
      <div className="mx-auto max-w-7xl px-4">
        {/* Tab header — kiểu khối chữ nhật giống mẫu */}
        <div role="tablist" aria-label="Bộ lọc sự kiện" className="mb-8 flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-3 text-sm font-bold transition-colors ${
                tab === t.key
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <div className="py-10 text-center">
            <CalendarX2 className="mx-auto h-10 w-10 text-slate-300" aria-hidden />
            <p className="mt-3 font-semibold text-slate-500">Không có sự kiện nào!</p>
            <p className="mt-1 text-sm text-slate-400">
              Theo dõi fanpage ROG để nhận thông báo sự kiện mới sớm nhất.
            </p>
          </div>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
