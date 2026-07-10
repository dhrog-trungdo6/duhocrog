/**
 * Map quốc gia think.edu.vn → Country['code'] của dự án (lowercase).
 * 2 nguồn nhận diện: (1) slug trong href /danh-sach-truong/{country-slug}/,
 * (2) text tên quốc gia (fallback).
 */

/** Slug danh mục quốc gia trên think.edu.vn → code dự án */
export const THINK_COUNTRY_SLUG_TO_CODE: Record<string, string> = {
  my: "us",
  canada: "ca",
  uc: "au",
  anh: "uk",
  singapore: "sg",
  "new-zealand": "nz",
  ireland: "ie",
  "ai-len": "ie",
  "thuy-si": "ch",
  phap: "fr",
  malaysia: "my",
  philippines: "ph",
  "thai-lan": "th",
  duc: "de",
  "ha-lan": "nl",
  "han-quoc": "kr",
  "nhat-ban": "jp",
};

/** Tên quốc gia (đã lowercase, bỏ dấu hoặc còn dấu) → code dự án */
export const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  "mỹ": "us", "hoa kỳ": "us", "hoa ky": "us", america: "us", "united states": "us", usa: "us",
  canada: "ca",
  "úc": "au", uc: "au", australia: "au",
  anh: "uk", "anh quốc": "uk", uk: "uk", "united kingdom": "uk",
  singapore: "sg",
  "new zealand": "nz",
  ireland: "ie", "ai len": "ie", "ái nhĩ lan": "ie",
  "thụy sĩ": "ch", "thuy si": "ch", switzerland: "ch",
  "pháp": "fr", phap: "fr", france: "fr",
  malaysia: "my",
  philippines: "ph",
  "thái lan": "th", "thai lan": "th", thailand: "th",
  "đức": "de", duc: "de", germany: "de",
  "hà lan": "nl", netherlands: "nl",
  "hàn quốc": "kr", korea: "kr",
  "nhật bản": "jp", japan: "jp",
};

/** Nhận diện country code từ href danh mục hoặc text tên — trả "" nếu không xác định. */
export function detectCountryCode(href: string | undefined, nameText: string | undefined): string {
  if (href) {
    const m = href.match(/\/danh-sach-truong\/([a-z0-9-]+)\/?/);
    if (m && THINK_COUNTRY_SLUG_TO_CODE[m[1]]) return THINK_COUNTRY_SLUG_TO_CODE[m[1]];
  }
  if (nameText) {
    const key = nameText.trim().toLowerCase();
    if (COUNTRY_NAME_TO_CODE[key]) return COUNTRY_NAME_TO_CODE[key];
  }
  return "";
}
