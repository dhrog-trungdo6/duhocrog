e/**
 * 🕷️ ROG Education — School Crawler (think.edu.vn)
 * =================================================
 * Dùng: pnpm tsx scripts/crawler.ts
 *
 * Yêu cầu: File scripts/urls.json chứa mảng URL cần crawl
 *          (lấy từ console-extract-urls.js ở bước 1)
 *
 * Luồng:
 *   1. Đọc urls.json
 *   2. Crawl từng URL (delay 1-2s giữa các request)
 *   3. Parse HTML → map vào School interface
 *   4. Validate bằng Zod schoolInputSchema
 *   5. Ghi kết quả ra scripts/schools_data_scraped.json
 *   6. (Optional) POST vào /api/admin/schools nếu có SUPABASE_URL
 *
 * ⚠️ CSS SELECTORS trong file này là GIẢ ĐỊNH — cần user chỉnh
 *    sau khi inspect HTML thực tế từ think.edu.vn
 */

import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import { schoolInputSchema } from "../src/lib/validations.js";
import { slugify } from "../src/lib/slug.js";
import type { SchoolSection, TableRow } from "../src/types/index.js";

// ─── CONFIG ──────────────────────────────────────────────

const INPUT_FILE = path.resolve(__dirname, "urls.json");
const OUTPUT_FILE = path.resolve(__dirname, "schools_data_scraped.json");
const FAILED_FILE = path.resolve(__dirname, "schools_failed.json");

const REQUEST_DELAY_MS = { min: 1000, max: 2000 }; // 1-2 giây
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ROG-Edu-Crawler/1.0";

// ─── TYPES ───────────────────────────────────────────────

/** Input row cho Supabase — map từ School interface sang snake_case */
interface SchoolInsertRow {
  name: string;
  country: string;
  province: string;
  level: string;
  tuition_usd: number;
  scholarship_up_to: number | null;
  logo_url: string;
  is_active: boolean;
  slug: string;
  description: string;
  website_url: string;
  image_url: string;
  video_url: string;
  gallery_urls: string[];
  highlights: string[];
  programs: Array<{ name: string; level: string; tuitionUsd?: number; duration?: string }>;
  requirements: Array<{ category: string; items: string[] }>;
  founded_year: number | null;
  school_type: string;
  total_students: number | null;
  intakes: string[];
  map_embed_url: string;
  content_sections: SchoolSection[];
}

interface CrawlResult {
  url: string;
  success: boolean;
  data?: SchoolInsertRow;
  error?: string;
}

// ─── HELPERS ─────────────────────────────────────────────

