import { Sparkles, CheckCircle, Trophy, GraduationCap, Percent, Flame } from "lucide-react";
import type { School } from "@/types";

interface ProgramTagsProps {
  school: School;
  /** false khi UI xung quanh đã có badge học bổng riêng (card /tim-truong). */
  showScholarship?: boolean;
  className?: string;
}

const badgeBase =
  "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold";

/**
 * Nhãn thông minh kiểu ApplyBoard (v1.13.0 — migration #12).
 * 4 cờ boolean + nhãn học bổng tự sinh (scholarshipUpTo > 0) + tag phụ động.
 * Server-safe: không hook — dùng được ở cả Server Component lẫn client card.
 */
export function ProgramTags({ school, showScholarship = true, className = "" }: ProgramTagsProps) {
  const hasScholarship = showScholarship && (school.scholarshipUpTo ?? 0) > 0;
  const hasAny =
    school.isHighDemand ||
    school.noVisaCap ||
    school.isTopSchool ||
    school.hasCoop ||
    hasScholarship ||
    (school.programTags?.length ?? 0) > 0;
  if (!hasAny) return null;

  return (
    <div className={`flex w-full flex-wrap gap-1.5 ${className}`}>
      {school.isHighDemand && (
        <span className={`${badgeBase} border-emerald-100 bg-emerald-50 text-emerald-700`}>
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Ngành khát nhân lực
        </span>
      )}
      {school.noVisaCap && (
        <span className={`${badgeBase} border-sky-100 bg-sky-50 text-sky-700`}>
          <CheckCircle className="h-3.5 w-3.5" aria-hidden />
          Không giới hạn Visa
        </span>
      )}
      {hasScholarship && (
        <span className={`${badgeBase} border-orange-100 bg-orange-50 text-orange-600`}>
          <Percent className="h-3.5 w-3.5" aria-hidden />
          Học bổng đến {school.scholarshipUpTo}%
        </span>
      )}
      {school.isTopSchool && (
        <span className={`${badgeBase} border-amber-100 bg-amber-50 text-amber-700`}>
          <Trophy className="h-3.5 w-3.5" aria-hidden />
          Trường Top đầu
        </span>
      )}
      {school.hasCoop && (
        <span className={`${badgeBase} border-indigo-100 bg-indigo-50 text-indigo-700`}>
          <GraduationCap className="h-3.5 w-3.5" aria-hidden />
          Thực tập Co-op
        </span>
      )}
      {school.programTags?.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600"
        >
          <Flame className="h-3 w-3 text-orange-500" aria-hidden />
          {tag}
        </span>
      ))}
    </div>
  );
}
