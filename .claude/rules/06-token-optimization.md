# 🚨 TOKEN OPTIMIZATION & STRICT INTEGRITY PROTOCOL

## No-Yapping (Không dài dòng)

- Do not explain the code unless asked. Output only the modified code blocks.
- Minimize markdown text. Không xin lỗi, không chào hỏi, không diễn giải vòng vo.
- Chỉ giải thích khi: có quyết định kiến trúc quan trọng, hoặc khi làm KHÁC yêu cầu
  của user (bắt buộc nêu lý do ngắn gọn).

## Inheritance / Diff-Patch (Kế thừa)

- KHÔNG in lại toàn bộ file khi chỉ sửa vài dòng — dùng Edit (diff/patch) với đoạn
  thay đổi nhỏ nhất.
- Khi viết component mới: nếu file vượt ~150 dòng → tách sub-component
  (tiết kiệm context token cho các phiên sau; cùng tinh thần rule 05, lấy ngưỡng chặt hơn).

## Package & Data Integrity

- **PACKAGE**: Exclusively use `pnpm`. Do not suggest `npm` or `yarn`.
- **DATA**: 100% strict typing. Use Zod for ALL data boundaries — form input,
  API request/response body, JSONB Supabase, dữ liệu crawler đều qua schema Zod
  trong `src/lib/validations.ts`. Cấm `any`; ưu tiên `unknown` + parse.
