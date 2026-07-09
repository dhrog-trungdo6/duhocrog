/** Bậc học hỗ trợ trong bộ lọc tìm trường — nguồn chuẩn cho cả Zod enum */
export const STUDY_LEVELS = [
  "thpt",
  "cao-dang",
  "dai-hoc",
  "sau-dai-hoc",
  "anh-ngu",
] as const;

export type StudyLevel = (typeof STUDY_LEVELS)[number];

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
  thumbnailUrl?: string; // URL ảnh — bỏ trống/undefined để dùng placeholder gradient
  href: string;
  isHot?: boolean;
}

// ── Mega Menu "DU HỌC" (v1.6.0) ─────────────────────────────────

export interface StudyDestination {
  id: string;
  slug: string; // 'my', 'canada', 'uc'... → /du-hoc/{slug}
  name: string; // 'Du học Mỹ'
  shortName: string; // 'MỸ'
  featuredArticle: Article;
  relatedArticles: Article[]; // 3–4 bài
}

export interface StudyAbroadMegaMenuProps {
  destinations: StudyDestination[];
  className?: string;
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

/** Chương trình đào tạo trên trang trường chi tiết — lưu JSONB cột schools.programs */
export interface SchoolProgram {
  name: string; // "Computer Science (BSc)"
  level: StudyLevel;
  tuitionUsd?: number; // học phí riêng nếu khác mức chung của trường
  duration?: string; // "4 năm", "18 tháng"
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
  // ── Trang chi tiết /truong/[slug] — migration #4, đều optional ──
  slug?: string;
  description?: string; // giới thiệu trường
  websiteUrl?: string;
  imageUrl?: string; // ảnh cover/hero
  videoUrl?: string; // YouTube embed
  galleryUrls?: string[];
  highlights?: string[]; // bullet điểm nổi bật
  programs?: SchoolProgram[];
  requirements?: DocumentRequirement[]; // tái dùng type {category, items[]} của trang visa
  // ── Migration #5 — Quick Facts + Rich Content Sections ──
  foundedYear?: number;
  schoolType?: string;
  totalStudents?: number;
  intakes?: string[];
  mapEmbedUrl?: string;
  contentSections?: SchoolSection[];
}

// ── Rich School Sections (Migration #5 — Discriminated Union) ─

export interface HtmlSection {
  type: "html";
  title: string; // "Tổng quan", "Đời sống sinh viên"...
  content: string; // HTML string — render bằng dangerouslySetInnerHTML ở trang chi tiết
}

export interface ListSection {
  type: "list";
  title: string; // "Các ngành học nổi bật", "Điểm mạnh"...
  items: string[]; // Mảng các mục gạch đầu dòng
}

export interface TableRow {
  [key: string]: string; // key = tên cột, value = giá trị ô
}

export interface TableSection {
  type: "table";
  title: string; // "Yêu cầu đầu vào", "Chi phí"...
  headers: string[]; // ["Tên chương trình", "GPA", "IELTS", "TOEFL"]
  rows: TableRow[]; // [{ Tên chương trình: "...", GPA: "3.0", IELTS: "6.5", TOEFL: "79" }]
}

export type SchoolSection = HtmlSection | ListSection | TableSection;

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

// ── Admin CRM — row types khớp bảng Supabase ─────────────────────────

export type LeadStatus = "new" | "contacted" | "consulting" | "converted" | "lost";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Mới",
  contacted: "Đã liên hệ",
  consulting: "Đang tư vấn",
  converted: "Chốt thành công",
  lost: "Mất lead",
};

export interface LeadRow {
  id: string;
  full_name: string;
  phone: string;
  country_interest: string;
  source: string;
  status: LeadStatus;
  /** Ghi chú chăm sóc — undefined khi cloud chưa chạy migration 20260708000002 */
  note?: string | null;
  created_at: string;
}

export type ActivityType = "note" | "call" | "email" | "status_change" | "other";

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  note: "Ghi chú",
  call: "Cuộc gọi",
  email: "Email",
  status_change: "Đổi trạng thái",
  other: "Khác",
};

/** Bảng lead_activities — nhật ký chăm sóc (migration 20260709000003). */
export interface LeadActivity {
  id: string;
  lead_id: string;
  staff_name: string;
  action_type: ActivityType;
  content: string;
  created_at: string;
}

export interface EventRow {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  location: string | null;
  href: string | null;
  is_active: boolean;
  created_at: string;
}

// ── School Filter ───────────────────────────────────────────────────

export interface FilterOption {
  label: string;
  value: string;
}

export interface ProvinceFilterOption {
  label: string;
  value: string;
  countryValue: string;
}

export interface FilterState {
  country: string;
  province: string;
  level: string;
  tuitionRange: [number, number];
}

export interface SchoolFilterProps {
  onSearch: (filters: FilterState) => void;
  countries: FilterOption[];
  provinces: ProvinceFilterOption[];
}

// ── Services / Visa ─────────────────────────────────────────────────

export interface ServiceMenuItem {
  label: string;
  href: string;
  description?: string;
  children?: ServiceMenuItem[];
}

export interface VisaType {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
}

export interface VisaProcessStep {
  step: number;
  title: string;
  description: string;
}

export interface DocumentRequirement {
  category: string;
  items: string[];
}

export interface PricingItem {
  service: string;
  price: string;
  note?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface SchoolRow {
  id: string;
  name: string;
  country: string;
  province: string;
  level: StudyLevel;
  tuition_usd: number;
  scholarship_up_to: number | null;
  logo_url: string | null;
  is_active: boolean;
  created_at: string;
  // ── Trang chi tiết — cột migration #4 (null khi cloud chưa apply) ──
  slug: string | null;
  description: string | null;
  website_url: string | null;
  image_url: string | null;
  video_url: string | null;
  gallery_urls: string[] | null;
  highlights: string[] | null; // jsonb
  programs: SchoolProgram[] | null; // jsonb
  requirements: DocumentRequirement[] | null; // jsonb
}
