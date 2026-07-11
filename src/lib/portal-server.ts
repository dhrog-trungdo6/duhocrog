// KHÔNG import vào client component (getSupabaseAdmin + cookies là server-only).
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { STUDENT_COOKIE, verifyStudentSession } from "@/lib/portal-auth";
import type { StudentDocument, StudentProfile } from "@/types";

/** leadId của học sinh đang đăng nhập (Server Component) — null khi chưa/hết phiên. */
export function getStudentLeadIdFromCookies(): string | null {
  return verifyStudentSession(cookies().get(STUDENT_COOKIE)?.value);
}

/** Hồ sơ học sinh cho portal — subset an toàn của leads (không note/source nội bộ). */
export async function fetchStudentProfile(leadId: string): Promise<StudentProfile | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("id, full_name, phone, country_interest, status, created_at")
      .eq("id", leadId)
      .single();
    if (error) {
      console.error("[portal-server] fetchStudentProfile:", error.message);
      return null;
    }
    return data as StudentProfile;
  } catch (error) {
    console.error("[portal-server] fetchStudentProfile unexpected:", error);
    return null;
  }
}

/** Tài liệu Ví số hóa của học sinh — mới nhất trước. [] khi lỗi/chưa apply migration #11. */
export async function fetchStudentDocuments(leadId: string): Promise<StudentDocument[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("student_documents")
      .select("id, lead_id, document_type, file_path, file_name, status, notes, created_at, updated_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("[portal-server] fetchStudentDocuments:", error.message);
      return [];
    }
    return (data ?? []) as StudentDocument[];
  } catch (error) {
    console.error("[portal-server] fetchStudentDocuments unexpected:", error);
    return [];
  }
}
