"use client";

import { useState } from "react";
import DocumentList from "@/components/portal/DocumentList";
import DocumentUploadCard from "@/components/portal/DocumentUploadCard";

export default function HoSoPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-navy">💳 Ví tài liệu số hóa</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tải lên hộ chiếu, học bạ, chứng chỉ... để ROG xem xét hồ sơ và tư vấn chính xác nhất.
        </p>
      </div>

      {/* Upload section */}
      <DocumentUploadCard onUploaded={() => setRefreshKey((k) => k + 1)} />

      {/* Document list */}
      <DocumentList refreshKey={refreshKey} />
    </div>
  );
}