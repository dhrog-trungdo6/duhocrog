# Skill 12: dynamic-toc-and-embeds (Mục lục động & Nhúng an toàn)

# Kỹ năng: Dynamic Table of Contents & Media Embeds

- **TOC Auto-generation**: Admin KHÔNG nhập tay Mục lục. Frontend tự vòng lặp qua
  `content_sections` (JSONB) + các section tĩnh để render khối "Nội dung bài viết
  [ẩn/hiện]" — đã triển khai: `TableOfContents` trong `/truong/[slug]` (`<details>`
  native, ẩn khi <3 mục).
  - `headingTitle` = trường `title` sẵn có của mỗi section — KHÔNG thêm trường JSONB
    trùng lặp dữ liệu.
  - `headingId` sinh deterministic từ vị trí render (`noi-dung-{n}`, section tĩnh dùng
    slug cố định `gioi-thieu`, `chi-phi`...) — id không lưu DB, đổi thứ tự không vỡ.
  - Mọi section đích phải có `scroll-mt-24` (bù header sticky).
- **Embed Safety (An toàn nhúng)**: Admin nhập link Google Maps → CHỈ lưu URL `src`
  (vd `https://www.google.com/maps/embed?pb=...`) vào cột `map_embed_url`, KHÔNG lưu
  cả thẻ `<iframe>` (nguy cơ XSS). Frontend tự bọc iframe với guard:
  - Chỉ render khi URL bắt đầu `https://` (chặn `javascript:`/`data:`).
  - `sandbox="allow-scripts allow-same-origin allow-popups"` +
    `referrerPolicy="no-referrer-when-downgrade"` + `loading="lazy"`.
  - Zod refine URL http(s) ngay tại form (schoolEditFormSchema) — chặn từ đầu vào.
- Video/embed khác trong tương lai (`video_url`, YouTube...) áp dụng cùng pattern:
  lưu URL thuần, whitelist domain khi render, không bao giờ `dangerouslySetInnerHTML`
  cho markup embed do người dùng nhập.
