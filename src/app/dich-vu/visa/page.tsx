import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Check,
  Plane,
  GraduationCap,
  Users,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import {
  visaTypes,
  visaProcessSteps,
  documentRequirements,
  visaPricing,
  whyChooseRogVisa,
  visaFAQs,
} from "@/data/services";
import { ServiceTabs } from "@/components/services/ServiceTabs";
import { ServiceCard } from "@/components/services/ServiceCard";
import { CountryBadges } from "@/components/services/CountryBadges";
import { DataTable } from "@/components/services/DataTable";
import { FaqAccordion } from "@/components/services/FaqAccordion";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Dịch Vụ Visa",
  description:
    "Dịch vụ xin visa du học, du lịch, thăm thân chuyên nghiệp — tỷ lệ đậu trên 95%. Hỗ trợ visa Mỹ, Anh, Úc, Canada, Singapore.",
};

const visaCountries = [
  { name: "Mỹ", code: "us", gradient: "from-blue-600 to-blue-900" },
  { name: "Anh", code: "uk", gradient: "from-red-600 to-blue-800" },
  { name: "Úc", code: "au", gradient: "from-blue-700 to-blue-900" },
  { name: "Canada", code: "ca", gradient: "from-red-500 to-red-700" },
  { name: "Singapore", code: "sg", gradient: "from-red-500 to-white" },
  { name: "New Zealand", code: "nz", gradient: "from-blue-800 to-blue-950" },
  { name: "Hàn Quốc", code: "kr", gradient: "from-red-500 to-blue-500" },
  { name: "Nhật Bản", code: "jp", gradient: "from-red-600 to-white" },
];

// ── Helper: build card data from visaTypes ──────────────────────────
const serviceCards = visaTypes.map((vt) => ({
  title: vt.name,
  description: vt.description,
  features: [
    "Tư vấn lộ trình miễn phí",
    "Kiểm tra hồ sơ đầy đủ",
    "Luyện phỏng vấn 1-1",
    "Theo dõi tiến trình 24/7",
  ],
}));

