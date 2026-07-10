/**
 * Parsers cho trang chi tiết trường think.edu.vn (WordPress, HTML tĩnh).
 * Selector đã xác định từ inspect DOM thật (2026-07-10, trang ball-state-university):
 *   - Sidebar quick facts : .detail-school-info (p > span, label "Quốc gia:", "Bậc học :", ...)
 *   - Content root        : .page-content-area
 *   - TOC                 : #toc_container (.toc_number = mã mục "1", "2.1", ...)
 * Nguyên tắc: mỗi khối parse fail → push warning, KHÔNG throw chết cả pipeline.
 */

import type * as cheerio from "cheerio";
import type {
  AdmissionRow,
  CostRow,
  SchoolAdmissionRequirements,
  SchoolCostBreakdown,
  SchoolQuickFacts,
  SchoolSection,
  TableRow,
} from "../../src/types/index.js";
import { STUDY_LEVEL_LABELS } from "../../src/types/index.js";
import { detectCountryCode } from "./country-map.js";

// ─── Helpers ─────────────────────────────────────────────────────

export function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

/** Sibling element kế tiếp (bỏ qua text/comment) — node cheerio không có nextElementSibling. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function nextElement(node: any): any {
  let sib = node?.nextSibling ?? null;
  while (sib && sib.type !== "tag") sib = sib.nextSibling;
  return sib;
}

/** "Đại học" → "dai-hoc" — map ngược nhãn bậc học (kèm alias think.edu.vn). */
const LEVEL_LABEL_TO_CODE: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(STUDY_LEVEL_LABELS).map(([code, label]) => [label.toLowerCase(), code]),
  ),
  "trung học": "thpt",
  "trung học phổ thông": "thpt",
  "học tiếng": "anh-ngu",
  "anh ngữ": "anh-ngu",
  "du bị đại học": "dai-hoc",
  "dự bị đại học": "dai-hoc",
};

export function levelLabelToCode(label: string): string {
  return LEVEL_LABEL_TO_CODE[label.trim().toLowerCase()] ?? "";
}

/** Cắt chuỗi về đúng giới hạn Zod (field text tự do nối từ nhiều bullet có thể rất dài). */
function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + "…";
}

/**
 * Parse tiền: "16,000 – 18,000 CAD" → {min:16000, max:18000, currency:'CAD'};
 * "27,496$" → {min=max=27496, currency:'USD'}. Xử lý –/-/~/đến, phẩy/chấm nghìn, hậu tố '+'.
 */
export function parseMoneyRange(raw: string): {
  min: number | null;
  max: number | null;
  currency: string;
} {
  const text = cleanText(raw);
  const currencyMatch = text.match(/\b(CAD|USD|AUD|GBP|EUR|NZD|SGD|CHF|VN[DĐ])\b/i);
  let currency = currencyMatch ? currencyMatch[1].toUpperCase().replace("VNĐ", "VND") : "";
  if (!currency) {
    if (text.includes("$")) currency = "USD";
    else if (text.includes("£")) currency = "GBP";
    else if (text.includes("€")) currency = "EUR";
  }

  // Số có phân cách nghìn (16,000 / 16.000) hoặc số trần
  const nums = [...text.matchAll(/\d{1,3}(?:[.,]\d{3})+|\d+/g)]
    .map((m) => parseInt(m[0].replace(/[.,]/g, ""), 10))
    .filter((n) => !Number.isNaN(n) && n > 0);

  if (nums.length === 0) return { min: null, max: null, currency };
  // Khoảng min–max nếu có ≥2 số và giữa chúng là ký tự khoảng (–, -, ~, đến)
  const isRange = /\d[\s.,]*(?:–|-|~|đến|to)[\s.,]*\d/i.test(text) && nums.length >= 2;
  const min = nums[0];
  const max = isRange ? nums[1] : min;
  return { min, max, currency };
}

