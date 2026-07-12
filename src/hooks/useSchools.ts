"use client";

import { useEffect, useState } from "react";
import type { School } from "@/types";
import { schools as mockSchools } from "@/data/schools";

/**
 * Danh sách trường: ưu tiên bảng `schools` Supabase (CMS quản lý) → fallback mock khi DB trống/lỗi.
 * Tách khỏi src/lib/schools.ts để lib giữ thuần logic — Server Component (trang /truong/[slug])
 * import formatUsd/searchSchools mà không kéo React hooks vào server graph.
 *
 * @param query — query string cho /api/schools (vd "major=computer-science"). Khi có query
 *   (lọc server-side, vd ngành N-N), kết quả RỖNG là hợp lệ → KHÔNG fallback mock.
 */
export function useSchools(query = ""): School[] {
  // Có query lọc → khởi tạo rỗng (chờ server); không query → mock để hiển thị tức thì
  const [schools, setSchools] = useState<School[]>(query ? [] : mockSchools);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const response = await fetch(`/api/schools${query ? `?${query}` : ""}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const payload = (await response.json()) as { schools: School[] };
        // Có query: tin kết quả server kể cả rỗng (đã lọc). Không query: chỉ đè mock khi
        // DB có dữ liệu (fallback an toàn khi bảng trống).
        if (query || payload.schools.length > 0) setSchools(payload.schools);
      } catch {
        // giữ nguyên (mock hoặc rỗng) khi lỗi mạng
      }
    })();
    return () => controller.abort();
  }, [query]);

  return schools;
}