const documentColumns = [
  {
    key: "category",
    header: "Loại giấy tờ",
    render: (value: unknown) => (
      <span className="font-semibold text-navy">{String(value)}</span>
    ),
  },
  {
    key: "items",
    header: "Chi tiết",
    render: (value: unknown) => (
      <ul className="space-y-1">
        {(value as string[]).map((item, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    ),
  },
];

const pricingColumns = [
  {
    key: "service",
    header: "Dịch vụ",
    render: (value: unknown) => (
      <span className="font-semibold text-navy">{String(value)}</span>
    ),
  },
  {
    key: "price",
    header: "Chi phí",
    render: (value: unknown) => (
      <span className="font-bold text-accent-orange">{String(value)}</span>
    ),
  },
  {
    key: "note",
    header: "Ghi chú",
    render: (value: unknown) => (
      <span className="text-xs text-slate-500">{value ? String(value) : "—"}</span>
    ),
  },
];

export default function VisaServicesPage() {
  return (
    <main className="min-h-screen">
      {/* ── Section 1: Breadcrumb ──────────────────────────────── */}
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">
              Trang chủ
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <Link href="/dich-vu" className="hover:text-primary">
              Dịch vụ
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden />
            <span className="font-semibold text-primary">Dịch vụ Visa</span>
          </nav>
        </div>
      </section>

      {/* ── Section 2: Title + Tabs ────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-12">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-extrabold text-navy md:text-4xl">
            Dịch Vụ Visa
          </h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600">
            ROG Education cung cấp dịch vụ tư vấn và xử lý hồ sơ visa chuyên nghiệp cho
            du học sinh và người Việt Nam. Tỷ lệ đậu visa trên 95% — hỗ trợ tận tâm từ A-Z.
          </p>
        </div>
        <div className="mx-auto max-w-lg">
          <ServiceTabs tabs={visaTypes} />
        </div>
      </section>

      {/* ── Section 3: Hero placeholder ────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="flex aspect-[21/9] items-center justify-center rounded-xl bg-gray-200">
          <div className="text-center">
            <div className="mb-3 flex justify-center gap-3">
              {[GraduationCap, Plane, Users].map((Icon, idx) => (
                <div
                  key={idx}
                  className="rounded-full bg-white/80 p-3 shadow-sm"
                >
                  <Icon className="h-6 w-6 text-primary" aria-hidden />
                </div>
              ))}
            </div>
            <p className="text-lg font-bold text-slate-500">
              Hình ảnh / Video giới thiệu dịch vụ Visa
            </p>
            <p className="text-sm text-slate-400">
              TODO: Thay placeholder bằng media thật
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 4: Grid Service Cards (3c desktop / 1c mobile) ─ */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-navy">
            Các loại visa ROG hỗ trợ
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {serviceCards.map((card) => (
              <ServiceCard
                key={card.title}
                title={card.title}
                description={card.description}
                features={card.features}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Country badges ──────────────────────────── */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-navy">
            Quốc gia hỗ trợ visa
          </h2>
          <div className="flex justify-center">
            <CountryBadges countries={visaCountries} />
          </div>
        </div>
      </section>

      {/* ── Section 6: 2 cột — Lý do chọn ROG / Ảnh ───────────── */}
      <section className="bg-navy py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            {/* Left: Lý do */}
            <div>
              <h2 className="mb-6 text-2xl font-bold text-white">
                Tại sao chọn ROG cho dịch vụ Visa?
              </h2>
              <ul className="space-y-3">
                {whyChooseRogVisa.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent-orange" aria-hidden />
                    <span className="text-sm leading-relaxed text-gray-200">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Right: Placeholder ảnh */}
            <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-white/10">
              <p className="text-sm text-gray-400">Ảnh minh họa dịch vụ Visa</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 7: Quy trình làm visa (numbered list) ──────── */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-10 text-center text-2xl font-bold text-navy">
            Quy trình làm visa tại ROG
          </h2>
          <div className="relative">
            {/* Vertical line (desktop) */}
            <div className="absolute left-[27px] top-0 hidden h-full w-0.5 bg-primary-light/30 md:block lg:left-1/2 lg:-translate-x-0.5" />
            <div className="space-y-8">
              {visaProcessSteps.map((step, idx) => (
                <div
                  key={step.step}
                  className={`relative flex flex-col gap-4 md:flex-row md:gap-8 ${
                    idx % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  {/* Step number badge */}
                  <div className="z-10 flex items-center justify-center md:w-auto lg:w-1/2 lg:justify-center">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-extrabold text-white shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  {/* Step content */}
                  <div className="flex-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:w-full lg:w-1/2">
                    <h3 className="mb-2 text-base font-bold text-navy">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 8: Table hồ sơ cần có ──────────────────────── */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-center text-2xl font-bold text-navy">
            Hồ sơ cần chuẩn bị
          </h2>
          <DataTable
            columns={documentColumns}
            rows={documentRequirements as unknown as Record<string, unknown>[]}
            caption="Danh sách giấy tờ cần thiết cho hồ sơ xin visa"
          />
        </div>
      </section>

      {/* ── Section 9: Table chi phí dịch vụ ───────────────────── */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-center text-2xl font-bold text-navy">
            Chi phí dịch vụ Visa
          </h2>
          <DataTable
            columns={pricingColumns}
            rows={visaPricing as unknown as Record<string, unknown>[]}
            caption="Bảng giá dịch vụ visa — ROG Education"
          />
          <p className="mt-3 text-center text-xs text-slate-400">
            * Giá trên chưa bao gồm lệ phí Lãnh sự quán. Liên hệ hotline {siteConfig.hotline} để được báo giá chính xác.
          </p>
        </div>
      </section>

      {/* ── Section 10: FAQ Accordion ──────────────────────────── */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-navy">
            Câu hỏi thường gặp về Visa
          </h2>
          <FaqAccordion items={visaFAQs} />
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────────────────── */}
      <section className="bg-primary py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">
            Bạn cần tư vấn Visa ngay hôm nay?
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-primary-light/80">
            Để lại thông tin hoặc gọi hotline {siteConfig.hotline} — Đội ngũ ROG sẽ liên hệ
            tư vấn miễn phí trong vòng 24h.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a href="#lead-form">
              <Button variant="accent">Đăng ký tư vấn miễn phí</Button>
            </a>
            <a
              href={siteConfig.hotlineHref}
              className="font-bold text-white underline underline-offset-4 transition-colors hover:text-accent-orange"
            >
              Hoặc gọi: {siteConfig.hotline}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}