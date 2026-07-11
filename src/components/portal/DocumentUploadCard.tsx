"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from "@/types";
import type { DocumentType } from "@/types";
import { fileUploadSchema, PORTAL_MAX_FILE_SIZE } from "@/lib/validations";

interface UploadingFile {
  id: string;
  file: File;
  document_type: DocumentType;
  progress: "uploading" | "finishing" | "done" | "error";
  errorMsg?: string;
}

/** Format bytes sang dạng đọc được */
function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUploadCard({ onUploaded }: { onUploaded: () => void }) {
  const [selectedType, setSelectedType] = useState<DocumentType>("transcript");
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const next: UploadingFile[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const f = fileList[i];
        const parsed = fileUploadSchema.safeParse(f);
        if (!parsed.success) {
          const errStr = parsed.error.issues.map((iss) => iss.message).join("; ");
          next.push({ id: `${Date.now()}-${i}`, file: f, document_type: selectedType, progress: "error", errorMsg: errStr });
        } else {
          next.push({ id: `${Date.now()}-${i}`, file: f, document_type: selectedType, progress: "uploading" });
        }
      }
      if (next.length === 0) return;
      setFiles((prev) => [...prev, ...next]);
      // Trigger upload cho từng file
      for (const item of next) {
        if (item.progress === "error") continue;
        uploadFile(item);
      }
    },
    [selectedType],
  );

  const uploadFile = async (item: UploadingFile) => {
    try {
      // B1: xin signed upload URL
      const metaRes = await fetch("/api/portal/documents/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type: item.document_type,
          file_name: item.file.name,
          file_size: item.file.size,
          mime_type: item.file.type,
        }),
        credentials: "include",
      });
      if (!metaRes.ok) {
        const err = await metaRes.json().catch(() => ({ error: "Lỗi mạng" }));
        updateFile(item.id, { progress: "error", errorMsg: err.error ?? "Không lấy được link upload" });
        return;
      }
      const { path, signedUrl } = await metaRes.json();

      // B2: PUT file thẳng lên Storage (vượt body limit 4.5MB của Vercel)
      const putRes = await fetch(signedUrl, {
        method: "PUT",
        body: item.file,
        headers: { "Content-Type": item.file.type },
      });
      if (!putRes.ok) {
        updateFile(item.id, { progress: "error", errorMsg: "Upload lên storage thất bại" });
        return;
      }

      updateFile(item.id, { progress: "finishing" });

      // B3: ghi metadata vào DB qua API
      const metaDone = await fetch("/api/portal/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type: item.document_type,
          file_name: item.file.name,
          file_path: path,
        }),
        credentials: "include",
      });
      if (!metaDone.ok) {
        const err = await metaDone.json().catch(() => ({ error: "Lỗi ghi metadata" }));
        updateFile(item.id, { progress: "error", errorMsg: err.error ?? "Lỗi ghi metadata" });
        return;
      }

      updateFile(item.id, { progress: "done" });
      onUploaded();
    } catch (e) {
      updateFile(item.id, { progress: "error", errorMsg: e instanceof Error ? e.message : "Lỗi không xác định" });
    }
  };

  const updateFile = (id: string, patch: Partial<UploadingFile>) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
      <h3 className="text-lg font-bold text-navy">📤 Tải lên tài liệu mới</h3>

      {/* Chọn loại tài liệu */}
      <div>
        <label className="block text-sm font-semibold text-navy mb-2">Loại tài liệu</label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as DocumentType)}
        >
          {DOCUMENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {DOCUMENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      <div
        ref={dropRef}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"
        }`}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        <p className="text-sm text-gray-600 font-medium">Kéo thả tệp vào đây hoặc nhấn để chọn</p>
        <p className="text-xs text-gray-400 mt-1">PDF, JPEG, PNG — Tối đa {fmtBytes(PORTAL_MAX_FILE_SIZE)}</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((item) => (
            <li key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-navy truncate">{item.file.name}</p>
                <p className="text-xs text-gray-500">
                  {DOCUMENT_TYPE_LABELS[item.document_type]} · {fmtBytes(item.file.size)}
                </p>
              </div>
              {/* Status */}
              {item.progress === "uploading" && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full animate-pulse">Đang tải...</span>
              )}
              {item.progress === "finishing" && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Đang lưu...</span>
              )}
              {item.progress === "done" && (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
              {item.progress === "error" && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  {item.errorMsg && (
                    <span className="text-xs text-red-600 max-w-[160px] truncate">{item.errorMsg}</span>
                  )}
                </div>
              )}
              {/* Remove button (trạng thái error/done) */}
              {item.progress !== "uploading" && item.progress !== "finishing" && (
                <button onClick={() => removeFile(item.id)} className="p-1 hover:bg-gray-200 rounded" title="Xóa khỏi danh sách">
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}