/** HTML table → TableSection — headers từ hàng đầu, rows là record theo header. */
export function tableToSection(
  $: cheerio.CheerioAPI,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tableEl: any,
  title: string,
): SchoolSection | null {
  const allRows = $(tableEl).find("tr").toArray();
  if (allRows.length === 0) return null;

  const headers = $(allRows[0])
    .find("th, td")
    .toArray()
    .map((c) => cleanText($(c).text()));
  if (headers.length === 0) return null;

  const rows: TableRow[] = [];
  for (const tr of allRows.slice(1)) {
    const cells = $(tr).find("td, th").toArray();
    if (cells.length === 0) continue;
    const row: TableRow = {};
    cells.forEach((td, idx) => {
      row[headers[idx] ?? `col_${idx}`] = cleanText($(td).text());
    });
    rows.push(row);
  }
  if (rows.length === 0) return null;
  return { type: "table", title, headers, rows };
}

// ─── 1. Basic info (sidebar .detail-school-info + h1) ─────────────

export interface BasicInfo {
  name: string;
  countryLabel: string;
  countryCode: string;
  provinceLabel: string;
  levelLabels: string[];
  levelCodes: string[];
  tuitionUsd: number | null;
  websiteUrl: string;
}

export function parseBasicInfo($: cheerio.CheerioAPI, warnings: string[]): BasicInfo {
  const h1 = cleanText($("h1").first().text());
  // "Ball State University – Indiana, Mỹ" → tên trước dấu –
  const name = cleanText(h1.split(/\s+[–-]\s+/)[0]) || h1 || "Unknown";

  const info = $(".detail-school-info").first();
  if (info.length === 0) warnings.push("basic: không tìm thấy .detail-school-info");

  const infoText = cleanText(info.text());

  const countryLink = info.find("a[href*='/danh-sach-truong/']").first();
  const countryLabel = cleanText(countryLink.text());
  const countryCode = detectCountryCode(countryLink.attr("href"), countryLabel);
  if (!countryCode) warnings.push(`basic: không map được quốc gia "${countryLabel}"`);

  // Province = link thứ 2 dạng /danh-sach-truong/{country}/{province}/
  const provinceLink = info
    .find("a[href*='/danh-sach-truong/']")
    .toArray()
    .map((el) => ({ href: $(el).attr("href") ?? "", text: cleanText($(el).text()) }))
    .find((l) => /\/danh-sach-truong\/[a-z0-9-]+\/[a-z0-9-]+\/?$/.test(l.href));
  const provinceLabel = provinceLink?.text ?? "";

  // Bậc học: các link /danh-sach-truong/{level} (không có sub-path)
  const levelLabels: string[] = [];
  info.find("a[href*='/danh-sach-truong/']").each((_, el) => {
    const href = $(el).attr("href") ?? "";
    const slug = href.match(/\/danh-sach-truong\/([a-z0-9-]+)\/?$/)?.[1] ?? "";
    if (["thpt", "cao-dang", "dai-hoc", "sau-dai-hoc", "hoc-tieng", "du-bi-dai-hoc", "dao-tao-nghe"].includes(slug)) {
      levelLabels.push(cleanText($(el).text()));
    }
  });
  const levelCodes = levelLabels.map(levelLabelToCode).filter(Boolean);
  if (levelCodes.length === 0) warnings.push("basic: không xác định được bậc học từ sidebar");

  // Học phí trung bình: "27,496$"
  const tuitionMatch = infoText.match(/Học phí[^:]*:\s*([^A-Za-zW]+[$€£]?\s*(?:CAD|USD|AUD|GBP|EUR|NZD|SGD|CHF)?)/i);
  const tuition = tuitionMatch ? parseMoneyRange(tuitionMatch[1]) : { min: null, max: null, currency: "" };
  if (tuition.min === null) warnings.push("basic: không parse được học phí sidebar");

  const websiteUrl =
    info
      .find("a[href^='http']")
      .toArray()
      .map((el) => $(el).attr("href") ?? "")
      .find((h) => !h.includes("think.edu.vn")) ?? "";

  return {
    name,
    countryLabel,
    countryCode,
    provinceLabel,
    levelLabels,
    levelCodes,
    tuitionUsd: tuition.min,
    websiteUrl,
  };
}

// ─── 2. Quick Facts (kết hợp sidebar + regex nội dung bài) ────────

