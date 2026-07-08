import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";

/**
 * Hero banner full-width — hiện dùng gradient placeholder,
 * thay bằng ảnh banner thật (next/image, priority) khi có asset.
 */
export function HeroBanner() {
  return (
    <section
      aria-label="Banner chính"
      className="relative flex aspect-video w-full items-center overflow-hidden bg-gradient-to-r from-primary via-primary-light to-blue-100 md:aspect-[21/9]"
    >
      {/* Họa tiết trang trí */}
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10" aria-hidden />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-72 w-72 rounded-full bg-accent/20" aria-hidden />

      {/* md:pl-40 chừa chỗ cho FloatingCTA rail bên trái */}
      <div className="mx-auto w-full max-w-7xl px-4 md:pl-40">
        <div className="max-w-2xl text-white">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-white/80">
            {siteConfig.shortName} — Chắp cánh ước mơ toàn cầu
          </p>
          <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
            Du học <span className="text-yellow-300">USA</span> &amp; 12+ quốc gia
            <br />
            Học bổng lên đến{" "}
            <span className="text-accent bg-white rounded-md px-2">50%</span>
          </h1>
          <p className="mt-4 text-base text-white/90 md:text-lg">
            THPT lớp 9–12, Cao đẳng, Đại học, Sau đại học — du học cả gia đình.
          </p>
          <a href="#lead-form" className="mt-6 inline-block">
            <Button variant="accent" size="lg" className="shadow-lg">
              Nhận Ưu Đãi
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
