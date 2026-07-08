/**
 * Thông tin thương hiệu tập trung — TODO: điền giá trị thật trước khi go-live.
 * Mọi component PHẢI lấy hotline/email/địa chỉ từ đây, KHÔNG hardcode.
 */
export const siteConfig = {
  name: "ROG Education",
  shortName: "Du học ROG",
  description:
    "ROG Education — Nền tảng tư vấn du học uy tín: Anh, Úc, Mỹ, Canada, Singapore, New Zealand... Tìm trường & học bổng phù hợp, xử lý hồ sơ visa nhanh chóng.",
  url: "https://duhocrog.com", // TODO: cập nhật domain thật
  hotline: "0909 000 000", // TODO: điền số hotline thật
  hotlineHref: "tel:+84909000000", // TODO: đồng bộ với hotline
  zalo: "https://zalo.me/0909000000", // TODO: điền link Zalo thật
  email: "info@duhocrog.com", // TODO: điền email thật
  address: "123 Đường ABC, Phường X, Quận Y, TP. Hồ Chí Minh", // TODO: điền địa chỉ thật
  social: {
    facebook: "https://facebook.com/duhocrog", // TODO
    youtube: "https://youtube.com/@duhocrog", // TODO
    tiktok: "https://tiktok.com/@duhocrog", // TODO
  },
} as const;

export type SiteConfig = typeof siteConfig;
