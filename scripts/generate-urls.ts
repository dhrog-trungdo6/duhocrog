/**
 * Sinh danh sách URL trường từ think.edu.vn — nguồn: trang tổng hợp
 * https://think.edu.vn/danh-sach-truong/ (card `.post-item.school-item`).
 *
 * v3 — FULL COVERAGE (~1060 trường): trang chỉ render tĩnh 10 card đầu, phần còn
 * lại load qua nút "Xem thêm" → POST wp-admin/admin-ajax.php action=loadmore_schools
 * (page=1..max_page-1, max_page đọc động từ `data-max_page` của nút — hiện 106).
 * Bậc học của TỪNG trường parse từ excerpt card (link /danh-sach-truong/{level}),
 * không còn phụ thuộc 5 trang danh mục như v2.
 *
 * Run: pnpm tsx scripts/generate-urls.ts
 * Output: scripts/urls.json — [{ url, levels: ["thpt", ...] }]
 */
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";

const USER_AGENT = "ROG-Edu-ScrapeTest/1.0 (education data research; contact: info@duhocrog.com)";
const DELAY_MS = 2_000;
const LIST_URL = "https://think.edu.vn/danh-sach-truong/";
const AJAX_URL = "https://think.edu.vn/wp-admin/admin-ajax.php";

/** Slug bậc học think.edu.vn → StudyLevel code của dự án (src/types STUDY_LEVELS) */
const LEVEL_MAP: Record<string, string> = {
  thpt: "thpt",
  "cao-dang": "cao-dang",
  "dai-hoc": "dai-hoc",
  "du-bi-dai-hoc": "dai-hoc", // dự bị đại học — gần nhất với dai-hoc trong enum dự án
  "sau-dai-hoc": "sau-dai-hoc",
  "hoc-tieng": "anh-ngu",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Parse mọi card trường trong 1 đoạn HTML (trang tĩnh hoặc fragment AJAX) */
function parseCards(html: string, found: Map<string, Set<string>>): number {
  const $ = cheerio.load(html);
  let count = 0;
  $(".post-item.school-item").each((_, card) => {
    const href = $(card).find(".post-title a[href]").first().attr("href") ?? "";
    const m = href.match(/^https:\/\/think\.edu\.vn\/([a-z0-9-]+)\/?$/);
    if (!m || m[1] === "danh-sach-truong") return;
    const url = `https://think.edu.vn/${m[1]}/`;
    if (!found.has(url)) found.set(url, new Set());

    // Bậc học: link excerpt dạng /danh-sach-truong/{level-slug} (không có segment con)
    $(card)
      .find(".post-excerpt a[href]")
      .each((_i, a) => {
        const lm = ($(a).attr("href") ?? "").match(/danh-sach-truong\/([a-z-]+)\/?$/);
        const code = lm ? LEVEL_MAP[lm[1]] : undefined;
        if (code) found.get(url)!.add(code);
      });
    count++;
  });
  return count;
}

async function main() {
  // url → set level codes (1 trường có thể xuất hiện ở nhiều bậc học)
  const found = new Map<string, Set<string>>();

  // 1. Trang tĩnh: 10 card đầu + max_page của nút "Xem thêm"
  console.log(`[static] ${LIST_URL}`);
  const res = await axios.get(LIST_URL, { headers: { "User-Agent": USER_AGENT }, timeout: 20_000 });
  const html = String(res.data);
  const staticCount = parseCards(html, found);
  const maxPage = Number(cheerio.load(html)(".loadmore-school").attr("data-max_page") ?? 0);
  console.log(`   → ${staticCount} card tĩnh | max_page=${maxPage}`);
  if (!maxPage || maxPage < 2) throw new Error("Không đọc được data-max_page từ nút Xem thêm");

  // 2. AJAX loadmore: page=1..max_page-1 (page N trả về batch KẾ TIẾP trang hiện tại)
  for (let page = 1; page < maxPage; page++) {
    try {
      const body = new URLSearchParams({
        action: "loadmore_schools",
        "query[post_type]": "post",
        "query[post_status]": "publish",
        "query[meta_query][relation]": "AND",
        "query[meta_query][0][key]": "school",
        "query[meta_query][0][value]": "school",
        "query[meta_query][0][compare]": "LIKE",
        page: String(page),
      });
      const ajaxRes = await axios.post(AJAX_URL, body.toString(), {
        headers: {
          "User-Agent": USER_AGENT,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 20_000,
      });
      const count = parseCards(String(ajaxRes.data), found);
      console.log(`[${page}/${maxPage - 1}] → ${count} card (unique tổng: ${found.size})`);
      if (count === 0) {
        console.log("   (fragment rỗng — hết dữ liệu, dừng sớm)");
        break;
      }
    } catch (err) {
      console.error(`[${page}] ❌ ${err instanceof Error ? err.message : "fetch fail"}`);
    }
    if (page < maxPage - 1) await sleep(DELAY_MS);
  }

  const output = Array.from(found.entries())
    .map(([url, levels]) => ({ url, levels: Array.from(levels).sort() }))
    .sort((a, b) => a.url.localeCompare(b.url));

  const outFile = path.resolve(__dirname, "urls.json");
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\n✅ ${output.length} trường → ${outFile}`);
  output.slice(0, 5).forEach((o) => console.log(`   ${o.url} [${o.levels.join(", ")}]`));
}

main().catch(console.error);
