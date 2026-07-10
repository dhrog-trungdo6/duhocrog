# Skill 5: rog-architecture-patcher (Bảo vệ kiến trúc)

- KHÔNG tự ý xóa, đổi tên, hoặc ghi đè file/module đã có — chỉ patch/extend (Nguyên tắc #1).
- KHÔNG đập đi xây lại: sửa đổi phải là diff nhỏ nhất đạt mục tiêu.
- Layout gốc `src/app/layout.tsx`: giữ nguyên `<ErrorBoundary>` bọc toàn trang,
  Header + Footer + FloatingCTA — không gỡ wrapper khi thêm tính năng (Nguyên tắc #4).
- Sửa header: CHỈ sửa `src/components/layout/RogHeader.tsx` (và
  `StudyAbroadMegaMenu.tsx` cho nội dung mega menu) — tuyệt đối không tạo `Header.tsx` mới.
- Mock data: đặt trong `src/data/*.ts` dạng typed array — KHÔNG hardcode trong JSX
  (Nguyên tắc #8). Data derive được (vd `studyAbroadMenuData`) thì `.map()` từ nguồn
  chuẩn (`destinations`), không chép tay 2 bản.
- Component quá ~200 dòng → cân nhắc tách sub-component (như đã tách MegaMenu khỏi Header).
- **JSONB Renderer Rule**: conditional rendering phức tạp cho dữ liệu JSONB
  (`content_sections`, `cost_breakdown`, `admission_requirements`...) phải tách thành
  pure function hoặc sub-component riêng — không viết inline trong page. Map data state
  bằng **discriminated union** nghiêm ngặt (vd `SchoolSection` union theo `type:
  "html" | "list" | "table"`, switch có `default` exhaustive-check) — mẫu chuẩn:
  `ContentSectionBlock` ở trang `/truong/[slug]`.
- Trước khi kết thúc task: `pnpm build` 0 lỗi; commit message tiếng Việt theo
  conventional (feat/fix/docs/refactor); push bằng
  `git -c credential.helper='!gh auth git-credential' push`.
