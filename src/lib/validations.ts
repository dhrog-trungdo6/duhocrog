import { z } from "zod";
import { DOCUMENT_TYPES, STUDY_LEVELS } from "@/types";

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
  // ── Migration #7 — Rich content JSONB (scrape-test) ──
  quick_facts: z.lazy(() => schoolQuickFactsSchema).nullable().optional(),
  cost_breakdown: z.lazy(() => schoolCostBreakdownSchema).nullable().optional(),
  admission_requirements: z.lazy(() => schoolAdmissionRequirementsSchema).nullable().optional(),
  source_url: z.string().trim().max(1000).optional(),
  scraped_at: z.string().datetime({ offset: true }).optional(),
  // ── Migration #9 — Automation config (rule 10). KHÔNG default: chỉ ghi khi
  // client gửi, tránh lỗi column-not-exist lúc cloud chưa apply migration ──
  official_rss_url: z.string().trim().max(500).optional(),
  auto_sync_enabled: z.boolean().optional(),
  // ── Migration #10 — CTA + related (rule 12). KHÔNG default, lý do như trên ──
  show_cta: z.boolean().optional(),
  related_slugs: z
    .array(
      z
        .string()
        .trim()
        .toLowerCase()
        .max(200)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm a-z, 0-9 và dấu gạch ngang"),
    )
    .max(12)
    .optional(),
  // ── Migration #12 — Program Tags (rule 11). KHÔNG default, lý do như trên ──
  is_high_demand: z.boolean().optional(),
  no_visa_cap: z.boolean().optional(),
  is_top_school: z.boolean().optional(),
  has_coop: z.boolean().optional(),
  program_tags: z.array(z.string().trim().min(1).max(50)).max(10).optional(),
});

// ── Majors — ngành học chuẩn hóa (v1.14.0, migration #13) ─────────────────

/**
 * Body tạo/sửa ngành học (API admin majors sau này) — khớp bảng majors.
 * slug bỏ trống → API tự sinh từ name_en bằng slugify (src/lib/slug.ts).
 */
export const majorSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm a-z, 0-9 và dấu gạch ngang")
    .optional(),
  name_vi: z.string().trim().min(2, "Tên tiếng Việt tối thiểu 2 ký tự").max(200),
  name_en: z.string().trim().min(2, "Tên tiếng Anh tối thiểu 2 ký tự").max(200),
  category: z.string().trim().min(2, "Nhập nhóm ngành (Business, STEM...)").max(100),
  is_active: z.boolean().optional().default(true),
});

export type MajorInput = z.input<typeof majorSchema>;

/** Body gán/gỡ ngành cho trường — junction school_majors (PK kép chống trùng). */
export const schoolMajorLinkSchema = z.object({
  school_id: z.string().uuid("school_id phải là UUID"),
  major_id: z.string().uuid("major_id phải là UUID"),
});

/**
 * GET /api/schools — query params lọc đa chiều (v1.13.0, faceted filtering rule 11).
 * searchParams luôn là string → coerce số + transform tags "a,b" → ["a","b"].
 * Slug tag boolean: high_demand | no_visa_cap | top_school | coop; còn lại là tag động (GIN).
 */
export const schoolQuerySchema = z.object({
  country: z.string().trim().max(50).optional(),
  province: z.string().trim().max(100).optional(),
  level: z.enum(STUDY_LEVELS).optional(),
  min_tuition: z.coerce.number().nonnegative().default(0),
  max_tuition: z.coerce.number().nonnegative().optional(), // không default — thiếu = không chặn trên
  min_scholarship: z.coerce.number().nonnegative().default(0),
  search: z.string().trim().max(200).optional(),
  tags: z
    .string()
    .optional()
    .transform((val) =>
      val
        ? val
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
            .slice(0, 10)
        : [],
    ),
});

export type SchoolQueryOutput = z.output<typeof schoolQuerySchema>;

/**
 * Form admin Thêm/Sửa trường (SchoolFormModal) — subset của schoolInputSchema.
 * Input số: component dùng setValueAs chuyển "" → undefined/null trước khi Zod validate.
 */
