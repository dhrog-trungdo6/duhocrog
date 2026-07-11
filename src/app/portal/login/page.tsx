"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, ShieldAlert } from "lucide-react";
import { portalLoginSchema } from "@/lib/validations";
import type { PortalLoginValues } from "@/lib/validations";
import { siteConfig } from "@/config/site";

export default function PortalLoginPage() {
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PortalLoginValues>({ resolver: zodResolver(portalLoginSchema) });

  async function onSubmit(values: PortalLoginValues) {
    setServerError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/portal/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Đăng nhập thất bại");
      window.location.href = "/portal";
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy via-navy/95 to-navy flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl mb-3">
            R
          </div>
          <h1 className="text-xl font-bold text-navy">Student Portal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Đăng nhập bằng mã truy cập từ tư vấn viên
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Số điện thoại</label>
            <input
              type="tel"
              placeholder="0909 123 456"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none ${
                errors.phone ? "border-red-400" : "border-gray-300"
              }`}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-1">Mã truy cập</label>
            <input
              type="text"
              placeholder="Nhập mã 8 ký tự"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm font-mono tracking-widest uppercase focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none ${
                errors.code ? "border-red-400" : "border-gray-300"
              }`}
              autoComplete="off"
              {...register("code")}
            />
            {errors.code && (
              <p className="text-xs text-red-600 mt-1">{errors.code.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-primary hover:bg-primary-light disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="animate-pulse">Đang đăng nhập...</span>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Chưa có mã? Liên hệ hotline{" "}
          <a href={siteConfig.hotlineHref} className="text-primary font-semibold underline">
            {siteConfig.hotline}
          </a>
        </p>
      </div>
    </div>
  );
}