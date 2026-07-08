import { GraduationCap, Newspaper } from "lucide-react";
import { articles, scholarships } from "@/data/news";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

/** 2 cột: Tin tức du học | Thông tin học bổng. Thumbnail đang là placeholder — thay next/image khi có ảnh. */
export function NewsAndScholarships() {
  return (
    <section id="news" className="bg-slate-50 py-14" aria-label="Tin tức và học bổng">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 lg:grid-cols-2">
        {/* Cột 1: Tin tức */}
        <div>
          <h2 className="mb-8 text-center text-xl font-extrabold uppercase text-slate-800">
            <span className="border-b-4 border-primary pb-2">Tin tức chung</span>
          </h2>
          <ul className="space-y-5">
            {articles.map((article) => (
              <li key={article.id}>
                <a href={article.href} className="group flex gap-4">
                  <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-light">
                    <Newspaper className="h-8 w-8 text-white/80" aria-hidden />
                  </div>
                  <div>
                    <h3 className="font-bold leading-snug text-slate-800 transition-colors group-hover:text-primary">
                      {article.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {article.excerpt}
                    </p>
                    <time
                      dateTime={article.publishedAt}
                      className="mt-1 block text-xs text-slate-400"
                    >
                      {formatDate(article.publishedAt)}
                    </time>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 2: Học bổng */}
        <div>
          <h2 className="mb-8 text-center text-xl font-extrabold uppercase text-slate-800">
            <span className="border-b-4 border-accent pb-2">Thông tin học bổng</span>
          </h2>
          <ul className="space-y-5">
            {scholarships.map((scholarship) => (
              <li key={scholarship.id}>
                <a href={scholarship.href} className="group flex gap-4">
                  <div className="flex h-20 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-slate-200 bg-white p-2">
                    <GraduationCap className="h-6 w-6 text-accent" aria-hidden />
                    <span className="line-clamp-2 text-center text-[10px] font-semibold leading-tight text-slate-500">
                      {scholarship.universityName}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold leading-snug text-slate-800 transition-colors group-hover:text-accent">
                      {scholarship.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                      {scholarship.excerpt}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
