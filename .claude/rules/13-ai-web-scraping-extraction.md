# Skill 13: ai-web-scraping-extraction (Cào dữ liệu bằng AI)

# Kỹ năng: AI-Powered Web Scraping & Structured Extraction

- **KHÔNG dùng CSS Selector tĩnh cho nguồn cấp động**: Khi user nhập URL bất kỳ
  (website chính thức của trường, nguồn RSS rule 10...), KHÔNG viết Cheerio mò
  `<div>`/`<table>` — DOM mỗi trường khác nhau, selector tĩnh vỡ ngay.
  - Ngoại lệ: nguồn ĐÃ kiểm chứng cấu trúc (think.edu.vn — scrape-test xác nhận
    selector thật) thì parser tĩnh `scripts/scrape-test/parsers.ts` vẫn là lựa chọn
    rẻ và nhanh hơn. AI extraction dành cho nguồn lạ/đa dạng.
- **Quy trình chuẩn hóa (Reader + LLM)**:
  1. Biến web thành Markdown sạch qua dịch vụ reader (vd `https://r.jina.ai/[URL]`
     hoặc Firecrawl) — bỏ CSS/JS, tiết kiệm token.
  2. Truyền Markdown vào Claude API — model: `claude-opus-4-8` (mặc định) hoặc
     `claude-sonnet-5` (tiết kiệm chi phí cho extraction đơn giản).
  3. Ép output đúng schema bằng **Structured Outputs**: `output_config: { format:
     zodOutputFormat(schema) }` qua `client.messages.parse()` (SDK TypeScript) —
     KHÔNG dùng cách cũ `tool_choice`/`response_format`. Với tool use thì đặt
     `strict: true` trên tool definition.
  4. Schema đích = các Zod schema sẵn có trong `src/lib/validations.ts`
     (schoolQuickFactsSchema, schoolSectionSchema...) — kết quả LLM vẫn phải
     `safeParse` lần cuối trước khi ghi Supabase (rule 07: never trust, kể cả AI).
- Server-side: đặt code gọi Claude API trong API route/script server-only,
  `ANTHROPIC_API_KEY` trong env (khai báo tên KEY vào CLAUDE.md khi dùng);
  null-safe khi thiếu env như pattern `getSupabaseAdmin()`.
