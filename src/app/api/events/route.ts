import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { EventItem, EventRow } from "@/types";

export const revalidate = 300; // cache 5 phút

/** GET /api/events — public: sự kiện active cho EventsTabs trang chủ. */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ events: [] });
    }

    const { data, error } = await supabase
      .from("events")
      .select("id, title, description, starts_at, location, href")
      .eq("is_active", true)
      .order("starts_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[api/events]", error);
      return NextResponse.json({ events: [] });
    }

    const events: EventItem[] = (data as Omit<EventRow, "is_active" | "created_at">[]).map(
      (row) => ({
        id: row.id,
        title: row.title,
        description: row.description ?? "",
        startsAt: row.starts_at,
        location: row.location ?? "",
        href: row.href ?? "#",
      })
    );
    return NextResponse.json({ events });
  } catch (error) {
    console.error("[api/events] unexpected:", error);
    return NextResponse.json({ events: [] });
  }
}
