import { NextResponse } from "next/server";
import { z } from "zod";
import { leadFormSchema } from "@/lib/validations";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/** Body = LeadForm + nguồn lead + honeypot chống spam bot. */
const leadRequestSchema = leadFormSchema.extend({
  source: z
    .enum(["homepage_form", "floating_cta", "footer_newsletter"])
    .default("homepage_form"),
  website_hp: z.string().max(0, "Bot detected").optional(), // honeypot: người thật luôn để trống
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = leadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      // Chưa cấu hình Supabase env — không nhận lead "ảo" để tránh mất khách âm thầm
      return NextResponse.json(
        { error: "Hệ thống đang bảo trì, vui lòng gọi hotline." },
        { status: 503 }
      );
    }

    const { fullName, phone, country, source } = parsed.data;
    const { data, error } = await supabase
      .from("leads")
      .insert({
        full_name: fullName,
        phone,
        country_interest: country,
        source,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[api/leads] insert failed:", error);
      return NextResponse.json(
        { error: "Không lưu được thông tin, vui lòng thử lại." },
        { status: 500 }
      );
    }

    // TODO (luồng kép theo chuẩn dự án): khi có RESEND_API_KEY + Realtime channel
    // → gửi email admin + broadcast 'admin-notifications' đồng thời tại đây.

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (error) {
    console.error("[api/leads] unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống." }, { status: 500 });
  }
}