function sleep(): Promise<void> {
  const ms = Math.floor(Math.random() * (REQUEST_DELAY_MS.max - REQUEST_DELAY_MS.min + 1)) + REQUEST_DELAY_MS.min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

function parseNumber(text: string | null | undefined): number | null {
  if (!text) return null;
  // "15,000" → 15000, "$28,000" → 28000, "1,500,000" → 1500000
  const cleaned = text.replace(/[$,]/g, "").trim();
  const num = parseInt(cleaned, 10);
  return Number.isNaN(num) ? null : num;
}

function parsePercentage(text: string | null | undefined): number | null {
  if (!text) return null;
  // "50%" → 50, "Up to 100%" → 100
  const match = text.match(/(\d+)\s*%/);
  return match ? parseInt(match[1], 10) : null;
}

// ─── SELECTOR CONFIG — USER CẦN CHỈNH SAU KHI INSPECT DOM ─

/**
 * CSS Selectors cho think.edu.vn (GIẢ ĐỊNH — CẦN CHỈNH LẠI)
 *
 * Để tìm đúng selector:
 *   1. Mở 1 trang chi tiết trường trên think.edu.vn
 *   2. Inspect từng phần tử (F12 → Elements)
 *   3. Copy CSS selector hoặc class name
 *   4. Cập nhật bên dưới
 */
const SELECTORS = {
  // ── Quick Facts ──────────────────────────────────────
  schoolName: "h1, .school-name, .university-name, [class*='title']",
  description: ".school-description, .about-content p, .intro-text",
  logoUrl: ".school-logo img, .university-logo img",
  coverUrl: ".school-cover img, .hero-banner img",

  // Quick facts sidebar
  foundedYear: ".quick-fact-year, .founded-year, [class*='founded']",
  schoolType: ".quick-fact-type, .school-type, [class*='type']",
  totalStudents: ".quick-fact-students, .total-students, [class*='student']",
  intakes: ".quick-fact-intake, .intake-list li, [class*='intake']",
  tuition: ".quick-fact-tuition, .tuition-amount, [class*='tuition']",
  scholarship: ".quick-fact-scholarship, .scholarship-amount, [class*='scholarship']",
  mapEmbed: "iframe[src*='google.com/maps'], iframe[src*='maps']",

  // ── Content Sections (Tab/Mục) ───────────────────────
  sectionTabs: ".tab-nav button, .section-nav a, .menu-item",
  sectionContent: ".tab-content, .section-content, .tab-panel",

  // ── Tables ────────────────────────────────────────────
  dataTable: "table, .data-table, .requirements-table",
  tableHeaders: "thead th, tr:first-child th, tr:first-child td",
  tableRows: "tbody tr, tr:has(td)",

  // ── Country/Province detection ────────────────────────
  location: ".school-location, .location, [class*='location']",
  countryFlag: ".country-flag, img[alt*='flag'], [class*='flag']",
};

// ─── EXTRACTORS ──────────────────────────────────────────

/**
 * Trích xuất Quick Facts từ sidebar.
 * User cần chỉnh selector trong SELECTORS sau khi inspect DOM.
 */
function extractQuickFacts($: cheerio.CheerioAPI): {
  foundedYear: number | null;
  schoolType: string;
  totalStudents: number | null;
  intakes: string[];
  mapEmbedUrl: string;
} {
  const foundedYear = parseNumber($(SELECTORS.foundedYear).first().text()) ?? null;
  const schoolType = cleanText($(SELECTORS.schoolType).first().text()) || "";
  const totalStudents = parseNumber($(SELECTORS.totalStudents).first().text()) ?? null;

  // Intakes: có thể là 1 chuỗi "Tháng 1, Tháng 9" hoặc nhiều thẻ <li>
  const intakeEls = $(SELECTORS.intakes);
  const intakes: string[] = [];
  if (intakeEls.length > 0) {
    intakeEls.each((_, el) => {
      const text = cleanText($(el).text());
      if (text) intakes.push(text);
    });
  }
  // Fallback: parse từ 1 thẻ duy nhất
  if (intakes.length === 0) {
    const singleText = cleanText($(SELECTORS.intakes).first().text());
    if (singleText) {
      intakes.push(...singleText.split(/[,;]\s*/).filter(Boolean));
    }
  }

  const mapEmbedUrl =
    $(SELECTORS.mapEmbed).first().attr("src") ?? "";

  return { foundedYear, schoolType, totalStudents, intakes, mapEmbedUrl };
}

/**
 * Trích xuất country code từ tên quốc gia hoặc cờ.
 * Map tên tiếng Việt → code (mở rộng thêm nếu cần).
 */
function detectCountry($: cheerio.CheerioAPI): string {
  const locationText = cleanText($(SELECTORS.location).first().text()).toLowerCase();

  const countryMap: Record<string, string> = {
    "my": "us", "hoa ky": "us", "hoa kỳ": "us", "america": "us", "united states": "us",
    "canada": "ca", "canađa": "ca",
    "uc": "au", "australia": "au", "úc": "au",
    "anh": "uk", "uk": "uk", "united kingdom": "uk", "anh quốc": "uk",
    "singapore": "sg",
    "new zealand": "nz",
    "ireland": "ie", "ai len": "ie", "ái nhĩ lan": "ie",
    "phap": "fr", "france": "fr", "pháp": "fr",
    "duc": "de", "germany": "de", "đức": "de",
    "thuy si": "ch", "switzerland": "ch", "thụy sĩ": "ch",
    "malaysia": "my",
    "philippines": "ph", "phi luật tân": "ph",
    "thai lan": "th", "thailand": "th", "thái lan": "th",
    "han quoc": "kr", "south korea": "kr", "korea": "kr", "hàn quốc": "kr",
    "nhat ban": "jp", "japan": "jp", "nhật bản": "jp",
    "ha lan": "nl", "netherlands": "nl", "hà lan": "nl",
  };

  for (const [key, code] of Object.entries(countryMap)) {
    if (locationText.includes(key)) return code;
  }

  return ""; // Không xác định được
}

/**
 * Trích xuất rich content sections (Tab/Mục động).
 * Template — user cần chỉnh selector theo cấu trúc thực tế.
 */
function extractRichContent($: cheerio.CheerioAPI): SchoolSection[] {
  const sections: SchoolSection[] = [];

  // Chiến lược 1: Tìm các tab/section theo heading
  const possibleHeadings = $("h2, h3, h4, .section-title, .tab-title");
  if (possibleHeadings.length === 0) {
    // Fallback: toàn bộ nội dung → 1 html section
    const bodyContent = $("article, .main-content, .school-content, #content").html();
    if (bodyContent) {
      sections.push({
        type: "html",
        title: "Tổng quan",
        content: bodyContent,
      });
    }
    return sections;
  }

  // Chiến lược 2: Parse từng section dựa trên heading
  // (Đơn giản hóa — user cần tùy chỉnh theo cấu trúc thực tế)
  let currentHeading = "";
  let currentContent = "";

  possibleHeadings.each((_, headingEl) => {
    const headingText = cleanText($(headingEl).text());
    if (!headingText) return;

    // Lưu section trước đó (nếu có)
    if (currentHeading && currentContent) {
      sections.push({
        type: "html",
        title: currentHeading,
        content: currentContent,
      });
    }

    currentHeading = headingText;

    // Lấy nội dung giữa heading này và heading tiếp theo
    // Đơn giản: lấy các sibling cho đến khi gặp heading tiếp theo
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let sibling: any = headingEl;
    const parts: string[] = [];
    // eslint-disable-next-line no-cond-assign
    while ((sibling = sibling.nextElementSibling) && sibling.tagName !== "h2" && sibling.tagName !== "h3" && sibling.tagName !== "h4") {
      const tagName = (sibling.tagName ?? "").toLowerCase();
      if (tagName === "table") {
        // Parse table
        const tableSection = parseTable($, sibling, currentHeading);
        if (tableSection) {
          sections.push(tableSection);
          currentContent = ""; // Đã xử lý table, reset content
        }
      } else if (tagName === "ul" || tagName === "ol") {
        // Parse list
        const items: string[] = [];
        $(sibling)
          .find("li")
          .each((_, li) => {
            const text = cleanText($(li).text());
            if (text) items.push(text);
          });
        if (items.length > 0) {
          sections.push({ type: "list", title: currentHeading, items });
          currentContent = ""; // Đã xử lý list
        }
      } else {
        parts.push($.html(sibling) || $(sibling).text() || "");
      }
      sibling = sibling.nextElementSibling;
    }
    currentContent = parts.join("\n");
  });

  // Lưu section cuối cùng
  if (currentHeading && currentContent) {
    sections.push({ type: "html", title: currentHeading, content: currentContent });
  }

  return sections;
}

/**
 * Parse HTML table → TableSection
 */
function parseTable(
  $: cheerio.CheerioAPI,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tableEl: any,
  title: string,
): SchoolSection | null {
  const headers: string[] = [];
  $(tableEl)
    .find(SELECTORS.tableHeaders)
    .each((_, th) => {
      headers.push(cleanText($(th).text()));
    });

  if (headers.length === 0) return null;

  const rows: TableRow[] = [];
  $(tableEl)
    .find(SELECTORS.tableRows)
    .each((_, tr) => {
      const cells = $(tr).find("td, th");
      const row: TableRow = {};
      cells.each((idx, td) => {
        const key = headers[idx] ?? `col_${idx}`;
        row[key] = cleanText($(td).text());
      });
      if (Object.keys(row).length > 0) rows.push(row);
    });

  if (rows.length === 0) return null;

  return { type: "table", title, headers, rows };
}

// ─── MAIN CRAWLER ────────────────────────────────────────

async function crawlOne(url: string, index: number, total: number): Promise<CrawlResult> {
  console.log(`[${index + 1}/${total}] 🌐 Crawling: ${url}`);

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 15_000,
    });

    const $ = cheerio.load(response.data);

    // ── Extract cơ bản ──────────────────────────────────
    const name = cleanText($(SELECTORS.schoolName).first().text()) || "Unknown School";
    const description = cleanText($(SELECTORS.description).first().text()) || "";
    const logoUrl = $(SELECTORS.logoUrl).first().attr("src") ?? "";
    const coverUrl = $(SELECTORS.coverUrl).first().attr("src") ?? "";
    const country = detectCountry($);
    const province = ""; // Hard to auto-detect — user can add regex
    const level = "dai-hoc"; // Default; user can enhance detection

    // ── Quick Facts ──────────────────────────────────────
    const quickFacts = extractQuickFacts($);

    // ── Tuition & Scholarship ────────────────────────────
    const tuitionUsd = parseNumber($(SELECTORS.tuition).first().text()) ?? 0;
    const scholarshipUpTo = parsePercentage($(SELECTORS.scholarship).first().text()) ?? null;

    // ── Content Sections ─────────────────────────────────
    const contentSections = extractRichContent($);

    // ── Build Insert Row ─────────────────────────────────
    const slug = slugify(name);
    const data: SchoolInsertRow = {
      name,
      country,
      province,
      level,
      tuition_usd: tuitionUsd,
      scholarship_up_to: scholarshipUpTo,
      logo_url: logoUrl,
      is_active: false, // Default inactive — admin review trước khi publish
      slug,
      description,
      website_url: "",
      image_url: coverUrl,
      video_url: "",
      gallery_urls: [],
      highlights: [],
      programs: [],
      requirements: [],
      founded_year: quickFacts.foundedYear,
      school_type: quickFacts.schoolType,
      total_students: quickFacts.totalStudents,
      intakes: quickFacts.intakes,
      map_embed_url: quickFacts.mapEmbedUrl,
      content_sections: contentSections,
    };

    // Validate bằng Zod
    const parsed = schoolInputSchema.safeParse(data);
    if (!parsed.success) {
      console.warn(`  ⚠️  Zod validation failed for ${name}:`, parsed.error.flatten().fieldErrors);
      // Vẫn lưu data thô để user review
    }

    console.log(`  ✅ ${name} | ${contentSections.length} sections extracted`);
    return { url, success: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`  ❌ Failed: ${message}`);
    return { url, success: false, error: message };
  }
}

