"use client";

import { useEffect, useState } from "react";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_LABELS } from "@/types";
import type { DocumentStatus, StudentDocument } from "@/types";

function statusIcon(status: DocumentStatus) {
  switch (status) {
    case "approved":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-amber-500" />;
  }
}

export default function DocumentList({ refreshKey }: { refreshKey: number }) {
  const [docs, setDocs] = useState<StudentDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch("/api/portal/documents", { credentials: "include" })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Lỗi tải danh sách");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setDocs(data.documents ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Lỗi mạng");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded" />
          <div className="h-4 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <p className="text-xs text-gray-500 mt-1">
          Nếu lỗi kéo dài, vui lòng kiểm tra migration #11 trên Supabase Dashboard.
        </p>
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
        <FileText className="mx-auto h-10 w-10 text-gray-300 mb-2" />
        <p className="text-sm text-gray-500 font-medium">Chưa có tài liệu nào</p>
        <p className="text-xs text-gray-400 mt-1">Tải lên học bạ, chứng chỉ, hộ chiếu... để ROG xem xét và tư vấn.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-navy">📋 Tài liệu đã tải lên ({docs.length})</h3>
      </div>
      <ul className="divide-y divide-gray-100">
        {docs.map((doc) => (
          <li key={doc.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
            <FileText className="h-6 w-6 text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy truncate">{doc.file_name}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">{DOCUMENT_TYPE_LABELS[doc.document_type]}</span>
                <span className="text-xs text-gray-300">·</span>
                <span className="text-xs text-gray-400">
                  {new Date(doc.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {statusIcon(doc.status)}
              <span className="text-xs font-medium text-gray-600">{DOCUMENT_STATUS_LABELS[doc.status]}</span>
            </div>
            {/* Notes nếu bị từ chối */}
            {doc.status === "rejected" && doc.notes && (
              <div className="hidden sm:block text-xs text-red-600 bg-red-50 px-2 py-1 rounded max-w-[200px] truncate" title={doc.notes}>
                {doc.notes}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}