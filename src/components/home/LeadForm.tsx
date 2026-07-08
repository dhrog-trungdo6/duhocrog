"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { leadFormSchema, type LeadFormValues } from "@/lib/validations";
import { destinations } from "@/data/destinations";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";

interface LeadFormProps {
  /** "dark" khi đặt trên nền primary (WhyChooseUs), "light" khi trong modal trắng. */
  variant?: "dark" | "light";
  /** Nguồn lead — lưu vào cột leads.source để đo kênh chuyển đổi. */
  source?: "homepage_form" | "floating_cta";
}

/** Form đăng ký tư vấn — tái sử dụng ở WhyChooseUs và FloatingCTA modal, ghi vào Supabase qua /api/leads. */
export function LeadForm({ variant = "dark", source = "homepage_form" }: LeadFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { fullName: "", phone: "", country: "" },
  });

  const isDark = variant === "dark";
  const inputClasses = isDark
    ? "w-full rounded-md border border-white/30 bg-white/10 px-4 py-2.5 text-white placeholder:text-white/60 focus:border-white focus:outline-none"
    : "w-full rounded-md border border-slate-300 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none";
  const errorClasses = isDark ? "text-yellow-300" : "text-accent";

  const onSubmit = async (data: LeadFormValues) => {
    setSubmitError(null);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source, website_hp: "" }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "Gửi thông tin thất bại");
      }
      setSubmitted(true);
    } catch (error) {
      console.error("[LeadForm] submit failed:", error);
      setSubmitError(
        error instanceof Error && error.message !== "Failed to fetch"
          ? error.message
          : "Không gửi được thông tin. Vui lòng kiểm tra kết nối mạng hoặc gọi hotline."
      );
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className={`h-12 w-12 ${isDark ? "text-white" : "text-green-600"}`} aria-hidden />
        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
          Đăng ký thành công!
        </p>
        <p className={`text-sm ${isDark ? "text-white/80" : "text-slate-600"}`}>
          Chuyên viên ROG sẽ liên hệ với bạn trong 24h làm việc.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <input
          type="text"
          placeholder="Họ và tên *"
          autoComplete="name"
          aria-label="Họ và tên"
          className={inputClasses}
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className={`mt-1 text-xs ${errorClasses}`}>{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <input
          type="tel"
          placeholder="Số điện thoại *"
          autoComplete="tel"
          aria-label="Số điện thoại"
          className={inputClasses}
          {...register("phone")}
        />
        {errors.phone && (
          <p className={`mt-1 text-xs ${errorClasses}`}>{errors.phone.message}</p>
        )}
      </div>

      <div>
        <select
          aria-label="Quốc gia quan tâm"
          className={`${inputClasses} ${isDark ? "[&>option]:text-slate-900" : ""}`}
          defaultValue=""
          {...register("country")}
        >
          <option value="" disabled>
            Quốc gia quan tâm *
          </option>
          {destinations.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name.replace("Du học ", "")}
            </option>
          ))}
        </select>
        {errors.country && (
          <p className={`mt-1 text-xs ${errorClasses}`}>{errors.country.message}</p>
        )}
      </div>

      {submitError && (
        <p
          role="alert"
          className={`rounded-md px-3 py-2 text-sm font-semibold ${
            isDark ? "bg-white/15 text-yellow-300" : "bg-red-50 text-accent"
          }`}
        >
          {submitError}
        </p>
      )}

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Đăng ký tư vấn miễn phí
      </Button>

      <p className={`text-center text-xs ${isDark ? "text-white/70" : "text-slate-500"}`}>
        Hoặc gọi Hotline hỗ trợ gấp:{" "}
        <a href={siteConfig.hotlineHref} className="font-bold underline">
          {siteConfig.hotline}
        </a>
      </p>
    </form>
  );
}
