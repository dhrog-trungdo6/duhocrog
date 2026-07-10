/**
 * Sanitize HTML tối giản cho content_sections (type "html") trước khi
 * dangerouslySetInnerHTML ở trang trường chi tiết.
 *
 * Nguồn dữ liệu là service-role (admin/crawler nội bộ) — KHÔNG phải input người dùng —
 * nên chỉ cần lớp phòng vệ cơ bản: bỏ script/style/iframe/object, event handler on*,
 * và URL javascript:. Nếu sau này cho phép nội dung từ nguồn không tin cậy,
 * thay bằng thư viện sanitize chuyên dụng.
 */
export function sanitizeHtml(html: string): string {
  return (
    html
      // Bỏ nguyên khối tag nguy hiểm (kèm nội dung)
      .replace(/<(script|style|iframe|object|embed|form)\b[\s\S]*?<\/\1>/gi, "")
      .replace(/<(script|style|iframe|object|embed|form)\b[^>]*\/?>/gi, "")
      // Bỏ event handler on*="..."
      .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      // Vô hiệu javascript: trong href/src
      .replace(/\s(href|src)\s*=\s*(["']?)\s*javascript:[^"'\s>]*\2/gi, "")
  );
}
