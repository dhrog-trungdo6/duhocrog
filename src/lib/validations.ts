import { z } from "zod";

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

export const schoolInputSchema = z.object({
  name: z.string().trim().min(2, "Tên trường tối thiểu 2 ký tự").max(200),
  country: z.string().min(2, "Chọn quốc gia"),
  province: z.string().min(2, "Chọn tỉnh bang/thành phố"),
  level: z.enum(["thpt", "cao-dang", "dai-hoc", "sau-dai-hoc", "anh-ngu"]),
  tuition_usd: z.number().int().min(0).max(200_000),
  scholarship_up_to: z.number().int().min(0).max(100).nullable().optional(),
  logo_url: z.string().trim().max(500).optional().default(""),
  is_active: z.boolean().optional().default(true),
});
