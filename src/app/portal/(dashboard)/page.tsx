import { redirect } from "next/navigation";
import { getStudentLeadIdFromCookies, fetchStudentProfile } from "@/lib/portal-server";
import ApplicationProgressBar from "@/components/portal/ApplicationProgressBar";
import { GraduationCap, MapPin, Phone, Calendar } from "lucide-react";

export const metadata = {
  title: "Dashboard — Student Portal",
};

/** Format ngày đăng ký sang tiếng Việt (dạng ngắn). */
function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default async function PortalDashboardPage() {
  const leadId = getStudentLeadIdFromCookies();
  if (!leadId) redirect("/portal/login");

  const profile = await fetchStudentProfile(leadId);
  if (!profile) {
    // cookie hợp lệ nhưng DB lỗi hoặc lead bị xóa — show lỗi nhẹ nhàng
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <div className="bg-white rounded-xl border border-amber-200 shadow-sm p-6 text-center">
          <p className="text-sm text-amber-700 font-medium">Không tải được hồ sơ</p>
          <p className="text-xs text-amber-600 mt-1">
            Vui lòng thử lại sau hoặc liên hệ tư vấn viên ROG để được hỗ trợ.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-navy">
        Xin chào, {profile.full_name.split(" ").pop() ?? profile.full_name} 👋
      </h1>

      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-navy mb-4">📝 Thông tin hồ sơ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Họ tên</p>
              <p className="text-sm font-semibold text-navy">{profile.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">SĐT</p>
              <p className="text-sm font-semibold text-navy">{profile.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Quốc gia quan tâm</p>
              <p className="text-sm font-semibold text-navy">{profile.country_interest}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Ngày đăng ký</p>
              <p className="text-sm font-semibold text-navy">{fmtDate(profile.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <ApplicationProgressBar status={profile.status} />
      </div>
    </div>
  );
}