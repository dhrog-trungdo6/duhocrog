/** Mảnh UI dùng chung cho các tab của SchoolFormModal (v1.10.0). */

export const inputClasses =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none";

export const labelClasses = "mb-1 block text-sm font-semibold text-slate-700";

export function FieldErr({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs font-semibold text-accent">
      {message}
    </p>
  );
}
