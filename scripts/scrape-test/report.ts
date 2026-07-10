/**
 * Sinh báo cáo coverage (output/report.md) từ kết quả scrape-test.
 * Mục đích: kiểm chứng schema Migration #7 trước khi apply — field nào cào được,
 * field nào không, dữ liệu nào thực tế có mà schema thiếu.
 */

import type {
  SchoolAdmissionRequirements,
  SchoolCostBreakdown,
  SchoolQuickFacts,
  SchoolSection,
} from "../../src/types/index.js";
import type { BasicInfo } from "./parsers.js";
import { classifyHeading } from "./parsers.js";

export interface ScrapeTestResult {
  url: string;
  slug: string;
  skippedReason?: string; // robots.txt cấm / fetch fail
  basic?: BasicInfo;
  quickFacts?: SchoolQuickFacts;
  costBreakdown?: SchoolCostBreakdown | null;
  admissionRequirements?: SchoolAdmissionRequirements | null;
  contentSections?: SchoolSection[];
  parseWarnings: string[];
  zodErrors: string[];
}

const OK = "✅";
const PARTIAL = "⚠️";
const MISS = "❌";

function mark(present: boolean, partial = false): string {
  return present ? (partial ? PARTIAL : OK) : MISS;
}

export function buildReport(results: ScrapeTestResult[]): string {
  const done = results.filter((r) => !r.skippedReason);
  const lines: string[] = [];

  lines.push("# Báo cáo Scrape-Test — think.edu.vn");
  lines.push("");
  lines.push(`Sinh lúc: ${new Date().toISOString()} · ${done.length}/${results.length} URL parse thành công`);
  lines.push("");

  for (const r of results.filter((x) => x.skippedReason)) {
    lines.push(`> ⛔ BỎ QUA \`${r.url}\` — ${r.skippedReason}`);
  }
  lines.push("");

  // ── Bảng coverage field ──
  lines.push("## Coverage theo field");
  lines.push("");
  const header = ["Field", ...done.map((r) => r.slug)];
  lines.push(`| ${header.join(" | ")} |`);
  lines.push(`|${header.map(() => "---").join("|")}|`);

  const fieldRows: Array<[string, (r: ScrapeTestResult) => string]> = [
    ["basic.name", (r) => mark(!!r.basic?.name && r.basic.name !== "Unknown")],
    ["basic.countryCode", (r) => mark(!!r.basic?.countryCode)],
    ["basic.provinceLabel", (r) => mark(!!r.basic?.provinceLabel)],
    ["basic.levelCodes", (r) => mark((r.basic?.levelCodes.length ?? 0) > 0)],
    ["basic.tuitionUsd", (r) => mark(r.basic?.tuitionUsd != null)],
    ["basic.websiteUrl", (r) => mark(!!r.basic?.websiteUrl)],
    ["quickFacts.foundedYear", (r) => mark(r.quickFacts?.foundedYear != null)],
    ["quickFacts.schoolType", (r) => mark(!!r.quickFacts?.schoolType)],
    ["quickFacts.studentCount", (r) => mark(!!r.quickFacts?.studentCount)],
    ["quickFacts.intakes", (r) => mark((r.quickFacts?.intakes?.length ?? 0) > 0)],
    ["quickFacts.campusCity", (r) => mark(!!r.quickFacts?.campusCity)],
    [
      "costBreakdown.rows",
      (r) => {
        const n = r.costBreakdown?.rows.length ?? 0;
        return n > 0 ? `${OK} (${n})` : MISS;
      },
    ],
    ["costBreakdown.totalEstimate", (r) => mark(!!r.costBreakdown?.totalEstimate)],
    ["costBreakdown.currency", (r) => mark(!!r.costBreakdown?.currency)],
    [
      "admissionRequirements.rows",
      (r) => {
        const n = r.admissionRequirements?.rows.length ?? 0;
        return n > 0 ? `${OK} (${n})` : MISS;
      },
    ],
    [
      "contentSections (tổng)",
      (r) => {
        const n = r.contentSections?.length ?? 0;
        return n > 0 ? `${OK} (${n})` : MISS;
      },
    ],
  ];
  for (const [label, fn] of fieldRows) {
    lines.push(`| ${label} | ${done.map(fn).join(" | ")} |`);
  }
  lines.push("");

  // ── Bảng coverage 8 nhóm mục nội dung ──
  lines.push("## Coverage 8 nhóm mục nội dung (match từ khóa heading)");
  lines.push("");
  const groups: Array<[string, string]> = [
    ["highlights", "1. Điểm nổi bật"],
    ["overview", "2. Giới thiệu tổng quan"],
    ["programs", "3. Chương trình học"],
    ["cost", "4. Học phí & chi phí"],
    ["scholarship", "5. Học bổng"],
    ["admission", "6. Điều kiện nhập học"],
    ["life", "7. Cuộc sống khu vực"],
    ["fit", "8. Có phù hợp không"],
  ];
  lines.push(`| Nhóm mục | ${done.map((r) => r.slug).join(" | ")} |`);
  lines.push(`|---|${done.map(() => "---").join("|")}|`);
  for (const [key, label] of groups) {
    const cells = done.map((r) => {
      const n = (r.contentSections ?? []).filter((s) => classifyHeading(s.title) === key).length;
      return n > 0 ? `${OK} (${n})` : MISS;
    });
    lines.push(`| ${label} | ${cells.join(" | ")} |`);
  }
  lines.push("");

  // ── Warnings + Zod ──
  lines.push("## Parse warnings & Zod");
  lines.push("");
  for (const r of done) {
    lines.push(`### ${r.slug}`);
    if (r.parseWarnings.length === 0) lines.push("- (không có warning)");
    for (const w of r.parseWarnings) lines.push(`- ⚠️ ${w}`);
    for (const e of r.zodErrors) lines.push(`- ❌ Zod: ${e}`);
    lines.push("");
  }

  // ── Kết luận tự động ──
  lines.push("## KẾT LUẬN CHO MIGRATION #7");
  lines.push("");
  const conclusions: string[] = [];

  const coverage = (fn: (r: ScrapeTestResult) => boolean) =>
    done.filter(fn).length;

  const zeroFields: Array<[string, (r: ScrapeTestResult) => boolean]> = [
    ["quickFacts.foundedYear", (r) => r.quickFacts?.foundedYear != null],
    ["quickFacts.schoolType", (r) => !!r.quickFacts?.schoolType],
    ["quickFacts.studentCount", (r) => !!r.quickFacts?.studentCount],
    ["quickFacts.intakes", (r) => (r.quickFacts?.intakes?.length ?? 0) > 0],
    ["costBreakdown", (r) => (r.costBreakdown?.rows.length ?? 0) > 0],
    ["admissionRequirements", (r) => (r.admissionRequirements?.rows.length ?? 0) > 0],
  ];
  for (const [name, fn] of zeroFields) {
    const n = coverage(fn);
    if (n === 0) {
      conclusions.push(
        `- ❌ \`${name}\`: 0/${done.length} trường cào được → GIỮ cột (nullable) nhưng coi là dữ liệu NHẬP TAY qua admin, không kỳ vọng từ crawler.`,
      );
    } else if (n < done.length) {
      conclusions.push(
        `- ⚠️ \`${name}\`: ${n}/${done.length} trường cào được → giữ optional, crawler điền khi có.`,
      );
    } else {
      conclusions.push(`- ✅ \`${name}\`: ${n}/${done.length} — schema khớp dữ liệu thật.`);
    }
  }

  conclusions.push(
    "- ℹ️ Sidebar think.edu.vn cung cấp ổn định: quốc gia/tỉnh bang/bậc học/học phí/website — " +
      "map vào CỘT CÓ SẴN (country, province, level, tuition_usd, website_url), không cần cột mới.",
  );
  conclusions.push(
    "- ℹ️ Mục Học bổng (5) và Cuộc sống (7) không có cột riêng trong schema — hiện nằm trong " +
      "`content_sections` (html/list/table), đủ dùng cho trang chi tiết.",
  );
  conclusions.push(
    "- 👉 Sau khi chốt: apply Migration #7 trên Dashboard rồi mới cho crawler ghi các cột mới; " +
      "khi crawl thật dùng upsert `on_conflict=slug` (3 URL test trùng trường seed).",
  );
  lines.push(...conclusions);
  lines.push("");

  return lines.join("\n");
}
