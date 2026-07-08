"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle, PenLine, Phone, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { LeadForm } from "@/components/home/LeadForm";

/**
 * Thanh CTA nổi: dọc cạnh trái (desktop) / thanh ngang đáy màn hình (mobile).
 * Nút "Đăng ký tư vấn" mở modal tái sử dụng LeadForm.
 */
export function FloatingCTA() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Ẩn cụm nút khi dialog đang mở để tránh chồng lớp */}
      {!dialogOpen && (
        <div className="fixed bottom-0 left-0 z-50 flex w-full flex-row md:bottom-auto md:top-[55%] md:w-auto md:flex-col md:gap-1">
          {!collapsed && (
            <>
              <a
                href={siteConfig.zalo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tư vấn qua Zalo"
                className="flex flex-1 items-center justify-center gap-2 bg-sky-500 px-3 py-3 text-xs font-semibold text-white transition-colors hover:bg-sky-600 md:flex-none md:rounded-r-md md:text-sm"
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                <span>Zalo</span>
              </a>
              <a
                href={siteConfig.hotlineHref}
                aria-label={`Gọi hotline ${siteConfig.hotline}`}
                className="flex flex-1 items-center justify-center gap-2 bg-primary px-3 py-3 text-xs font-semibold text-white transition-colors hover:bg-primary-light md:flex-none md:rounded-r-md md:text-sm"
              >
                <Phone className="h-5 w-5" aria-hidden />
                <span className="md:hidden">Gọi ngay</span>
                <span className="hidden md:inline">{siteConfig.hotline}</span>
              </a>
              <button
                type="button"
                onClick={() => setDialogOpen(true)}
                aria-label="Mở form đăng ký tư vấn"
                className="flex flex-1 items-center justify-center gap-2 bg-accent px-3 py-3 text-xs font-semibold text-white transition-colors hover:bg-accent-dark md:flex-none md:rounded-r-md md:text-sm"
              >
                <PenLine className="h-5 w-5" aria-hidden />
                <span>Đăng ký tư vấn</span>
              </button>
            </>
          )}
          {/* Nút thu gọn — chủ yếu cho mobile để không che nội dung */}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? "Mở rộng thanh liên hệ" : "Thu gọn thanh liên hệ"}
            className="flex items-center justify-center bg-navy px-2 py-3 text-white md:rounded-r-md"
          >
            {collapsed ? (
              <ChevronUp className="h-4 w-4 md:rotate-90" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4 md:-rotate-90" aria-hidden />
            )}
          </button>
        </div>
      )}

      {/* Modal đăng ký tư vấn */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Đăng ký tư vấn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDialogOpen(false);
          }}
        >
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setDialogOpen(false)}
              aria-label="Đóng"
              className="absolute right-3 top-3 rounded-full p-1.5 text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <h2 className="mb-1 text-xl font-bold text-primary">
              Đăng ký nhận tư vấn ngay
            </h2>
            <p className="mb-5 text-sm text-slate-600">
              Để lại thông tin, chuyên viên ROG sẽ gọi lại cho bạn.
            </p>
            <LeadForm variant="light" source="floating_cta" />
          </div>
        </div>
      )}
    </>
  );
}
