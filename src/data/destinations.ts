import type { Country, Province, ServiceMenuItem } from "@/types";

/** Danh sách quốc gia du học — thay `flag` + gradient bằng ảnh thật khi có. */
export const destinations: Country[] = [
  { code: "us", name: "Du học Mỹ", flag: "🇺🇸", gradient: "from-blue-600 to-red-500" },
  { code: "ca", name: "Du học Canada", flag: "🇨🇦", gradient: "from-red-500 to-red-700" },
  { code: "au", name: "Du học Úc", flag: "🇦🇺", gradient: "from-blue-700 to-indigo-600" },
  { code: "uk", name: "Du học Anh", flag: "🇬🇧", gradient: "from-blue-800 to-red-600" },
  { code: "sg", name: "Du học Singapore", flag: "🇸🇬", gradient: "from-red-500 to-rose-400" },
  { code: "ie", name: "Du học Ireland", flag: "🇮🇪", gradient: "from-green-600 to-orange-400" },
  { code: "nz", name: "Du học New Zealand", flag: "🇳🇿", gradient: "from-blue-900 to-sky-600" },
  { code: "ch", name: "Du học Thụy Sĩ", flag: "🇨🇭", gradient: "from-red-600 to-red-400" },
  { code: "fr", name: "Du học Pháp", flag: "🇫🇷", gradient: "from-blue-700 to-red-500" },
  { code: "my", name: "Du học Malaysia", flag: "🇲🇾", gradient: "from-yellow-500 to-blue-700" },
  { code: "ph", name: "Du học Philippines", flag: "🇵🇭", gradient: "from-blue-600 to-yellow-500" },
  { code: "th", name: "Du học Thái Lan", flag: "🇹🇭", gradient: "from-red-500 to-blue-800" },
];

/** Tỉnh bang / thành phố theo quốc gia — dùng cho cascading select của SchoolFinder. */
export const provinces: Province[] = [
  // Mỹ
  { code: "us-ca", name: "California", countryCode: "us" },
  { code: "us-ny", name: "New York", countryCode: "us" },
  { code: "us-tx", name: "Texas", countryCode: "us" },
  { code: "us-ma", name: "Massachusetts", countryCode: "us" },
  // Canada
  { code: "ca-on", name: "Ontario", countryCode: "ca" },
  { code: "ca-bc", name: "British Columbia", countryCode: "ca" },
  { code: "ca-qc", name: "Québec", countryCode: "ca" },
  // Úc
  { code: "au-nsw", name: "New South Wales", countryCode: "au" },
  { code: "au-vic", name: "Victoria", countryCode: "au" },
  { code: "au-qld", name: "Queensland", countryCode: "au" },
  // Anh
  { code: "uk-ldn", name: "London", countryCode: "uk" },
  { code: "uk-man", name: "Manchester", countryCode: "uk" },
  { code: "uk-bir", name: "Birmingham", countryCode: "uk" },
  // Singapore
  { code: "sg-sg", name: "Singapore", countryCode: "sg" },
  // Ireland
  { code: "ie-dub", name: "Dublin", countryCode: "ie" },
  // New Zealand
  { code: "nz-akl", name: "Auckland", countryCode: "nz" },
  { code: "nz-wlg", name: "Wellington", countryCode: "nz" },
  // Thụy Sĩ
  { code: "ch-zh", name: "Zürich", countryCode: "ch" },
  { code: "ch-ge", name: "Geneva", countryCode: "ch" },
  // Pháp
  { code: "fr-par", name: "Paris", countryCode: "fr" },
  { code: "fr-lyo", name: "Lyon", countryCode: "fr" },
  // Malaysia
  { code: "my-kl", name: "Kuala Lumpur", countryCode: "my" },
  // Philippines
  { code: "ph-mnl", name: "Manila", countryCode: "ph" },
  { code: "ph-ceb", name: "Cebu", countryCode: "ph" },
  // Thái Lan
  { code: "th-bkk", name: "Bangkok", countryCode: "th" },
];

/** Menu dropdown "DU HỌC" trong RogHeader — derive từ `destinations` (1 nguồn chuẩn,
 *  thêm/bớt quốc gia chỉ cần sửa mảng trên). */
export const studyAbroadMenuData: ServiceMenuItem[] = destinations.map((d) => ({
  label: d.name,
  href: `/tim-truong?country=${d.code}`,
}));
