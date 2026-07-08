"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, FileCheck2, Quote } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import { Button } from "@/components/ui/Button";

/** Carousel cảm nhận + minh chứng visa. Ảnh minh chứng đang là placeholder — thay next/image khi có ảnh đã che thông tin. */
export function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const current = testimonials[index];

  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  const next = () => setIndex((i) => (i + 1) % testimonials.length);

  return (
    <section className="bg-navy py-14 text-white" aria-labelledby="testimonial-title">
      <div className="mx-auto max-w-4xl px-4">
        <h2 id="testimonial-title" className="mb-10 text-center text-2xl font-extrabold uppercase">
          Khách hàng nói gì về chúng tôi?
        </h2>

        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
          <button
            type="button"
            onClick={prev}
            aria-label="Cảm nhận trước"
            className="hidden justify-self-end rounded-full border border-white/30 p-3 transition-colors hover:bg-white/10 md:block"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>

          <div className="text-center md:min-w-[28rem]">
            {/* Placeholder ảnh minh chứng visa */}
            <div className="mx-auto mb-6 flex h-40 w-64 items-center justify-center rounded-lg border-2 border-dashed border-white/30 bg-white/5">
              <div className="text-center">
                <FileCheck2 className="mx-auto h-10 w-10 text-white/60" aria-hidden />
                <p className="mt-2 text-xs text-white/60">
                  Minh chứng visa — {current.program}
                </p>
              </div>
            </div>
            <Quote className="mx-auto h-6 w-6 text-accent" aria-hidden />
            <blockquote className="mt-3 text-base italic leading-relaxed text-white/90">
              “{current.quote}”
            </blockquote>
            <p className="mt-4 font-bold">
              {current.studentName}{" "}
              <span className="font-normal text-white/70">— {current.program}</span>
            </p>
            <div className="mt-4 flex justify-center gap-2" aria-hidden>
              {testimonials.map((t, i) => (
                <span
                  key={t.id}
                  className={`h-2 w-2 rounded-full ${i === index ? "bg-accent" : "bg-white/30"}`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Cảm nhận tiếp theo"
            className="hidden justify-self-start rounded-full border border-white/30 p-3 transition-colors hover:bg-white/10 md:block"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Nút prev/next cho mobile */}
        <div className="mt-6 flex justify-center gap-4 md:hidden">
          <button
            type="button"
            onClick={prev}
            aria-label="Cảm nhận trước"
            className="rounded-full border border-white/30 p-3"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Cảm nhận tiếp theo"
            className="rounded-full border border-white/30 p-3"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="mt-10 text-center">
          {/* TODO: trỏ tới trang danh sách visa thành công khi trang đó được dựng */}
          <a href="#">
            <Button variant="accent">Danh sách visa thành công</Button>
          </a>
        </div>
      </div>
    </section>
  );
}
