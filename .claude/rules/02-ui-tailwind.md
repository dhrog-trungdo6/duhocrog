# Skill 2: rog-ui-tailwind-master (Styling & Design System)

- CẤM: Material UI, Ant Design, Chakra UI và mọi UI framework nặng (Nguyên tắc #2).
- Cho phép: Tailwind CSS v3 thuần + `@radix-ui/react-*` (Slider, Dialog, Accordion...)
  + `lucide-react` cho icon (brand icon Facebook/YouTube/TikTok dùng SVG inline — lucide đã gỡ).
- Màu sắc: KHÔNG hardcode hex trong className (cấm `bg-[#005BAA]`). CHỈ dùng token
  trong `tailwind.config.ts`:
  `primary` #005BAA · `primary-light` #0078D7 · `primary-dark` #004A8C ·
  `accent` #DC2626 · `accent-orange` #FF6B00 · `navy` #0B2545
- Ảnh: dùng `next/image` với guard placeholder khi URL rỗng (xem `ArticleThumbnail`
  trong StudyAbroadMegaMenu — gradient + chữ cái đầu).
- Thông tin thương hiệu (hotline, email, Zalo, địa chỉ, social): CHỈ import từ
  `src/config/site.ts` — không hardcode trong component (Nguyên tắc #7).
- Font: Be Vietnam Pro qua `next/font` (đã cấu hình ở layout).
