import { type ReactNode } from "react";
import PortalSidebar from "@/components/portal/PortalSidebar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

export const metadata = {
  title: "Student Portal — ROG Education",
  description: "Cổng thông tin học sinh — Theo dõi tiến độ hồ sơ du học & Ví tài liệu số hóa.",
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <PortalSidebar />
        <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
}