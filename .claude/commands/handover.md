# System Handover Manifest — Du học ROG

Xuất bản bàn giao kỹ thuật siêu cô đọng để chuyển tiếp sang phiên chat mới,
**đồng thời ghi đè trực tiếp vào mục `## 📝 CẬP NHẬT GẦN NHẤT & HÀNH ĐỘNG TIẾP THEO` trong `CLAUDE.md`**.

---

## Bước 1 — Đọc trạng thái thực tế

Chạy song song:
```bash
git status --short && git log --oneline -5
find src -type f -name "*.ts" -o -name "*.tsx" | sort
ls supabase/migrations/
pnpm build 2>&1 | tail -30
pnpm lint 2>&1 | tail -5
```

Kiểm tra thêm (KHÔNG in giá trị secret ra chat):
- `.env.local` có những KEY nào (`grep -oE '^[A-Z_]+' .env.local`)
- `.vercel/` tồn tại chưa (đã link Vercel?)
- Nếu server chạy được: test nhanh các endpoint read-only (`/api/events`, `/api/schools`, `/api/leads` không cookie phải trả 401)

---

## Bước 2 — Tạo nội dung Manifest

Dựa trên kết quả Bước 1, điền vào template sau (ngắn gọn tối đa):

```
## 📦 DU HỌC ROG — SYSTEM HANDOVER MANIFEST
> **Trạng thái:** [1 dòng mô tả tiến độ hiện tại]
> **Build/Lint:** [CLEAN / N lỗi — liệt kê ngắn]
> **Ngày:** $CURRENT_DATE

### 1. Trạng thái Modules

| Module | Trạng thái | Files chính |
|--------|-----------|-------------|
| Homepage (13 sections) | ✅/⏳/❌ | src/app/page.tsx |
| ⭐ SchoolFinder | ✅/⏳/❌ | src/components/home/SchoolFinder.tsx |
| EventsTabs | ✅/⏳/❌ | src/components/home/EventsTabs.tsx |
| Lead Capture API | ✅/⏳/❌ | src/app/api/leads/route.ts |
| Admin CRM | ✅/⏳/❌ | src/app/admin/ + src/components/admin/ |
| Admin Auth | ✅/⏳/❌ | src/middleware.ts + src/lib/admin-auth.ts |
| Supabase schema | ✅/⏳/❌ | supabase/migrations/ — [đã/chưa apply cloud] |
[thêm dòng cho module mới phát sinh]

### 2. API Routes

| Route | Method | Trạng thái | Ghi chú |
|-------|--------|-----------|---------|
| /api/leads | POST / GET | ✅/❌ | GET cần admin cookie |
| /api/leads/[id] | PATCH | ✅/❌ | |
| /api/events | GET | ✅/❌ | public |
| /api/schools | GET | ✅/❌ | public |
| /api/admin/login · logout | POST | ✅/❌ | |
| /api/admin/events (+[id]) | CRUD | ✅/❌ | |
| /api/admin/schools (+[id]) | CRUD | ✅/❌ | |
[thêm route mới phát sinh]

### 3. Hạ tầng & Tích hợp bên ngoài

GitHub  : [trạng thái push — local vs origin/main]
Vercel  : [đã link/deploy chưa]
Supabase: [đã kết nối chưa; bảng nào có data; migration nào chưa apply]
Env     : [KEY nào có trong .env.local — CHỈ tên key, KHÔNG giá trị]

### 4. Data Contract Quan Trọng

[Chỉ liệt kê contract/type đã THAY ĐỔI so với CLAUDE.md — bỏ qua những gì không đổi]

### 5. Nguyên tắc chưa implement / cần kiểm tra

- [ ] hoặc [x] từng nguyên tắc trong 8 nguyên tắc bất biến
- [ ] Các vấn đề đang mở khác (lead test cần xóa, placeholder chưa thay...)

### 6. Files Quan Trọng Chưa Tồn Tại

[Liệt kê file cần tạo, ưu tiên cao → thấp]

### 7. Next Steps (3 việc làm ngay khi mở phiên mới)

1. **[Việc 1]** — [lý do ưu tiên]
2. **[Việc 2]** — [lý do ưu tiên]
3. **[Việc 3]** — [lý do ưu tiên]

### Change Log

| Ngày | Giai đoạn | Thay đổi |
|------|-----------|---------|
| [date] | [tên giai đoạn] | [mô tả ngắn] |
[giữ lại các dòng log cũ — chỉ thêm dòng mới lên đầu]
```

