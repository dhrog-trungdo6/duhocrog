"use client";

import { useEffect, useState } from "react";
import type { Major } from "@/types";

/**
 * Danh mục ngành học (bảng majors) cho dropdown lọc — fetch /api/majors 1 lần.
 * Rỗng khi DB chưa seed ngành hoặc lỗi mạng (component tự xử empty state).
 */
export function useMajors(): Major[] {
  const [majors, setMajors] = useState<Major[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/majors", { signal: controller.signal });
        if (!res.ok) return;
        const payload = (await res.json()) as { majors: Major[] };
        setMajors(payload.majors);
      } catch {
        // giữ [] khi lỗi mạng — dropdown vẫn render với option "Tất cả ngành học"
      }
    })();
    return () => controller.abort();
  }, []);

  return majors;
}

/** Gom ngành theo nhóm (category) để render <optgroup> — giữ thứ tự tên nhóm A→Z. */
export function groupMajorsByCategory(majors: Major[]): [string, Major[]][] {
  const map = new Map<string, Major[]>();
  for (const m of majors) {
    const arr = map.get(m.category) ?? [];
    arr.push(m);
    map.set(m.category, arr);
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "vi"));
}