export const schoolFormSchema = schoolInputSchema
  .pick({ name: true, country: true, province: true, level: true })
  .extend({
    tuition_usd: z
      .number({
        error: (issue) =>
          issue.input === undefined ? "Nhập học phí USD/năm" : "Học phí phải là số",
      })
      .int("Học phí phải là số nguyên")
      .min(0, "Học phí không âm")
      .max(200_000, "Học phí tối đa 200.000 USD"),
    scholarship_up_to: z
      .number({ error: "% học bổng phải là số" })
      .int("% học bổng phải là số nguyên")
      .min(0, "% học bổng không âm")
      .max(100, "% học bổng tối đa 100")
      .nullable(),
    is_active: z.boolean(),
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
  // Max 500: bullet thực tế trên think.edu.vn dài hơn 300 ký tự (scrape-test 2026-07-10)
  items: z.array(z.string().trim().min(1, "Mục không được trống").max(500)).max(50),
});

/** Bảng động: headers = tên cột, rows = mảng record {key: value}.
 *  KHÔNG annotate z.ZodType<...> — làm z.input thành unknown, vỡ type zodResolver. */
const tableRowSchema = z.record(z.string(), z.string().trim().max(500));

export const tableSectionSchema = z.object({
  type: z.literal("table"),
  title: z.string().trim().min(1, "Tiêu đề section không được trống").max(200),
  headers: z.array(z.string().trim().min(1, "Tên cột không được trống").max(100)).max(20),
  rows: z.array(tableRowSchema).max(200),
});

/** SchoolSection = HtmlSection | ListSection | TableSection */
export const schoolSectionSchema = z.discriminatedUnion("type", [
  htmlSectionSchema,
  listSectionSchema,
  tableSectionSchema,
]);

// ── Rich content JSONB (Migration #7 — schema scrape-test) ─────────
// Nguyên tắc: KHOAN DUNG khi parse (field không chắc → optional/nullable),
// NGHIÊM khi ghi (đã có thì phải đúng kiểu). Zod là nguồn chân lý cho shape JSONB.

/** Quick facts sidebar — cột schools.quick_facts */
export const schoolQuickFactsSchema = z.object({
  foundedYear: z.number().int().min(1000).max(2100).optional(),
  schoolType: z.string().trim().min(1).max(100).optional(),
  intakes: z.array(z.string().trim().min(1).max(50)).max(12).optional(),
  studentCount: z.string().trim().min(1).max(50).optional(), // giữ string: '25,000+'
  campusCity: z.string().trim().min(1).max(200).optional(),
  websiteUrl: z.string().trim().max(500).optional(),
});

/** 1 hàng bảng chi phí — amountMax = amountMin khi giá trị đơn */
export const costRowSchema = z.object({
  label: z.string().trim().min(1, "Khoản mục không được trống").max(200),
  amountMin: z.number().min(0).nullable(),
  amountMax: z.number().min(0).nullable(),
  unit: z.string().trim().max(50), // 'CAD/năm'
  note: z.string().trim().max(500).optional(),
});

/** Bảng chi phí — cột schools.cost_breakdown */
export const schoolCostBreakdownSchema = z.object({
  currency: z.string().trim().min(1).max(10), // 'CAD' | 'USD' | ...
  rows: z.array(costRowSchema).max(50),
  totalEstimate: costRowSchema.optional(),
});

/** 1 hàng bảng điều kiện nhập học — string tự do ('6.5+', 'Không bắt buộc').
 *  Max 300: cell thực tế trên think.edu.vn có mô tả dài (scrape-test 2026-07-10). */
export const admissionRowSchema = z.object({
  level: z.string().trim().min(1).max(100),
  gpa: z.string().trim().max(300).optional(),
  ielts: z.string().trim().max(300).optional(),
  other: z.string().trim().max(500).optional(),
});

/** Bảng điều kiện nhập học — cột schools.admission_requirements */
export const schoolAdmissionRequirementsSchema = z.object({
  rows: z.array(admissionRowSchema).max(30),
  notes: z.string().trim().max(1000).optional(),
});

// ── Student Portal (v1.12.0 — migration #11) ──────────────────────────────

/** Giới hạn file Ví tài liệu số hóa — đồng bộ với bucket student-documents (migration #11). */
export const PORTAL_MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const PORTAL_ACCEPTED_MIME = ["application/pdf", "image/jpeg", "image/png"] as const;

