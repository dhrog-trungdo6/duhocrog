import { NextResponse } from "next/server";
import { z } from "zod";
import { leadFormSchema } from "@/lib/validations";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAdminRequest } from "@/lib/admin-auth";

// Cột note thêm ở migration 20260708000002 — SELECT_LEGACY dùng khi cloud chưa apply (lỗi 42703)
const SELECT_WITH_NOTE =
  "id, full_name, phone, country_interest, source, status, note, created_at";
const SELECT_LEGACY = "id, full_name, phone, country_interest, source, status, created_at";

/** GET /api/leads — admin CRM: danh sách lead, filter ?status= ?source= ?q= ?page= ?limit= */
export async function GET(request: Request) {
  try {
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    // Ký tự ,() là cú pháp filter PostgREST — thay bằng khoảng trắng trước khi đưa vào .or()
    const q = searchParams.get("q")?.trim().replace(/[,()]/g, " ").trim() ?? "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 20));

    const buildQuery = (select: string) => {
      let query = supabase
        .from("leads")
        .select(select, { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * limit, page * limit - 1);
      if (status) query = query.eq("status", status);
      if (source) query = query.eq("source", source);
      if (q) query = query.or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
      return query;
    };

    let { data, error, count } = await buildQuery(SELECT_WITH_NOTE);
    if (error?.code === "42703") {
      ({ data, error, count } = await buildQuery(SELECT_LEGACY));
    }
    if (error) {
      console.error("[api/leads] GET:", error);
      return NextResponse.json({ error: "Không tải được leads" }, { status: 500 });
    }

    return NextResponse.json({ leads: data, total: count ?? 0, page, limit });
  } catch (error) {
    console.error("[api/leads] GET unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

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
