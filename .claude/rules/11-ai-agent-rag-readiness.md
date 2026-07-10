# Skill 11: ai-agent-rag-readiness (Tối ưu dữ liệu cho AI Agent & RAG)

# Kỹ năng: AI Agent & RAG Readiness

- **Data Isolation cho AI (Tách bạch dữ liệu)**: Chatbot LLM tốn token và dễ "ảo giác"
  khi đọc HTML thô. Khi Admin lưu nội dung trường (Tab Content), backend BẮT BUỘC
  trích xuất bản `plain_text_summary` (văn bản thuần, strip HTML từ `content_sections`)
  lưu vào cột riêng — hoặc dùng làm nguồn tạo Vector Embeddings (`pgvector`) khi
  triển khai RAG. Cột này chỉ ghi từ server (API route/trigger), không cho client sửa tay.
- **Faceted Filtering (Phân loại tiêu chí)**: Để chatbot "tìm trường theo tiêu chí"
  (học phí < 30k, bang California, bậc đại học...), các tiêu chí lọc KHÔNG ĐƯỢC giấu
  trong JSONB. Bắt buộc nằm ở cột vật lý có index — hiện có: `tuition_usd`, `country`,
  `province`, `level` (composite index migration #1), `scholarship_up_to`, `is_active`.
  Thêm tiêu chí lọc mới → thêm CỘT + index, không nhét vào `quick_facts`.
- JSONB (`content_sections`, `quick_facts`...) chỉ dành cho dữ liệu HIỂN THỊ,
  không phải dữ liệu QUERY. Nguyên tắc: "AI query bằng cột phẳng, AI đọc bằng
  plain text, người đọc bằng JSONB render".
