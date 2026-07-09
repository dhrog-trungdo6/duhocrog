# Skill 3: strict-typescript-zod (Data & Validation)

- Types: TUYỆT ĐỐI không khai báo interface/type dùng chung bên trong file component.
  Toàn bộ system types tập trung 1 file duy nhất: `src/types/index.ts` (Nguyên tắc #3).
- Nguồn chuẩn enum: `STUDY_LEVELS` / `STUDY_LEVEL_LABELS` trong types — Zod enum và
  UI options đều derive từ đây, không gõ lại danh sách bậc học.
- ⚠️ State management: **KHÔNG dùng Zustand/Redux** (quyết định đã chốt của dự án —
  khác với template bên ngoài). Ưu tiên: state cục bộ + props; state cần chia sẻ theo
  URL thì dùng query param (`/tim-truong?country=`); Context chỉ khi thật cần thiết.
- Form: BẮT BUỘC `react-hook-form` + `zodResolver` cho mọi form (Nguyên tắc #5).
- API route (POST/PATCH): BẮT BUỘC validate request body bằng Zod schema trong
  `src/lib/validations.ts` TRƯỚC khi chạm database. Schema hiện có: leadFormSchema,
  leadUpdateSchema, activityInputSchema, eventInputSchema, schoolInputSchema (+schoolProgramSchema).
- Logic dùng chung đặt trong `src/lib/` (schools.ts: searchSchools/useSchools/formatUsd;
  slug.ts: slugify) — không copy-paste giữa component.
