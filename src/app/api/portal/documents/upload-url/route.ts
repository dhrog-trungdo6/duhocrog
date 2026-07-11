import { NextResponse } from "next/server";
import { documentUploadRequestSchema } from "@/lib/validations";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStudentLeadId } from "@/lib/portal-auth";

const BUCKET = "student-documents";

/** Tên file an toàn cho path Storage: bỏ dấu, ký tự lạ → "-". */
function sanitizeFileName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(-120); // giữ đuôi (chứa extension), path tổng < 600
}

/**
 * POST /api/portal/documents/upload-url — cấp signed upload URL để client PUT file
 * thẳng lên Supabase Storage (bucket riêng tư, né giới hạn body 4.5MB của Vercel).
 * Bucket đã chặn cứng >10MB + MIME ngoài whitelist (migration #11).
 */
export async function POST(request: Request) {
  try {
    const leadId = getStudentLeadId(request);
    if (!leadId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await request.json();
    const parsed = documentUploadRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dữ liệu không hợp lệ", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Chưa cấu hình Supabase" }, { status: 503 });
    }

    // Path luôn nằm trong "thư mục" của lead — API metadata sẽ verify prefix này
    const path = `${leadId}/${parsed.data.document_type}/${Date.now()}-${sanitizeFileName(parsed.data.file_name)}`;

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      console.error("[api/portal/upload-url]:", error?.message);
      return NextResponse.json(
        { error: "Không tạo được liên kết upload — kiểm tra bucket student-documents (migration #11)" },
        { status: 500 }
      );
    }

    return NextResponse.json({ path: data.path, signedUrl: data.signedUrl, token: data.token });
  } catch (error) {
    console.error("[api/portal/upload-url] unexpected:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