export function parseQuickFacts(
  $: cheerio.CheerioAPI,
  basic: BasicInfo,
  warnings: string[],
): SchoolQuickFacts {
  const contentText = cleanText($(".page-content-area").text()).slice(0, 20_000);
  const facts: SchoolQuickFacts = {};

  if (basic.provinceLabel) facts.campusCity = basic.provinceLabel;
  if (basic.websiteUrl) facts.websiteUrl = basic.websiteUrl;

  // Năm thành lập: "thành lập năm 1918" / "thành lập vào năm 1918" trong bài
  const founded = contentText.match(/thành lập(?:[^0-9]{0,40})\b(1[6-9]\d{2}|20[0-2]\d)\b/i);
  if (founded) facts.foundedYear = parseInt(founded[1], 10);
  else warnings.push("quickFacts: không tìm thấy năm thành lập");

  // Loại trường: "đại học công lập" / "tư thục" / "nội trú"
  const type = contentText.match(/\b(công lập|tư thục|nội trú|bán công)\b/i);
  if (type) facts.schoolType = type[1].charAt(0).toUpperCase() + type[1].slice(1).toLowerCase();
  else warnings.push("quickFacts: không tìm thấy loại trường");

  // Số sinh viên: "hơn 20.000 sinh viên" / "25,000+ sinh viên"
  const students = contentText.match(/(?:hơn|khoảng|với)?\s*([\d.,]{4,9}\+?)\s*(?:sinh viên|học sinh)/i);
  if (students) facts.studentCount = students[1];
  else warnings.push("quickFacts: không tìm thấy số sinh viên");

  // Kỳ nhập học: "Tháng 1, 5, 9" / "kỳ nhập học tháng 1 và tháng 8"
  const intakeMatch = contentText.match(
    /(?:kỳ )?nhập học[^.]{0,80}?((?:tháng\s*\d{1,2}(?:\s*(?:,|và|&)\s*(?:tháng\s*)?\d{1,2})*)+)/i,
  );
  if (intakeMatch) {
    const months = [...intakeMatch[1].matchAll(/\d{1,2}/g)].map((m) => `Tháng ${m[0]}`);
    if (months.length > 0) facts.intakes = [...new Set(months)];
  } else {
    warnings.push("quickFacts: không tìm thấy kỳ nhập học");
  }

  return facts;
}

// ─── Heading traversal chung ──────────────────────────────────────

const SECTION_KEYWORDS: Record<string, RegExp> = {
  highlights: /nổi bật/i,
  overview: /giới thiệu|tổng quan/i,
  programs: /chương trình/i,
  cost: /học phí|chi phí/i,
  scholarship: /học bổng/i,
  admission: /điều kiện/i,
  life: /cuộc sống|khu vực/i,
  fit: /phù hợp/i,
};

export function classifyHeading(title: string): string {
  for (const [key, re] of Object.entries(SECTION_KEYWORDS)) {
    if (re.test(title)) return key;
  }
  return "other";
}

