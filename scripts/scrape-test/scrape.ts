/**
 * 🧪 Scrape-test — kiểm chứng schema Migration #7 bằng dữ liệu thật think.edu.vn.
 *
 * Chạy:  pnpm tsx scripts/scrape-test/scrape.ts [url1 url2 url3] [--offline]
 *   - Không truyền URL → dùng bộ 3 URL mặc định (đã chốt với user).
 *   - --offline → parse lại từ output/raw/*.html, không fetch mạng.
 *
 * Giới hạn phase test (theo prompt):
 *   - Tối đa 3 URL/lần chạy; delay ≥ 3s giữa các request; UA rõ ràng.
 *   - Tôn trọng robots.txt — URL bị Disallow → bỏ qua + ghi vào report.
 *   - KHÔNG ghi database — chỉ xuất file JSON local + report.md.
 */

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import {
  schoolAdmissionRequirementsSchema,
  schoolCostBreakdownSchema,
  schoolQuickFactsSchema,
  schoolSectionSchema,
} from "../../src/lib/validations.js";
import {
  parseAdmissionRequirements,
  parseBasicInfo,
  parseContentSections,
  parseCostBreakdown,
  parseQuickFacts,
} from "./parsers.js";
import { buildReport, type ScrapeTestResult } from "./report.js";

// ─── Config ──────────────────────────────────────────────────────

const DEFAULT_URLS = [
  "https://think.edu.vn/ball-state-university/",
  "https://think.edu.vn/shms-swiss-hotel-management-school/",
  "https://think.edu.vn/bandon-grammar-school/",
];

const MAX_URLS = 3;
const DELAY_MS = 3_000; // tối thiểu 3s giữa các request
const USER_AGENT = "ROG-Edu-ScrapeTest/1.0 (education data research; contact: info@duhocrog.com)";

const OUT_DIR = path.resolve(__dirname, "output");
const RAW_DIR = path.join(OUT_DIR, "raw");
const PARSED_DIR = path.join(OUT_DIR, "parsed");

// ─── Helpers ─────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function slugFromUrl(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "unknown";
}

/** Parse robots.txt tối giản: lấy các Disallow của User-agent: * và kiểm tra path. */
async function fetchDisallows(origin: string): Promise<string[]> {
  try {
    const res = await axios.get(`${origin}/robots.txt`, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 10_000,
    });
    const lines = String(res.data).split("\n");
    const disallows: string[] = [];
    let applies = false;
    for (const line of lines) {
      const [rawKey, ...rest] = line.split(":");
      const key = rawKey.trim().toLowerCase();
      const value = rest.join(":").trim();
      if (key === "user-agent") applies = value === "*";
      else if (applies && key === "disallow" && value) disallows.push(value);
    }
    return disallows;
  } catch {
    return []; // không đọc được robots.txt → coi như không cấm (site public)
  }
}

function isDisallowed(url: string, disallows: string[]): boolean {
  const pathName = new URL(url).pathname + new URL(url).search;
  return disallows.some((rule) => {
    // Chuyển rule robots (có *) thành regex prefix-match
    const pattern = "^" + rule.split("*").map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*");
    return new RegExp(pattern).test(pathName);
  });
}

function zodIssues(
  label: string,
  result: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } },
): string[] {
  if (result.success || !result.error) return [];
  return result.error.issues
    .slice(0, 5)
    .map((i) => `${label}.${i.path.map(String).join(".")}: ${i.message}`);
}

// ─── Pipeline 1 URL ──────────────────────────────────────────────

