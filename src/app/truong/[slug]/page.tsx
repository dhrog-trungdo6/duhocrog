import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  BookOpen,
  CheckCircle,
  ChevronRight,
  DollarSign,
  Globe,
  GraduationCap,
  MapPin,
} from "lucide-react";
import type { School } from "@/types";
import { STUDY_LEVEL_LABELS } from "@/types";
import { destinations, provinces } from "@/data/destinations";
import { schools as allSchools } from "@/data/schools";

/** ── Mock school details (mở rộng từ schools.ts) ─────────────── */
const schoolDetails: Record<string, School> = {
  "ball-state-university": {
    ...allSchools.find((s) => s.slug === "ball-state-university")!,
    description:
      "Ball State University là trường đại học công lập tọa lạc tại Muncie, Indiana. Với hơn 100 năm lịch sử, trường nổi tiếng với các chương trình đào tạo chất lượng cao trong lĩnh vực Kinh doanh, Giáo dục, và Khoa học Sức khỏe. Sinh viên quốc tế được hưởng môi trường học tập hiện đại cùng chi phí hợp lý.",
    highlights: [
      "Top 200 National Universities (U.S. News & World Report 2026)",
      "Hơn 190 chương trình đại học và sau đại học",
      "Cơ sở vật chất hiện đại với thư viện Digital trung tâm",
      "Học bổng lên đến 50% cho sinh viên quốc tế xuất sắc",
      "Vị trí thuận tiện, cách Chicago 3 giờ lái xe",
    ],
    programs: [
      { name: "Business Administration (BBA)", level: "dai-hoc" as const },
      { name: "Computer Science (BS)", level: "dai-hoc" as const },
      { name: "Nursing (BSN)", level: "dai-hoc" as const },
      { name: "Education (BA)", level: "dai-hoc" as const },
      { name: "Digital Media & Animation (BFA)", level: "dai-hoc" as const },
    ],
    requirements: [
      { category: "Học vấn", items: ["Tốt nghiệp THPT với GPA tối thiểu 2.5/4.0", "SAT/ACT không bắt buộc nhưng khuyến khích"] },
      { category: "Tiếng Anh", items: ["IELTS 6.0 / TOEFL iBT 71 / Duolingo 105"] },
      { category: "Hồ sơ", items: ["Thư giới thiệu từ giáo viên (1-2 thư)", "Bài luận cá nhân (Personal Statement)"] },
    ],
  },
  "umass-boston": {
    ...allSchools.find((s) => s.slug === "umass-boston")!,
    description:
      "University of Massachusetts Boston (UMass Boston) là trường đại học nghiên cứu công lập duy nhất tại Boston. Với vị trí đắc địa bên bờ biển, sinh viên được tiếp cận mạng lưới doanh nghiệp và tổ chức hàng đầu thế giới ngay trong lòng thành phố.",
    highlights: [
      "Thuộc hệ thống University of Massachusetts danh tiếng",
      "Top 100 trường đại học công lập Mỹ",
      "Vị trí ngay trung tâm Boston — thủ phủ giáo dục thế giới",
      "Hơn 80 chương trình đào tạo đa dạng",
      "Cơ hội thực tập tại các tập đoàn Fortune 500",
    ],
    programs: [
      { name: "Computer Engineering (BS)", level: "dai-hoc" as const },
      { name: "Business Management (BBA)", level: "dai-hoc" as const },
      { name: "Environmental Science (BS)", level: "dai-hoc" as const },
      { name: "Psychology (BA)", level: "dai-hoc" as const },
      { name: "Information Technology (BS)", level: "dai-hoc" as const },
    ],
    requirements: [
      { category: "Học vấn", items: ["Tốt nghiệp THPT với GPA tối thiểu 3.0/4.0", "SAT/ACT không bắt buộc"] },
      { category: "Tiếng Anh", items: ["IELTS 6.5 / TOEFL iBT 79"] },
      { category: "Hồ sơ", items: ["Thư giới thiệu (1 thư từ giáo viên)", "Personal Essay 500-650 từ"] },
    ],
  },
  "green-river-college": {
    ...allSchools.find((s) => s.slug === "green-river-college")!,
    description:
      "Green River College là trường cao đẳng cộng đồng hàng đầu bang Washington, nổi tiếng với chương trình chuyển tiếp đại học (University Transfer). Đây là lựa chọn lý tưởng cho sinh viên quốc tế muốn tiết kiệm chi phí 2 năm đầu trước khi chuyển tiếp lên các trường đại học top đầu.",
    highlights: [
      "Chương trình 2+2: học 2 năm → chuyển tiếp đại học top Mỹ",
      "Học phí thấp, chỉ ~$12,000/năm",
      "Đối tác với 30+ trường đại học (UW, UIUC, Purdue...)",
      "Hỗ trợ sinh viên quốc tế toàn diện",
      "Khuôn viên xanh, an toàn, cách Seattle 45 phút",
    ],
    programs: [
      { name: "University Transfer (2+2 Program)", level: "dai-hoc" as const },
      { name: "Business (AA)", level: "cao-dang" as const },
      { name: "Engineering (AS)", level: "cao-dang" as const },
      { name: "Aviation Technology (AAS)", level: "cao-dang" as const },
      { name: "Information Technology (AAS)", level: "cao-dang" as const },
    ],
    requirements: [
      { category: "Học vấn", items: ["Tốt nghiệp THPT hoặc đang học lớp 12", "Bảng điểm THPT"] },
      { category: "Tiếng Anh", items: ["IELTS 5.5 / TOEFL iBT 61 / Duolingo 85"] },
      { category: "Tài chính", items: ["Chứng minh tài chính tối thiểu $23,000"] },
    ],
  },
};

