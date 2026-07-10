/**
 * Sinh danh sách URL trường từ think.edu.vn — nguồn: các trang danh mục theo bậc học
 * https://think.edu.vn/danh-sach-truong/{level}/ (card `.schools .post-item.school-item`).
 *
 * Ưu điểm so với cào link trang chủ (bản cũ): không dính rác (javascript:;, tel:,
 * trang chính sách/blog) và biết được BẬC HỌC thật của từng trường thay vì hardcode.
 *
 * ⚠️ Giới hạn: mỗi trang danh mục chỉ render tĩnh 10 trường đầu, phần còn lại load
 * bằng nút AJAX "Xem thêm" (admin-ajax). Phase này lấy 10/level là đủ dữ liệu test;
 * khi cần đầy đủ sẽ bổ sung gọi admin-ajax phân trang (robots.txt cho phép).
 *
 * Run: pnpm tsx scripts/generate-urls.ts
 * Output: scripts/urls.json — [{ url, levels: ["thpt", ...] }]
 */
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import axios from "axios";

const USER_AGENT = "ROG-Edu-ScrapeTest/1.0 (education data research; contact: info@duhocrog.com)";
const DELAY_MS = 3_000;

/** Slug danh mục think.edu.vn → StudyLevel code của dự án */
const LEVEL_PAGES: Record<string, string> = {
  thpt: "thpt",
  "cao-dang": "cao-dang",
  "dai-hoc": "dai-hoc",
  "sau-dai-hoc": "sau-dai-hoc",
  "hoc-tieng": "anh-ngu",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  // url → set level codes (1 trường có thể xuất hiện ở nhiều bậc học)
  const found = new Map<string, Set<string>>();

  const slugs = Object.keys(LEVEL_PAGES);
  for (let i = 0; i < slugs.length; i++) {
    const catSlug = slugs[i];
    const levelCode = LEVEL_PAGES[catSlug];
    const pageUrl = `https://think.edu.vn/danh-sach-truong/${catSlug}/`;
    console.log(`[${i + 1}/${slugs.length}] ${pageUrl}`);

    try {
      const res = await axios.get(pageUrl, {
        headers: { "User-Agent": USER_AGENT },
        timeout: 20_000,
      });
      const $ = cheerio.load(String(res.data));

      let count = 0;
      $(".schools .school-item a[href], .post-item.school-item a[href]").each((_, el) => {
        const href = $(el).attr("href") ?? "";
        // Chỉ nhận trang trường dạng https://think.edu.vn/{slug}/ (1 cấp path)
        const m = href.match(/^https:\/\/think\.edu\.vn\/([a-z0-9-]+)\/?$/);
        if (!m || m[1] === "danh-sach-truong") return;
        const url = `https://think.edu.vn/${m[1]}/`;
        if (!found.has(url)) found.set(url, new Set());
        found.get(url)!.add(levelCode);
        count++;
      });
      console.log(`   → ${count} link card (unique tổng: ${found.size})`);
    } catch (err) {
      console.error(`   ❌ ${err instanceof Error ? err.message : "fetch fail"}`);
    }

    if (i < slugs.length - 1) await sleep(DELAY_MS);
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