/** Root chứa bài viết — .page-content-area (đã xác nhận), fallback article. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function contentRoot($: cheerio.CheerioAPI): any {
  const root = $(".page-content-area").first();
  return root.length > 0 ? root : $("article").first();
}

/** Thu thập các element giữa 1 heading và heading cùng cấp/kế tiếp. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function elementsUntilNextHeading($: cheerio.CheerioAPI, headingEl: any): any[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const collected: any[] = [];
  let sib = nextElement(headingEl);
  while (sib && !/^h[234]$/i.test(sib.tagName ?? "")) {
    collected.push(sib);
    sib = nextElement(sib);
  }
  return collected;
}

// ─── 3. Cost breakdown (mục "Học phí và chi phí") ─────────────────

export function parseCostBreakdown(
  $: cheerio.CheerioAPI,
  warnings: string[],
): SchoolCostBreakdown | null {
  const root = contentRoot($);
  const costHeading = root
    .find("h2")
    .toArray()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .find((el: any) => /học phí|chi phí/i.test(cleanText($(el).text())));
  if (!costHeading) {
    warnings.push("cost: không tìm thấy heading 'Học phí/Chi phí'");
    return null;
  }

  const rows: CostRow[] = [];
  let currency = "";
  let totalEstimate: CostRow | undefined;

  // Duyệt tới h2 kế tiếp: gom bảng + các h3 "Học phí undergraduate/năm" kèm đoạn giá
  let sib = nextElement(costHeading);
  let currentH3 = "";
  while (sib && (sib.tagName ?? "").toLowerCase() !== "h2") {
    const tag = (sib.tagName ?? "").toLowerCase();
    const text = cleanText($(sib).text());

    // Bảng trực tiếp HOẶC bọc trong wrapper (figure.wp-block-table, div...)
    const tableEls = tag === "table" ? [sib] : $(sib).find("table").toArray();
    if (tableEls.length > 0) {
      // Bảng chi phí chuẩn: cột 0 = khoản mục, cột 1 = số tiền
      for (const tableEl of tableEls) {
        $(tableEl)
          .find("tr")
          .toArray()
          .forEach((tr, idx) => {
            const cells = $(tr).find("td, th").toArray().map((c) => cleanText($(c).text()));
            if (cells.length < 2 || idx === 0) return; // bỏ header
            const money = parseMoneyRange(cells[1]);
            if (!currency && money.currency) currency = money.currency;
            const row: CostRow = {
              label: cells[0],
              amountMin: money.min,
              amountMax: money.max,
              unit: money.currency ? `${money.currency}/năm` : "",
              ...(cells[2] ? { note: cells[2] } : {}),
            };
            if (/tổng/i.test(cells[0])) totalEstimate = row;
            else rows.push(row);
          });
      }
    } else if (tag === "h3") {
      currentH3 = text;
    } else if (currentH3 && /\d/.test(text) && text.length < 400) {
      // Đoạn văn ngay sau h3 chứa con số → 1 hàng chi phí
      const money = parseMoneyRange(text);
      if (money.min !== null) {
        if (!currency && money.currency) currency = money.currency;
        const row: CostRow = {
          label: currentH3,
          amountMin: money.min,
          amountMax: money.max,
          unit: money.currency ? `${money.currency}/năm` : "",
        };
        if (/tổng/i.test(currentH3)) totalEstimate = row;
        else rows.push(row);
        currentH3 = ""; // mỗi h3 lấy 1 đoạn giá đầu tiên
      }
    }
    sib = nextElement(sib);
  }

  if (rows.length === 0 && !totalEstimate) {
    warnings.push("cost: có heading nhưng không parse được hàng chi phí nào");
    return null;
  }
  return {
    currency: currency || "USD",
    rows,
    ...(totalEstimate ? { totalEstimate } : {}),
  };
}

// ─── 4. Admission requirements (mục "Điều kiện nhập học") ─────────

export function parseAdmissionRequirements(
  $: cheerio.CheerioAPI,
  warnings: string[],
): SchoolAdmissionRequirements | null {
  const root = contentRoot($);
  const heading = root
    .find("h2")
    .toArray()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .find((el: any) => /điều kiện/i.test(cleanText($(el).text())));
  if (!heading) {
    warnings.push("admission: không tìm thấy heading 'Điều kiện'");
    return null;
  }

  const rows: AdmissionRow[] = [];
  let currentLevel = "";
  let sib = nextElement(heading);
  while (sib && (sib.tagName ?? "").toLowerCase() !== "h2") {
    const tag = (sib.tagName ?? "").toLowerCase();
    // Bảng trực tiếp HOẶC bọc trong wrapper (figure.wp-block-table, div...)
    const tableEls =
      tag === "table" ? [sib] : tag === "ul" ? [] : $(sib).find("table").toArray();
    if (tag === "h3") {
      currentLevel = cleanText($(sib).text()); // "Bậc Đại học"
    } else if (tableEls.length > 0) {
      for (const tableEl of tableEls) {
        const trs = $(tableEl).find("tr").toArray();
        const headers = $(trs[0]).find("th, td").toArray().map((c) => cleanText($(c).text()));
        const gpaIdx = headers.findIndex((h) => /gpa|điểm/i.test(h));
        const ieltsIdx = headers.findIndex((h) => /ielts|toefl|tiếng anh/i.test(h));
        const levelIdx = headers.findIndex((h) => /bậc|cấp|chương trình/i.test(h));

        for (const tr of trs.slice(1)) {
          const cells = $(tr).find("td, th").toArray().map((c) => cleanText($(c).text()));
          if (cells.length === 0) continue;
          const others = cells
            .map((v, i) => ({ v, i }))
            .filter(({ i }) => i !== gpaIdx && i !== ieltsIdx && i !== levelIdx)
            .map(({ v, i }) => (headers[i] ? `${headers[i]}: ${v}` : v))
            .filter(Boolean)
            .join("; ");
          rows.push({
            level: levelIdx >= 0 ? cells[levelIdx] : currentLevel || cells[0] || "—",
            ...(gpaIdx >= 0 && cells[gpaIdx] ? { gpa: truncate(cells[gpaIdx], 300) } : {}),
            ...(ieltsIdx >= 0 && cells[ieltsIdx] ? { ielts: truncate(cells[ieltsIdx], 300) } : {}),
            ...(others ? { other: truncate(others, 500) } : {}),
          });
        }
      }
    } else if (tag === "ul") {
      // Fallback: điều kiện dạng bullet dưới h3 bậc học — hoặc trực tiếp dưới h2
      // (trang format cũ như bandon-grammar-school không có bảng, không có h3)
      const items: string[] = [];
      $(sib)
        .find("li")
        .each((_, li) => {
          const t = cleanText($(li).text());
          if (t) items.push(t);
        });
      if (items.length > 0) {
        const gpa = items.find((i) => /gpa|điểm trung bình/i.test(i));
        const ielts = items.find((i) => /ielts|toefl|duolingo|tiếng anh/i.test(i));
        const other = items.filter((i) => i !== gpa && i !== ielts).join("; ");
        rows.push({
          level: currentLevel || "Chung",
          ...(gpa ? { gpa: truncate(gpa, 300) } : {}),
          ...(ielts ? { ielts: truncate(ielts, 300) } : {}),
          ...(other ? { other: truncate(other, 500) } : {}),
        });
        currentLevel = "";
      }
    }
    sib = nextElement(sib);
  }

  if (rows.length === 0) {
    warnings.push("admission: có heading nhưng không parse được hàng nào");
    return null;
  }
  return { rows };
}

// ─── 5. Content sections (toàn bộ h2/h3 → html/list/table) ────────

/** Map tiêu đề → mã mục từ TOC #toc_container ("1", "2.1", ...). */
function buildTocMap($: cheerio.CheerioAPI): Map<string, string> {
  const map = new Map<string, string>();
  $("#toc_container a").each((_, a) => {
    const num = cleanText($(a).find(".toc_number").text());
    const full = cleanText($(a).text());
    const title = cleanText(full.replace(num, ""));
    if (num && title) map.set(title.toLowerCase(), num);
  });
  return map;
}