async function processUrl(url: string, offline: boolean, disallows: string[]): Promise<ScrapeTestResult> {
  const slug = slugFromUrl(url);
  const rawFile = path.join(RAW_DIR, `${slug}.html`);
  const result: ScrapeTestResult = { url, slug, parseWarnings: [], zodErrors: [] };

  // robots.txt
  if (!offline && isDisallowed(url, disallows)) {
    result.skippedReason = "robots.txt Disallow — tôn trọng, không cào";
    return result;
  }

  // Fetch hoặc đọc raw offline
  let html: string;
  if (offline || fs.existsSync(rawFile)) {
    if (!fs.existsSync(rawFile)) {
      result.skippedReason = "--offline nhưng chưa có file raw";
      return result;
    }
    html = fs.readFileSync(rawFile, "utf-8");
    console.log(`  📂 Dùng raw có sẵn: ${path.relative(process.cwd(), rawFile)}`);
  } else {
    try {
      const res = await axios.get(url, {
        headers: { "User-Agent": USER_AGENT },
        timeout: 20_000,
      });
      html = String(res.data);
      fs.writeFileSync(rawFile, html, "utf-8");
      console.log(`  💾 Lưu raw (${(html.length / 1024).toFixed(0)}KB)`);
    } catch (err) {
      result.skippedReason = `fetch fail: ${err instanceof Error ? err.message : "unknown"}`;
      return result;
    }
  }

  // Parse — từng khối chịu lỗi độc lập
  const $ = cheerio.load(html);
  const w = result.parseWarnings;

  result.basic = parseBasicInfo($, w);
  result.quickFacts = parseQuickFacts($, result.basic, w);
  result.costBreakdown = parseCostBreakdown($, w);
  result.admissionRequirements = parseAdmissionRequirements($, w);
  result.contentSections = parseContentSections($, w);

  // Zod validate — lỗi ghi nhận, không throw (data vẫn xuất ra file để review)
  result.zodErrors.push(
    ...zodIssues("quickFacts", schoolQuickFactsSchema.safeParse(result.quickFacts)),
    ...(result.costBreakdown
      ? zodIssues("costBreakdown", schoolCostBreakdownSchema.safeParse(result.costBreakdown))
      : []),
    ...(result.admissionRequirements
      ? zodIssues(
          "admissionRequirements",
          schoolAdmissionRequirementsSchema.safeParse(result.admissionRequirements),
        )
      : []),
    ...(result.contentSections ?? []).flatMap((s, i) =>
      zodIssues(`contentSections[${i}]`, schoolSectionSchema.safeParse(s)),
    ),
  );

  // Ghi parsed JSON
  const parsedFile = path.join(PARSED_DIR, `${slug}.json`);
  fs.writeFileSync(
    parsedFile,
    JSON.stringify(
      {
        sourceUrl: url,
        scrapedAt: new Date().toISOString(),
        basic: result.basic,
        quickFacts: result.quickFacts,
        costBreakdown: result.costBreakdown,
        admissionRequirements: result.admissionRequirements,
        contentSections: result.contentSections,
        parseWarnings: result.parseWarnings,
      },
      null,
      2,
    ),
    "utf-8",
  );
  console.log(
    `  ✅ ${result.basic.name} | sections=${result.contentSections?.length ?? 0}` +
      ` cost=${result.costBreakdown?.rows.length ?? 0} adm=${result.admissionRequirements?.rows.length ?? 0}` +
      ` warn=${w.length} zodErr=${result.zodErrors.length}`,
  );
  return result;
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const offline = args.includes("--offline");
  const urls = args.filter((a) => a.startsWith("http")).slice(0, MAX_URLS);
  const targets = urls.length > 0 ? urls : DEFAULT_URLS;

  console.log(`🧪 Scrape-test — ${targets.length} URL${offline ? " (offline)" : ""}\n`);
  fs.mkdirSync(RAW_DIR, { recursive: true });
  fs.mkdirSync(PARSED_DIR, { recursive: true });

  const disallows = offline ? [] : await fetchDisallows(new URL(targets[0]).origin);

  const results: ScrapeTestResult[] = [];
  for (let i = 0; i < targets.length; i++) {
    console.log(`[${i + 1}/${targets.length}] ${targets[i]}`);
    results.push(await processUrl(targets[i], offline, disallows));
    if (i < targets.length - 1 && !offline) await sleep(DELAY_MS);
  }

  const reportFile = path.join(OUT_DIR, "report.md");
  fs.writeFileSync(reportFile, buildReport(results), "utf-8");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`📊 Report : ${path.relative(process.cwd(), reportFile)}`);
  console.log(`📁 Parsed : ${path.relative(process.cwd(), PARSED_DIR)}/`);
  console.log("⚠️  KHÔNG ghi database ở phase test — review report trước khi apply Migration #7.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
