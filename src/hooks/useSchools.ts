"use client";

import { useEffect, useState } from "react";
import type { School } from "@/types";
import { schools as mockSchools } from "@/data/schools";

/**
 * Danh sách trường: ưu tiên bảng `schools` Supabase (CMS quản lý) → fallback mock khi DB trống/lỗi.
 * Tách khỏi src/lib/schools.ts để lib giữ thuần logic — Server Component (trang /truong/[slug])
 * import formatUsd/searchSchools mà không kéo React hooks vào server graph.
 */
export function useSchools(): School[] {
  const [schools, setSchools] = useState<School[]>(mockSchools);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch("/api/schools", { signal: controller.signal });
        if (!response.ok) return;
        const payload = (await response.json()) as { schools: School[] };
        if (payload.schools.length > 0) setSchools(payload.schools);
      } catch {
        // giữ mock — không crash khi lỗi mạng
      }
    })();
    return () => controller.abort();
  }, []);

  return schools;
}