export function parseContentSections(
  $: cheerio.CheerioAPI,
  warnings: string[],
): SchoolSection[] {
  const root = contentRoot($);
  const tocMap = buildTocMap($);
  const sections: SchoolSection[] = [];

  const headings = root.find("h2, h3").toArray();
  if (headings.length === 0) {
    warnings.push("sections: không tìm thấy heading nào trong .page-content-area");
    return sections;
  }

  for (const headingEl of headings) {
    const rawTitle = cleanText($(headingEl).text());
    if (!rawTitle) continue;
    const code = tocMap.get(rawTitle.toLowerCase());
    const title = code ? `${code}. ${rawTitle}` : rawTitle;

    const htmlParts: string[] = [];
    for (const el of elementsUntilNextHeading($, headingEl)) {
      const tag = (el.tagName ?? "").toLowerCase();
      if (tag === "table") {
        const t = tableToSection($, el, title);
        if (t) sections.push(t);
      } else if (tag === "ul" || tag === "ol") {
        const items: string[] = [];
        $(el)
          .find("li")
          .each((_, li) => {
            const t = cleanText($(li).text());
            if (t) items.push(t);
          });
        if (items.length > 0) sections.push({ type: "list", title, items });
      } else if (tag === "div" && $(el).attr("id") === "toc_container") {
        // bỏ TOC
      } else {
        const html = $.html(el);
        if (html && cleanText($(el).text())) htmlParts.push(html);
      }
    }

    const htmlContent = htmlParts.join("\n").trim();
    if (htmlContent) sections.push({ type: "html", title, content: htmlContent });
  }

  return sections;
}
