/**
 * 🚀 ROG Education — Batch Crawler (think.edu.vn → Supabase)
 * ============================================================
 * Dùng: pnpm tsx scripts/batch-crawl.ts
 * 
 * Luồng: Fetch → Parse → Check slug exists → INSERT or UPDATE
 * (Không dùng ON CONFLICT vì slug là partial unique index)
 */

import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";
import axios from "axios";
import * as cheerio from "cheerio";
import {
  parseBasicInfo,
  parseQuickFacts,
  parseCostBreakdown,
  parseAdmissionRequirements,
  parseContentSections,
} from "./scrape-test/parsers.js";

// ─── Load .env.local ─────────────────────────────────────
(function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "").trim();
    }
  }
  console.log("📋 Loaded .env.local");
})();

// ─── Config ──────────────────────────────────────────────
const INPUT_FILE = path.resolve(__dirname, "urls.json");  // Đổi về urls.json đầy đủ
const OUTPUT_DIR = path.resolve(__dirname, "batch-output");
const RAW_DIR = path.join(OUTPUT_DIR, "raw"); // cache HTML gzip — re-parse offline không cần cào lại
const DELAY_MS = 2_000;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ROG-Edu/1.0";
// RESUME=1: slug đã có HTML cache thì parse offline từ cache (không fetch, không delay)
const RESUME = process.env.RESUME === "1";

fs.mkdirSync(RAW_DIR, { recursive: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong .env.local");
  process.exit(1);
}

const authHeaders = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };

// ─── Supabase: insert hoặc update theo slug ──────────────
async function upsertSchool(row: Record<string, unknown>): Promise<string> {
  const slug = row.slug as string;
  
  // 1. Kiểm tra slug đã tồn tại chưa
  const check = await axios.get(
    `${SUPABASE_URL}/rest/v1/schools?select=id&slug=eq.${encodeURIComponent(slug)}`,
    { headers: authHeaders },
  );
  const existingId = check.data?.[0]?.id as string | undefined;

  if (existingId) {
    // 2a. UPDATE — không đè các cột "phá" row seed đang active:
    // giữ nguyên logo/ảnh/is_active hiện có, và không ghi đè basics bằng giá trị rỗng khi parse fail
    const patch: Record<string, unknown> = { ...row };
    delete patch.image_url;
    delete patch.logo_url;
    delete patch.is_active;
    if (!row.country) delete patch.country;
    if (!row.province) delete patch.province;
    if (!row.tuition_usd) delete patch.tuition_usd;
    if (!row.website_url) delete patch.website_url;
    await axios.patch(`${SUPABASE_URL}/rest/v1/schools?id=eq.${existingId}`, patch, {
      headers: { ...authHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
    });
    return "updated";
  } else {
    // 2b. INSERT
    await axios.post(`${SUPABASE_URL}/rest/v1/schools`, row, {
      headers: { ...authHeaders, "Content-Type": "application/json", Prefer: "return=minimal" },
    });
    return "inserted";
  }
}

// ─── Types ───────────────────────────────────────────────
interface UrlEntry { url: string; levels?: string[] }
interface CrawlStats {
  total: number;
  success: number;
  failed: number;
  fromCache: number;
  emptySections: string[]; // slug các trường parse ra 0 content_sections (theo dõi coverage)
  errors: Array<{ url: string; error: string }>;
}

function slugFromUrl(url: string): string {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "unknown";
}

// ─── Crawl 1 URL ────────────────────────────────────────
/** @returns true nếu đã fetch qua mạng (cần delay), false nếu đọc từ cache */
async function crawlOne(entry: UrlEntry, i: number, total: number, stats: CrawlStats): Promise<boolean> {
  const { url } = entry;
  const slug = slugFromUrl(url);
  const rawFile = path.join(RAW_DIR, `${slug}.html.gz`);
  let fetchedFromNetwork = false;

  try {
    let html: string;
    if (RESUME && fs.existsSync(rawFile)) {
      html = zlib.gunzipSync(fs.readFileSync(rawFile)).toString("utf-8");
      stats.fromCache++;
      console.log(`[${i + 1}/${total}] 📦 ${slug} (cache)`);
    } else {
      console.log(`[${i + 1}/${total}] 🌐 ${slug}`);
      const res = await axios.get(url, { headers: { "User-Agent": UA }, timeout: 20_000 });
      html = String(res.data);
      fetchedFromNetwork = true;
      fs.writeFileSync(rawFile, zlib.gzipSync(html)); // cache để re-parse offline
    }
    const $ = cheerio.load(html);
    const warnings: string[] = [];
    
    const basic = parseBasicInfo($, warnings);
    const row: Record<string, unknown> = {
      name: basic.name,
      slug,
      country: basic.countryCode || "",
      province: basic.provinceLabel || "",
      level: entry.levels?.[0] || basic.levelCodes[0] || "dai-hoc",
      tuition_usd: basic.tuitionUsd ?? 0,
      website_url: basic.websiteUrl || "",
      image_url: "", logo_url: "",
      is_active: false,
      quick_facts: parseQuickFacts($, basic, warnings),
      cost_breakdown: parseCostBreakdown($, warnings),
      admission_requirements: parseAdmissionRequirements($, warnings),
      content_sections: parseContentSections($, warnings),
      source_url: url,
      scraped_at: new Date().toISOString(),
    };
    
    const sectionCount = (row.content_sections as unknown[]).length;
    if (sectionCount === 0) stats.emptySections.push(slug);

    const action = await upsertSchool(row);
    stats.success++;
    const warn = warnings.length > 0 ? ` ⚠️ ${warnings.length}w` : "";
    console.log(`  ✅ ${basic.name} [${action}] ${sectionCount} sections${warn}`);
  } catch (err) {
    stats.failed++;
    const msg = (err as Error).message;
    stats.errors.push({ url, error: msg });
    console.error(`  ❌ ${msg.substring(0, 120)}`);
  }
  return fetchedFromNetwork;
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  console.log("🚀 ROG Batch Crawler\n");
  
  if (!fs.existsSync(INPUT_FILE)) { console.error(`❌ ${INPUT_FILE} not found`); process.exit(1); }
  const entries: UrlEntry[] = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));
  console.log(`📋 ${entries.length} URLs\n`);
  
  const stats: CrawlStats = {
    total: entries.length, success: 0, failed: 0, fromCache: 0, emptySections: [], errors: [],
  };

  for (let i = 0; i < entries.length; i++) {
    const fetched = await crawlOne(entries[i], i, entries.length, stats);
    if (fetched && i < entries.length - 1) await new Promise(r => setTimeout(r, DELAY_MS));
  }

  console.log(`\n📊 DONE | ✅ ${stats.success} ❌ ${stats.failed}/${stats.total} | 📦 cache ${stats.fromCache} | ⚠️ sections rỗng: ${stats.emptySections.length}`);
  fs.writeFileSync(path.join(OUTPUT_DIR, "summary.json"), JSON.stringify({
    finishedAt: new Date().toISOString(),
    total: stats.total, success: stats.success, failed: stats.failed,
    fromCache: stats.fromCache, emptySections: stats.emptySections,
  }, null, 2));
  if (stats.errors.length > 0) {
    fs.writeFileSync(path.join(OUTPUT_DIR, "errors.json"), JSON.stringify(stats.errors, null, 2));
  }
}

main().catch(console.error);