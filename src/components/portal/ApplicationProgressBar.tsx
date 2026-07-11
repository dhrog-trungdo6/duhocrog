import type { LeadStatus } from "@/types";

/**
 * Các bước ATS trong Student Portal Dashboard.
 * Log: status = new → contacted → consulting → converted (lost không hiển thị).
 */
const PROGRESS_STEPS: { status: LeadStatus; label: string }[] = [
  { status: "new", label: "Đã đăng ký" },
  { status: "contacted", label: "Đã kết nối" },
  { status: "consulting", label: "Đang xét hồ sơ" },
  { status: "converted", label: "Thành công" },
];

/** Màu step theo trạng thái: active → primary-blue, completed → green-500, pending → gray-300 */
function stepColor(currentIdx: number, stepIdx: number): string {
  if (stepIdx <= currentIdx) return "bg-primary text-white";
  return "bg-gray-200 text-gray-500";
}

function lineColor(currentIdx: number, lineIdx: number): string {
  return lineIdx < currentIdx ? "bg-green-500" : "bg-gray-200";
}

export default function ApplicationProgressBar({ status }: { status: LeadStatus }) {
  const currentIdx = PROGRESS_STEPS.findIndex((s) => s.status === status);
  if (currentIdx === -1) {
    // lost → không hiển thị thanh tiến độ
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-navy">Tiến độ hồ sơ du học của bạn</h3>
      <p className="text-sm text-navy/70">ROG đồng hành cùng bạn qua từng bước — từ đăng ký đến khi nhập học.</p>
      <div className="flex items-center gap-2 mt-4">
        {PROGRESS_STEPS.map((step, idx) => (
          <div key={step.status} className="flex items-center flex-1">
            {/* Step circle */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${stepColor(currentIdx, idx)}`}
            >
              {idx + 1}
            </div>
            {/* Step label */}
            <span className="ml-2 text-xs font-medium text-navy hidden sm:inline">
              {step.label}
            </span>
            {/* Connector line (trừ step cuối) */}
            {idx < PROGRESS_STEPS.length - 1 && (
              <div className={`flex-1 h-1 mx-2 rounded ${lineColor(currentIdx, idx)}`} />
            )}
          </div>
        ))}
      </div>
      {/* Name label for current step */}
      <p className="text-sm font-semibold text-primary">
        Bước hiện tại: {PROGRESS_STEPS[Math.max(0, currentIdx)]?.label ?? "—"}
      </p>
    </div>
  );
}