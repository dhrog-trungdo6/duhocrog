/** Bậc học hỗ trợ trong bộ lọc tìm trường */
export type StudyLevel =
  | "thpt"
  | "cao-dang"
  | "dai-hoc"
  | "sau-dai-hoc"
  | "anh-ngu";

export const STUDY_LEVEL_LABELS: Record<StudyLevel, string> = {
  thpt: "THPT",
  "cao-dang": "Cao đẳng",
  "dai-hoc": "Đại học",
  "sau-dai-hoc": "Sau đại học",
  "anh-ngu": "Khóa học Anh ngữ",
};

export interface Country {
  code: string; // "uk", "au", "us"...
  name: string; // "Du học Anh"
  flag: string; // emoji cờ — thay bằng ảnh thật sau
  imageUrl?: string; // ảnh quốc gia (thay placeholder gradient)
  gradient: string; // tailwind gradient classes cho placeholder
}

export interface Province {
  code: string;
  name: string;
  countryCode: Country["code"];
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string; // ISO 8601
  thumbnailUrl?: string;
  href: string;
}

export interface Scholarship {
  id: string;
  title: string;
  excerpt: string;
  universityName: string;
  logoUrl?: string;
  href: string;
}

export interface University {
  id: string;
  name: string;
  country: string;
  logoUrl?: string;
}

export interface School {
  id: string;
  name: string;
  country: string; // mã quốc gia, khớp Country['code']
  province: string; // mã tỉnh bang/thành phố
  level: StudyLevel;
  tuitionUsd: number; // học phí tham khảo / năm
  scholarshipUpTo?: number; // % học bổng cao nhất, nếu có
  logoUrl: string;
}

export interface Stat {
  id: string;
  value: number;
  suffix: string; // "+", "%"
  label: string;
  icon: "award" | "school" | "graduation";
}

export interface Testimonial {
  id: string;
  studentName: string;
  program: string; // vd: "Du học Mỹ — Lê Hà"
  quote: string;
  imageUrl?: string; // ảnh minh chứng visa (đã che thông tin nhạy cảm)
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  startsAt: string; // ISO 8601 — status upcoming/past derive từ ngày này
  location: string;
  href: string;
}

export interface LeadFormData {
  fullName: string;
  phone: string;
  country: string;
}
