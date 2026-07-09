/**
 * Sinh slug URL từ tên: "Sorbonne Université" → "sorbonne-universite".
 * Dùng cho trang trường chi tiết /truong/[slug] — admin API tự gọi khi slug bỏ trống.
 */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu combining (tiếng Việt + Latin)
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
