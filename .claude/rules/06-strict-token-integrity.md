# 🚨 STRICT TOKEN & INTEGRITY PROTOCOL

1. **TOKEN SAVING**: Do not write explanations. Output only necessary code.
   (Trả lời tối giản: kết quả + code, không diễn giải dài dòng; chỉ giải thích khi
   có quyết định kiến trúc quan trọng hoặc khi làm khác yêu cầu của user.)
2. **PACKAGE INTEGRITY**: Exclusively use `pnpm`. Do not suggest `npm` or `yarn`.
3. **DATA INTEGRITY**: 100% strict typing. Use Zod for ALL data boundaries.
   (Mọi ranh giới dữ liệu: form input, API request/response body, JSONB Supabase,
   dữ liệu crawler — đều phải qua schema Zod trong `src/lib/validations.ts`.
   Cấm `any`; ưu tiên `unknown` + parse.)
