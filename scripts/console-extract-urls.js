/**
 * 🖥️ ROG Education — Browser Console Snippet
 * ============================================
 * Mục đích: Trích xuất tất cả URL trang chi tiết trường học từ think.edu.vn
 *
 * CÁCH DÙNG:
 * 1. Mở https://think.edu.vn (trang danh sách trường)
 * 2. Click "Xem thêm" cho đến khi load hết tất cả trường
 * 3. Mở DevTools (F12) → Tab Console
 * 4. Copy-paste TOÀN BỘ script này → Enter
 * 5. Kết quả JSON sẽ hiện trong console → Copy lưu thành file urls.json
 *
 * ⚠️ NẾU SELECTOR KHÔNG KHỚP:
 *    - Inspect 1 link trường học, tìm class/phần tử cha
 *    - Sửa SELECTORS bên dưới cho khớp với HTML thực tế
 *    - Chạy lại script
 */

(function extractSchoolUrls() {
  // ─── CẤU HÌNH SELECTOR ───────────────────────────────
  // TODO: User tự sửa các selector này sau khi inspect DOM thực tế
  const SELECTORS = [
    // Các pattern phổ biến cho link danh sách trường:
    'a[href*="/truong/"]', // Link chứa /truong/ trong href
    'a[href*="/school/"]', // Link chứa /school/
    '.school-item a', // Class .school-item bọc link
    '.school-card a', // Card layout
    '.university-list a', // List layout
    '.list-school a', // Tiếng Việt
    '[class*="school"] a[href]', // Bất kỳ class nào chứa "school"
  ];

  // ─── THỰC THI ───────────────────────────────────────
  const urls = new Set(); // Dùng Set để tự động deduplicate

  for (const selector of SELECTORS) {
    try {
      const links = document.querySelectorAll(selector);
      links.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href) return;

        // Chuẩn hóa URL: bỏ hash, query params tracking
        let url = href.trim();

        // Chuyển relative → absolute
        if (url.startsWith("/")) {
          url = window.location.origin + url;
        }

        // Bỏ fragment (#section) và tracking params (utm_*, fbclid, ...)
        try {
          const parsed = new URL(url);
          parsed.hash = "";
          // Xóa tracking params phổ biến
          const trackingParams = [
            "utm_source",
            "utm_medium",
            "utm_campaign",
            "utm_term",
            "utm_content",
            "fbclid",
            "gclid",
            "ref",
            "source",
          ];
          trackingParams.forEach((p) => parsed.searchParams.delete(p));
          url = parsed.toString();
        } catch {
          // Nếu URL không hợp lệ, giữ nguyên
        }

        // Chỉ lấy link chi tiết (không phải link filter/search)
        if (
          url.includes("/truong/") ||
          url.includes("/school/") ||
          url.includes("/university/") ||
          url.includes("/college/")
        ) {
          urls.add(url);
        }
      });
    } catch (err) {
      console.warn("Selector failed:", selector, err);
    }
  }

  // ─── KẾT QUẢ ─────────────────────────────────────────
  const urlArray = Array.from(urls);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 Tổng số URL tìm thấy:", urlArray.length);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (urlArray.length === 0) {
    console.warn(
      "⚠️  KHÔNG TÌM THẤY URL NÀO!\n" +
        "👉 Hãy inspect DOM và cập nhật biến SELECTORS trong script.\n" +
        "👉 Tìm class của container chứa danh sách trường (VD: .school-grid, .list-items)"
    );
    console.log("📋 Gợi ý: thử các selector sau (paste từng dòng vào console để test):");
    console.log('  document.querySelectorAll("a[href]")');
    console.log(
      '  Array.from(document.querySelectorAll("a[href]")).filter(a => a.href.includes("truong"))'
    );
    return;
  }

  // In JSON để copy
  console.log(JSON.stringify(urlArray, null, 2));

  // Đồng thời tạo download link
  const blob = new Blob([JSON.stringify(urlArray, null, 2)], {
    type: "application/json",
  });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = "urls.json";
  a.textContent = "📥 Click để tải urls.json";
  a.style.cssText =
    "display:block;padding:12px 20px;margin:10px 0;background:#005BAA;color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px;";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  // Thống kê nhanh theo domain
  const domainCounts = {};
  urlArray.forEach((u) => {
    try {
      const domain = new URL(u).hostname;
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    } catch {}
  });
  console.log("📈 Phân bố theo domain:", domainCounts);

  console.log("✅ Hoàn tất! File urls.json đã được tải xuống.");
  console.log("➡️  Tiếp theo: chạy `pnpm tsx scripts/crawler.ts`");
})();