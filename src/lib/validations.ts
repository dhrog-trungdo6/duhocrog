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
