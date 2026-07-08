"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, GraduationCap, LogOut, School, Users } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { LeadsTab } from "@/components/admin/LeadsTab";
import { EventsTab } from "@/components/admin/EventsTab";
import { SchoolsTab } from "@/components/admin/SchoolsTab";

type TabKey = "leads" | "events" | "schools";

const TABS: { key: TabKey; label: string; icon: typeof Users }[] = [
  { key: "leads", label: "Leads / Khách hàng", icon: Users },
  { key: "events", label: "Sự kiện", icon: CalendarDays },
  { key: "schools", label: "Trường & Học bổng", icon: School },
];

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("leads");

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // logout best-effort — vẫn chuyển trang
    }
    router.push("/admin/login");
  };

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-primary text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-extrabold">
            <GraduationCap className="h-6 w-6" aria-hidden />
            ROG Admin — CRM
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold hover:bg-primary-light"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Đăng xuất
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl px-4" aria-label="Tab quản trị">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-current={tab === t.key ? "page" : undefined}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? "border-white text-white"
                  : "border-transparent text-white/70 hover:text-white"
              }`}
            >
              <t.icon className="h-4 w-4" aria-hidden />
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <ErrorBoundary moduleName={`AdminTab:${tab}`}>
          {tab === "leads" && <LeadsTab />}
          {tab === "events" && <EventsTab />}
          {tab === "schools" && <SchoolsTab />}
        </ErrorBoundary>
      </div>
    </main>
  );
}
