import { redirect } from "next/navigation";

/** /crm — alias theo thói quen từ CRM Nam Ngân; trang thật ở /admin (middleware bảo vệ). */
export default function CrmPage() {
  redirect("/admin");
}