async function main() {
  console.log("🕷️  ROG School Crawler — Starting...\n");

  // ── Read input ─────────────────────────────────────────
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ File ${INPUT_FILE} không tồn tại!`);
    console.log("   👉 Chạy console-extract-urls.js trên trình duyệt trước để tạo urls.json");
    process.exit(1);
  }

  const raw = fs.readFileSync(INPUT_FILE, "utf-8");
  let urls: string[];
  try {
    urls = JSON.parse(raw) as string[];
  } catch {
    console.error("❌ urls.json không phải JSON hợp lệ!");
    process.exit(1);
  }

  console.log(`📋 Loaded ${urls.length} URLs\n`);

  // ── Crawl ──────────────────────────────────────────────
  const results: CrawlResult[] = [];
  const total = urls.length;

  for (let i = 0; i < total; i++) {
    const result = await crawlOne(urls[i], i, total);
    results.push(result);
    if (i < total - 1) await sleep();
  }

  // ── Write output ───────────────────────────────────────
  const success = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(success.map((r) => r.data), null, 2), "utf-8");
  fs.writeFileSync(FAILED_FILE, JSON.stringify(failed, null, 2), "utf-8");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ Hoàn tất!`);
  console.log(`   Thành công: ${success.length}/${total}`);
  console.log(`   Thất bại:   ${failed.length}/${total}`);
  console.log(`   Output:     ${OUTPUT_FILE}`);
  if (failed.length > 0) console.log(`   Failed:     ${FAILED_FILE}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // ── Optional: POST vào Supabase ────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceKey && success.length > 0) {
    console.log("\n📤 POSTing to Supabase...");
    let inserted = 0;
    for (const item of success) {
      try {
        const res = await axios.post(
          `${supabaseUrl}/rest/v1/schools`,
          item.data,
          {
            headers: {
              apikey: serviceKey,
              Authorization: `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
              Prefer: "return=minimal",
            },
          },
        );
        if (res.status === 201) inserted++;
      } catch (err) {
        console.error(`  Failed to insert ${item.data?.name}:`, (err as Error).message);
      }
      await sleep();
    }
    console.log(`   Inserted: ${inserted}/${success.length} vào Supabase`);
  }
}

main().catch(console.error);