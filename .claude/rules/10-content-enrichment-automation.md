# Skill 10: content-enrichment-automation (Làm giàu dữ liệu & JSONB CRUD động)

# Kỹ năng: Tự động làm giàu dữ liệu (Data Enrichment) & JSONB CRUD

- **Feed Integration (Nguồn cấp dữ liệu)**: Khi thiết kế DB cho một thực thể (vd
  `schools`), luôn dự trù cột định tuyến nguồn: `website_url` (đã có), `official_rss_url`,
  `auto_sync_enabled`... — cơ sở để n8n bên ngoài biết cần "theo dõi" trang nào.
- **Webhook Ingestion Pattern (Luồng nạp dữ liệu động)**:
  - Nhận tin tức/thông báo mới từ n8n qua webhook: KHÔNG overwrite dữ liệu cũ.
  - Dùng AI backend (Claude API) tóm tắt/chuyển HTML rác về đúng chuẩn `SchoolSection`
    (JSONB discriminated union) — payload ra vẫn qua Zod (rule 07).
  - Append vào mảng `content_sections` hiện tại (SQL `||` nối jsonb array hoặc
    `jsonb_insert`), vd mục "Tin tức cập nhật từ trường" — không thay cả mảng.
- **Advanced Admin CRUD (Giao diện quản trị phức tạp)**:
  - Form sửa trường KHÔNG làm dạng form dọc đơn giản (dữ liệu quá dài). BẮT BUỘC chia
    Tabs: (1) Tổng quan · (2) Quick Facts & Chi phí · (3) Content Builder cho JSONB
    `content_sections` · (4) Cấu hình Automation (RSS/website để bot cào).
  - BẮT BUỘC `useFieldArray` (react-hook-form) cho mảng động: Thêm Section, Thêm
    Hàng/Cột cho bảng — validate bằng schema Zod JSONB sẵn có trong
    `src/lib/validations.ts` (schoolSectionSchema, schoolCostBreakdownSchema...).
  - Chia nhỏ sub-component theo tab (BasicInfoTab, ContentBuilderTab...) — mỗi file
    không vượt ~300 dòng (rule 06).