---

## Bước 3 — GHI ĐÈ vào CLAUDE.md ⚡

**BẮT BUỘC:** Sau khi tạo xong nội dung Manifest, dùng công cụ Edit để **thay thế toàn bộ** nội dung từ dòng `## 📝 CẬP NHẬT GẦN NHẤT & HÀNH ĐỘNG TIẾP THEO` đến hết file `CLAUDE.md` bằng nội dung mới gồm:

1. Header section với cảnh báo không sửa tay (format cố định bên dưới)
2. Bảng Trạng thái Modules (từ mục 1 Manifest)
3. Bảng API Routes (từ mục 2 Manifest) — đồng thời cập nhật section `## Trạng thái API Routes` giữa file nếu đã lỗi thời
4. Hạ tầng & Tích hợp (từ mục 3 Manifest) — đồng thời cập nhật section `## Hạ tầng & Tích hợp bên ngoài` giữa file nếu đã lỗi thời
5. Next Steps (từ mục 7 Manifest)
6. Change Log (**cộng dồn, không xóa log cũ** — tối đa 20 dòng)

**Format header cố định (không thay đổi):**
```
## 📝 CẬP NHẬT GẦN NHẤT & HÀNH ĐỘNG TIẾP THEO

> ⚙️ **Mục này được tự động ghi đè bởi lệnh `/handover`.**
> Không sửa tay — mọi thay đổi sẽ bị overwrite lần `/handover` tiếp theo.
> Trigger: khi context > 70% HOẶC khi kết thúc một giai đoạn lập trình lớn.
```

---

## Bước 4 — In Manifest ra chat

Sau khi đã ghi vào CLAUDE.md xong, in toàn bộ Manifest ra chat để người dùng copy
cho phiên mới, kèm prompt tái khởi động:

> **Prompt tái khởi động cho phiên mới:**
> ```
> Bạn là Kiến Trúc Sư Trưởng dự án ROG Education — Du học ROG (duhocrog.com).
> Đọc file CLAUDE.md trong repo, sau đó đọc Manifest dưới đây.
> Xác nhận đã nắm kiến trúc và sẵn sàng tiếp tục.
>
> [DÁN MANIFEST Ở ĐÂY]
> ```

---

## Cơ chế tự động (Auto-Sync)

**Khi nào trigger `/handover` tự động:**
- Khi context window ước tính > 70% (nhận biết qua số lượng turn và độ dài hội thoại)
- Khi vừa hoàn thành một giai đoạn lập trình lớn (xong một module, một nhóm API route, một trang mới)
- Khi người dùng ra lệnh "compact", "chuyển phiên", "handover", "lưu trạng thái"

**Thứ tự ưu tiên ghi:**
1. Ghi vào CLAUDE.md TRƯỚC (đảm bảo không mất nếu context bị cắt)
2. Sau đó mới in ra chat

**Quy tắc Change Log:**
- Mỗi lần ghi thêm 1 dòng mới vào đầu bảng Change Log
- Giữ nguyên tối đa 20 dòng log gần nhất — xóa dòng cũ hơn nếu vượt
- Format: `| YYYY-MM-DD | Tên giai đoạn | Mô tả ngắn ≤ 80 ký tự |`

**Quy tắc an toàn:**
- KHÔNG bao giờ in giá trị secret (.env.local) ra chat hoặc ghi vào CLAUDE.md — chỉ tên KEY
- KHÔNG xóa nội dung CLAUDE.md phía trên mục `## 📝 CẬP NHẬT GẦN NHẤT`
