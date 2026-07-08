"use client";

import { useEffect, useRef, useState } from "react";
import { Award, GraduationCap, School } from "lucide-react";
import type { Stat } from "@/types";
import { stats } from "@/data/stats";
import { siteConfig } from "@/config/site";

const ICONS: Record<Stat["icon"], typeof Award> = {
  award: Award,
  school: School,
  graduation: GraduationCap,
};

const COUNT_DURATION_MS = 1500;

/** Đếm số khi section vào viewport — chỉ chạy 1 lần. */
function useCountUp(target: number, start: boolean): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!start) return;
    let frame: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - t0) / COUNT_DURATION_MS, 1);
      // easeOutCubic để phần cuối chậm lại tự nhiên
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target]);

  return value;
}

function StatItem({ stat, visible }: { stat: Stat; visible: boolean }) {
  const Icon = ICONS[stat.icon];
  const count = useCountUp(stat.value, visible);

  return (
    <li className="flex flex-col items-center gap-3 text-center">
      <span className="rounded-full bg-primary/10 p-4">
        <Icon className="h-8 w-8 text-primary" aria-hidden />
      </span>
      <span className="text-3xl font-extrabold text-primary md:text-4xl">
        {count.toLocaleString("vi-VN")}
        {stat.suffix}
      </span>
      <span className="text-sm font-semibold uppercase text-slate-600">
        {stat.label}
      </span>
    </li>
  );
}

export function StatsCounter() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // chỉ chạy 1 lần
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="bg-slate-50 py-12" aria-label="Thống kê năng lực">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <h2 className="text-xl font-extrabold uppercase text-slate-800 md:text-2xl">
            {siteConfig.name} — Công ty tư vấn du học uy tín, chuyên nghiệp
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Với kỹ năng, kinh nghiệm được đúc kết qua nhiều năm, đội ngũ nhân viên
            không ngừng thay đổi và cải thiện để luôn nắm bắt kịp thời gian nào
            trong thị trường du học đầy cạnh tranh. ROG cam kết đồng hành cùng học
            sinh, sinh viên và những con người đã tin tưởng và đồng hành với chúng
            tôi từ lúc đầu cho tới tận ngày hôm nay.
          </p>
        </div>
        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {stats.map((stat) => (
            <StatItem key={stat.id} stat={stat} visible={visible} />
          ))}
        </ul>
      </div>
    </section>
  );
}