/**
 * getSchoolBySlug — mock fetch (sẽ nối Supabase sau khi apply migration #4).
 */
function getSchoolBySlug(slug: string): School | null {
  // Ưu tiên schoolDetails (có description/highlights mở rộng)
  if (schoolDetails[slug]) return schoolDetails[slug];
  // Fallback: tìm trong allSchools có slug khớp
  return allSchools.find((s) => s.slug === slug) ?? null;
}

/** Generate metadata */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const school = getSchoolBySlug(params.slug);
  if (!school) return { title: "Không tìm thấy trường" };
  return {
    title: `${school.name} — Du học ROG`,
    description: school.description ?? `Thông tin chi tiết về ${school.name} — học phí, học bổng, điều kiện đầu vào từ ROG Education.`,
  };
}

/** Format tiền USD */
function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

/** ── Sub-components nội bộ (giữ trong cùng file) ────────────── */

function Breadcrumb({ name }: { name: string }) {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <Link href="/tim-truong" className="hover:text-primary">Tìm trường</Link>
          <ChevronRight className="h-3 w-3" aria-hidden />
          <span className="font-semibold text-primary line-clamp-1">{name}</span>
        </nav>
      </div>
    </section>
  );
}

function SidebarCard({ tuitionUsd, scholarshipUpTo }: { tuitionUsd: number; scholarshipUpTo?: number }) {
  return (
    <div className="sticky top-24 rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
        Thông tin học phí
      </h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
          <DollarSign className="h-5 w-5 shrink-0 text-primary" aria-hidden />
          <div>
            <p className="text-xs text-slate-500">Học phí trung bình</p>
            <p className="text-xl font-extrabold text-primary">
              {formatUsd(tuitionUsd)}
              <span className="text-sm font-normal text-slate-400">/năm</span>
            </p>
          </div>
        </div>
        {scholarshipUpTo !== undefined && scholarshipUpTo > 0 && (
          <div className="flex items-center gap-3 rounded-lg bg-accent-orange/5 p-4">
            <Award className="h-5 w-5 shrink-0 text-accent-orange" aria-hidden />
            <div>
              <p className="text-xs text-slate-500">Học bổng tối đa</p>
              <p className="text-xl font-extrabold text-accent-orange">
                {scholarshipUpTo}%
              </p>
            </div>
          </div>
        )}
      </div>
      <a
        href="#lead-form"
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-orange px-5 py-3 text-sm font-bold text-white shadow-sm transition-all hover:scale-[1.02] hover:bg-accent-orange-dark"
      >
        <BookOpen className="h-4 w-4" aria-hidden />
        Đăng ký tư vấn ngay
      </a>
    </div>
  );
}