/** POST /api/portal/login — SĐT + mã truy cập do tư vấn viên cấp từ CRM. */
export const portalLoginSchema = z.object({
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .pipe(z.string().regex(VN_PHONE_REGEX, "Số điện thoại không hợp lệ (VD: 0909123456)")),
  code: z
    .string()
    .trim()
    .min(6, "Mã truy cập tối thiểu 6 ký tự")
    .max(64, "Mã truy cập không hợp lệ"),
});

export type PortalLoginValues = z.input<typeof portalLoginSchema>;

/** Client-side: kiểm tra File trước khi xin signed URL (DocumentUploadCard). */
export const fileUploadSchema = z
  .custom<File>((v) => v instanceof File, "Vui lòng chọn tệp")
  .refine((f) => f.size > 0, "Tệp rỗng")
  .refine((f) => f.size <= PORTAL_MAX_FILE_SIZE, "Tệp tối đa 10MB")
  .refine(
    (f) => (PORTAL_ACCEPTED_MIME as readonly string[]).includes(f.type),
    "Chỉ nhận PDF, JPEG hoặc PNG",
  );

/** POST /api/portal/documents/upload-url — xin signed upload URL (server validate lại meta). */
export const documentUploadRequestSchema = z.object({
  document_type: z.enum(DOCUMENT_TYPES),
  file_name: z.string().trim().min(1, "Thiếu tên tệp").max(255),
  file_size: z.number().int().positive().max(PORTAL_MAX_FILE_SIZE, "Tệp tối đa 10MB"),
  mime_type: z.enum(PORTAL_ACCEPTED_MIME, { error: "Chỉ nhận PDF, JPEG hoặc PNG" }),
});

/** POST /api/portal/documents — ghi metadata sau khi client upload Storage thành công. */
export const documentMetaSchema = z.object({
  document_type: z.enum(DOCUMENT_TYPES),
  file_name: z.string().trim().min(1).max(255),
  file_path: z.string().trim().min(1).max(600),
});

/** PATCH /api/admin/documents/[id] — admin duyệt/từ chối tài liệu. */
export const documentReviewSchema = z
  .object({
    status: z.enum(["pending_review", "approved", "rejected"]),
    notes: z.string().trim().max(2000, "Ghi chú tối đa 2000 ký tự").optional(),
  })
  .refine((d) => d.status !== "rejected" || (d.notes ?? "").length > 0, {
    message: "Từ chối tài liệu phải kèm lý do trong ghi chú",
    path: ["notes"],
  });

// ── Form admin nâng cao — SchoolFormModal 4 tab (v1.10.0, rule 10) ─────────

/**
 * Mở rộng schoolFormSchema với slug/logo + JSONB (quick_facts, cost_breakdown,
 * content_sections) + automation config. Component dùng setValueAs chuyển
 * "" → undefined/null cho field số/optional trước khi Zod validate.
 */
export const schoolEditFormSchema = schoolFormSchema.extend({
  slug: schoolInputSchema.shape.slug,
  logo_url: z.string().trim().max(500),
  website_url: z
    .string()
    .trim()
    .max(500)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "URL phải bắt đầu bằng http(s)://"),
  map_embed_url: z
    .string()
    .trim()
    .max(1000)
    .refine((v) => v === "" || /^https?:\/\//i.test(v), "URL phải bắt đầu bằng http(s)://"),
  quick_facts: schoolQuickFactsSchema,
  cost_breakdown: z
    .object({
      currency: z.string().trim().max(10),
      rows: z.array(costRowSchema).max(50),
      totalEstimate: costRowSchema.optional(), // không render UI — passthrough giữ dữ liệu crawler
    })
    .superRefine((v, ctx) => {
      if (v.rows.length > 0 && v.currency.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["currency"],
          message: "Nhập đơn vị tiền (USD, CAD...) khi có hàng chi phí",
        });
      }
    }),
  content_sections: z.array(schoolSectionSchema).max(30),
  official_rss_url: z.string().trim().max(500).optional(),
  auto_sync_enabled: z.boolean(),
  show_cta: z.boolean(),
  related_slugs: schoolInputSchema.shape.related_slugs.unwrap(),
  // Program Tags (migration #12) — form luôn có giá trị, payload gửi null-safe ở modal
  is_high_demand: z.boolean(),
  no_visa_cap: z.boolean(),
  is_top_school: z.boolean(),
  has_coop: z.boolean(),
  program_tags: schoolInputSchema.shape.program_tags.unwrap(),
});

export type SchoolEditFormValues = z.infer<typeof schoolEditFormSchema>;
