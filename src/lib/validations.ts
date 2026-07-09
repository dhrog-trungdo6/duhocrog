import { z } from "zod";
import { STUDY_LEVELS } from "@/types";

/** Số điện thoại Việt Nam: 0xxxxxxxxx hoặc +84xxxxxxxxx (9–10 số sau đầu số). */
const VN_PHONE_REGEX = /^(0|\+84)(\d{9,10})$/;

export const leadFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Vui lòng nhập họ tên (tối thiểu 2 ký tự)")
    .max(100, "Họ tên quá dài"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .pipe(z.string().regex(VN_PHONE_REGEX, "Số điện thoại không hợp lệ (VD: 0909123456)")),
  country: z.string().min(1, "Vui lòng chọn quốc gia quan tâm"),
});

export type LeadFormValues = z.input<typeof leadFormSchema>;

// ── Admin CRM ─────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export const LEAD_STATUSES = [
  "new",
  "contacted",
  "consulting",
  "converted",
  "lost",
] as const;

/** PATCH /api/leads/[id] — cập nhật trạng thái và/hoặc ghi chú chăm sóc. */
export const leadUpdateSchema = z
  .object({
    status: z.enum(LEAD_STATUSES).optional(),
    note: z.string().trim().max(2000, "Ghi chú tối đa 2000 ký tự").optional(),
  })
  .refine((data) => data.status !== undefined || data.note !== undefined, {
    message: "Cần ít nhất một trường để cập nhật",
  });

/** POST /api/leads/[id]/activities — nhật ký chăm sóc lead. */
export const activityInputSchema = z.object({
  action_type: z.enum(["note", "call", "email", "status_change", "other"]),
  content: z.string().trim().min(1, "Nội dung không được trống").max(2000),
  staff_name: z.string().trim().max(100).optional().default("Admin"),
});

export const eventInputSchema = z.object({
  title: z.string().trim().min(3, "Tiêu đề tối thiểu 3 ký tự").max(200),
  description: z.string().trim().max(1000).optional().default(""),
  starts_at: z.string().datetime({ offset: true, message: "Thời gian không hợp lệ (ISO 8601)" }),
  location: z.string().trim().max(200).optional().default(""),
  href: z.string().trim().max(500).optional().default("#"),
  is_active: z.boolean().optional().default(true),
});

/** URL tùy chọn: rỗng hoặc bắt đầu http(s):// */
const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "URL phải bắt đầu bằng http(s)://")
  .optional()
  .default("");

/** Chương trình đào tạo — phần tử JSONB cột schools.programs (khớp type SchoolProgram). */
export const schoolProgramSchema = z.object({
  name: z.string().trim().min(2, "Tên chương trình tối thiểu 2 ký tự").max(200),
  level: z.enum(STUDY_LEVELS),
  tuitionUsd: z.number().int().min(0).max(200_000).optional(),
  duration: z.string().trim().max(50).optional(),
});

export const schoolInputSchema = z.object({
  name: z.string().trim().min(2, "Tên trường tối thiểu 2 ký tự").max(200),
  country: z.string().min(2, "Chọn quốc gia"),
  province: z.string().min(2, "Chọn tỉnh bang/thành phố"),
  level: z.enum(STUDY_LEVELS),
  tuition_usd: z.number().int().min(0).max(200_000),
  scholarship_up_to: z.number().int().min(0).max(100).nullable().optional(),
  logo_url: z.string().trim().max(500).optional().default(""),
  is_active: z.boolean().optional().default(true),
  // ── Trang chi tiết (migration #4) — đều optional, admin điền dần ──
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm a-z, 0-9 và dấu gạch ngang")
    .optional(), // bỏ trống → API tự sinh từ name (slugify)
  description: z.string().trim().max(10_000).optional().default(""),
  website_url: optionalUrl,
  image_url: z.string().trim().max(500).optional().default(""),
  video_url: z.string().trim().max(500).optional().default(""),
  gallery_urls: z.array(z.string().trim().min(1).max(500)).max(20).optional().default([]),
  highlights: z.array(z.string().trim().min(1).max(300)).max(12).optional().default([]),
  programs: z.array(schoolProgramSchema).max(50).optional().default([]),
  requirements: z
    .array(
      z.object({
        category: z.string().trim().min(1).max(100),
        items: z.array(z.string().trim().min(1).max(300)).max(20),
      }),
    )
    .max(10)
    .optional()
    .default([]),
  // ── Migration #5 — Quick Facts + Rich Content Sections ──
  founded_year: z.number().int().min(1800).max(2100).optional(),
  school_type: z.string().trim().max(50).optional(),
  total_students: z.number().int().min(0).max(1_000_000).optional(),
  intakes: z.array(z.string().trim().min(1).max(50)).max(12).optional().default([]),
  map_embed_url: z.string().trim().max(1000).optional().default(""),
  content_sections: z.array(z.lazy(() => schoolSectionSchema)).max(30).optional().default([]),
});

// ── Rich School Sections (Migration #5 — Zod Discriminated Union) ─

export const htmlSectionSchema = z.object({
  type: z.literal("html"),
  title: z.string().trim().min(1, "Tiêu đề section không được trống").max(200),
  content: z.string().trim().min(1, "Nội dung HTML không được trống").max(50_000),
});

export const listSectionSchema = z.object({
  type: z.literal("list"),
  title: z.string().trim().min(1, "Tiêu đề section không được trống").max(200),
  items: z.array(z.string().trim().min(1).max(300)).max(50),
});

/** Bảng động: headers = tên cột, rows = mảng record {key: value} */
const tableRowSchema: z.ZodType<Record<string, string>> = z.record(
  z.string(),
  z.string().trim().max(500),
);

export const tableSectionSchema = z.object({
  type: z.literal("table"),
  title: z.string().trim().min(1, "Tiêu đề section không được trống").max(200),
  headers: z.array(z.string().trim().min(1).max(100)).max(20),
  rows: z.array(tableRowSchema).max(200),
});

/** SchoolSection = HtmlSection | ListSection | TableSection */
export const schoolSectionSchema = z.discriminatedUnion("type", [
  htmlSectionSchema,
  listSectionSchema,
  tableSectionSchema,
]);