function SectionHeading({ icon: Icon, title }: { icon: typeof CheckCircle; title: string }) {
  return (
    <h2 className="mb-4 flex items-center gap-2.5 text-lg font-bold text-primary">
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      {title}
    </h2>
  );
}

/** ── Page chính ─────────────────────────────────────────────── */

export default function SchoolDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const school = getSchoolBySlug(params.slug);
  if (!school) notFound();

  const countryName =
    destinations.find((c) => c.code === school.country)?.name.replace("Du học ", "") ??
    school.country;
  const provinceName =
    provinces.find((p) => p.code === school.province)?.name ?? school.province;

  return (
    <main className="min-h-screen bg-slate-50">
      <Breadcrumb name={school.name} />

      {/* ── Hero Section ─────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary-dark via-primary to-navy">
        <div className="mx-auto max-w-7xl px-4 py-10 md:py-14">
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
            {/* Logo trường */}
            <div className="shrink-0 rounded-xl bg-white p-3 shadow-lg -mb-12 md:-mb-16 relative z-10">
              {school.logoUrl ? (
                <Image
                  src={school.logoUrl}
                  alt={school.name}
                  width={80}
                  height={80}
                  className="h-20 w-20 object-contain"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-light">
                  <GraduationCap className="h-10 w-10 text-white" aria-hidden />
                </div>
              )}
            </div>

            <div className="flex-1 pt-8 text-center md:pt-0 md:text-left">
              <h1 className="text-2xl font-extrabold text-white md:text-3xl">
                {school.name}
              </h1>
              <div className="mt-3 flex flex-wrap justify-center gap-2 md:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {countryName}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  {provinceName}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  <Globe className="h-3.5 w-3.5" aria-hidden />
                  {STUDY_LEVEL_LABELS[school.level]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-12">
          {/* ── Cột trái: Nội dung chi tiết ── */}
          <div className="space-y-10 md:col-span-8">
            {/* Giới thiệu */}
            {school.description && (
              <section>
                <h2 className="mb-4 text-lg font-bold text-primary">Giới thiệu</h2>
                <p className="text-sm leading-relaxed text-slate-700">
                  {school.description}
                </p>
              </section>
            )}

            {/* Điểm nổi bật */}
            {school.highlights && school.highlights.length > 0 && (
              <section>
                <SectionHeading icon={CheckCircle} title="Điểm nổi bật" />
                <ul className="space-y-3">
                  {school.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent-orange" aria-hidden />
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Ngành học thế mạnh */}
            {school.programs && school.programs.length > 0 && (
              <section>
                <SectionHeading icon={BookOpen} title="Ngành học thế mạnh" />
                <div className="grid gap-3 sm:grid-cols-2">
                  {school.programs.map((program, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-primary-light hover:bg-primary-light/5"
                    >
                      <GraduationCap className="mb-1 h-4 w-4 text-primary-light" aria-hidden />
                      {program.name}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Yêu cầu đầu vào */}
            {school.requirements && school.requirements.length > 0 && (
              <section>
                <SectionHeading icon={CheckCircle} title="Yêu cầu đầu vào" />
                <div className="space-y-4">
                  {school.requirements.map((req, idx) => (
                    <div key={idx} className="rounded-lg border border-gray-200 bg-white p-5">
                      <h3 className="mb-2 text-sm font-bold text-navy">{req.category}</h3>
                      <ul className="space-y-2">
                        {req.items.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-3">
                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                            <span className="text-sm text-slate-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Cột phải: Sticky Sidebar ── */}
          <aside className="md:col-span-4">
            <SidebarCard
              tuitionUsd={school.tuitionUsd}
              scholarshipUpTo={school.scholarshipUpTo}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}