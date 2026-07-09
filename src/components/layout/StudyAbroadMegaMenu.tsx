"use client";

/**
 * StudyAbroadMegaMenu — Mega Menu (dropdown lớn) cho nav item "DU HỌC".
 *
 * ⚠️ Desktop-only (hidden md:block). Việc show/hide do RogHeader cha quản lý —
 * component này chỉ render nội dung menu, không tự quản lý trạng thái mở/đóng.
 * Mobile của dự án dùng accordion riêng trong header.
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, GraduationCap } from "lucide-react";
import type { StudyDestination, StudyAbroadMegaMenuProps } from "@/types";

/** Render ảnh hoặc placeholder gradient khi chưa có imageUrl. */
function ArticleThumbnail({
  imageUrl,
  alt,
  className = "",
}: {
  imageUrl: string;
  alt: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={imageUrl}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100px, 200px"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark ${className}`}
    >
      <span className="text-2xl font-bold text-white/30" aria-hidden>
        {alt.charAt(0)}
      </span>
    </div>
  );
}

export default function StudyAbroadMegaMenu({
  destinations,
  className = "",
}: StudyAbroadMegaMenuProps) {
  const [activeId, setActiveId] = useState(destinations[0]?.id ?? "");

  if (destinations.length === 0) return null;

  const activeDestination = destinations.find((d) => d.id === activeId) ?? destinations[0];
  const { featuredArticle, relatedArticles, shortName } = activeDestination;

  return (
    <div
      className={`absolute left-0 top-full z-50 w-full bg-navy shadow-2xl ${className}`}
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
          {/* ── Cột trái: Danh sách quốc gia ── */}
          <nav className="border-r border-white/10" aria-label="Danh sách quốc gia du học">
            <ul>
              {destinations.map((dest, idx) => {
                const isActive = activeId === dest.id;
                const isLast = idx === destinations.length - 1;
                return (
                  <li key={dest.id}>
                    <Link
                      href={`/du-hoc/${dest.slug}`}
                      onMouseEnter={() => setActiveId(dest.id)}
                      className={`flex items-center justify-between px-5 py-3.5 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      } ${isLast ? "" : "border-b border-white/10"}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <GraduationCap size={16} className="shrink-0 text-primary-light" aria-hidden />
                        {dest.name}
                      </span>
                      {isActive && (
                        <ChevronRight size={14} className="shrink-0 text-slate-400" aria-hidden />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* ── Cột phải: Nội dung động theo quốc gia ── */}
          <div className="p-6" key={activeId}>
            {/* Tiêu đề section */}
            <h3 className="border-b border-white/10 pb-3 mb-5 text-sm font-semibold tracking-wide text-slate-300 uppercase">
              TIN TỨC DU HỌC {shortName}
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              {/* ── Cột con 1: Bài nổi bật ── */}
              <article>
                <Link href={featuredArticle.href} className="group block">
                  <div className="relative aspect-video overflow-hidden rounded-lg">
                    <ArticleThumbnail
                      imageUrl={featuredArticle.imageUrl ?? ""}
                      alt={featuredArticle.title}
                      className="h-full w-full"
                    />
                    {featuredArticle.isHot && (
                      <span className="absolute left-2 top-2 rounded bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                        HOT
                      </span>
                    )}
                  </div>
                  <h4 className="mt-3 font-bold text-white line-clamp-2 transition-colors group-hover:text-accent-orange">
                    {featuredArticle.title}
                  </h4>
                  <p className="mt-1.5 text-sm text-slate-300 line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                </Link>
              </article>

              {/* ── Cột con 2: Danh sách bài liên quan ── */}
              <div className="space-y-4">
                {relatedArticles.map((article) => (
                  <article key={article.id}>
                    <Link href={article.href} className="group flex gap-3 items-start">
                      <ArticleThumbnail
                        imageUrl={article.imageUrl ?? ""}
                        alt={article.title}
                        className="h-16 w-24 shrink-0 rounded"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-white line-clamp-2 transition-colors group-hover:text-accent-orange">
                          {article.title}
                        </h4>
                        <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}