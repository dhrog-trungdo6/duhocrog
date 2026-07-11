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
import type {
  CostRow,
  School,
  SchoolAdmissionRequirements,
  SchoolCostBreakdown,
  SchoolSection,
} from "@/types";
import { STUDY_LEVEL_LABELS } from "@/types";
import { destinations, provinces } from "@/data/destinations";
import { schools as allSchools } from "@/data/schools";
import { formatUsd } from "@/lib/schools";
import { WHY_CHOOSE_ROG } from "@/data/ctaBox";
import {
  fetchSchoolBySlug,
  fetchSchoolsBySlugs,
  mergeSchoolPreferDb,
} from "@/lib/schools-server";
import { sanitizeHtml } from "@/lib/sanitize";
import { ProgramTags } from "@/components/schools/ProgramTags";

// ISR 5 phút — dữ liệu trường đổi qua admin/crawler, không cần realtime
export const revalidate = 300;

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
 * getSchoolBySlug — Supabase-first (service role, slug đã backfill #6):
 * field nào DB có dữ liệu thật thì đè lên mock, phần mock giàu nội dung
 * (3 trường schoolDetails) vẫn hiển thị cho tới khi crawler/admin điền DB.
 * DB lỗi/thiếu env → fallback mock hoàn toàn (Nguyên tắc #6).
 */
async function getSchoolBySlug(slug: string): Promise<School | null> {
  const dbSchool = await fetchSchoolBySlug(slug);
  const mock = schoolDetails[slug] ?? allSchools.find((s) => s.slug === slug) ?? null;

  if (dbSchool && mock) return mergeSchoolPreferDb(mock, dbSchool);
  return dbSchool ?? mock;
}

/** Generate metadata */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const school = await getSchoolBySlug(params.slug);
  if (!school) return { title: "Không tìm thấy trường" };
  return {
    title: `${school.name} — Du học ROG`,
    description: school.description ?? `Thông tin chi tiết về ${school.name} — học phí, học bổng, điều kiện đầu vào từ ROG Education.`,
  };
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
    // sticky do wrapper sidebar quản lý (bọc chung với QuickFactsCard)
    <div className="rounded-xl bg-white p-6 shadow-md">
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

/** Mục lục "Nội dung bài viết" — <details> gập/mở native, anchor tới id section. */
function TableOfContents({ items }: { items: Array<{ id: string; label: string }> }) {
  if (items.length < 3) return null;
  return (
    <details open className="rounded-xl border border-primary/15 bg-primary/5 px-5 py-4">
      <summary className="cursor-pointer select-none text-center text-sm font-bold text-slate-800">
        Nội dung bài viết <span className="font-normal text-primary">[ẩn/hiện]</span>
      </summary>
      <ol className="mt-3 space-y-1.5 text-sm">
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="text-primary hover:text-primary-light hover:underline">
              {i + 1}. {item.label}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}

/** Bản đồ vị trí — cột map_embed_url (migration #5). Chỉ nhận URL https. */
function MapSection({ src, schoolName }: { src: string; schoolName: string }) {
  return (
    <section id="vi-tri" className="scroll-mt-24">
      <SectionHeading icon={MapPin} title="Vị trí trên bản đồ" />
      <iframe
        src={src}
        title={`Bản đồ ${schoolName}`}
        loading="lazy"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-popups"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-[350px] w-full rounded-xl border border-gray-200 bg-white"
      />
    </section>
  );
}

/** Khối CTA cuối bài — tắt được qua Tab "Liên kết & CTA" (show_cta, migration #10). */
function CtaBox() {
  return (
    <section className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-6 md:p-8">
      <h2 className="mb-5 text-center text-lg font-bold text-slate-800">
        Vì sao nên chọn Du học ROG?
      </h2>
      <ul className="space-y-2.5">
        {WHY_CHOOSE_ROG.map((item) => (
          <li key={item} className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            <span className="text-sm text-slate-700">{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-center">
        <a
          href="#lead-form"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-bold uppercase text-white shadow-sm transition-colors hover:bg-primary-light"
        >
          Tôi muốn được tư vấn
        </a>
      </div>
    </section>
  );
}

/** Bài viết liên quan — trường active theo related_slugs (migration #10). */
function RelatedSchoolsSection({ schools }: { schools: School[] }) {
  return (
    <section className="border-t-2 border-primary/20 pt-6">
      <h2 className="mb-5 text-lg font-bold uppercase text-primary">Bài viết liên quan</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {schools.map((s) => (
          <Link
            key={s.slug}
            href={`/truong/${s.slug}`}
            prefetch={false}
            className="group rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm transition-shadow hover:shadow-md"
          >
            {s.logoUrl ? (
              <Image
                src={s.logoUrl}
                alt={s.name}
                width={120}
                height={60}
                className="mx-auto h-14 w-auto object-contain"
              />
            ) : (
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-light">
                <GraduationCap className="h-7 w-7 text-white" aria-hidden />
              </div>
            )}
            <p className="mt-3 text-sm font-semibold text-primary group-hover:text-primary-light">
              {s.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
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

/** "16,000 – 18,000 CAD/năm" — tiền theo đơn vị gốc (không quy đổi USD) */
function formatCostAmount(row: CostRow): string {
  if (row.amountMin === null) return row.note ?? "—";
  const fmt = (n: number) => n.toLocaleString("en-US");
  const amount =
    row.amountMax !== null && row.amountMax !== row.amountMin
      ? `${fmt(row.amountMin)} – ${fmt(row.amountMax)}`
      : fmt(row.amountMin);
  return row.unit ? `${amount} ${row.unit}` : amount;
}

/** Quick facts sidebar — dữ liệu migration #5 (cột phẳng) + #7 (quick_facts JSONB) */
function QuickFactsCard({ school }: { school: School }) {
  const qf = school.quickFacts;
  const facts: Array<{ label: string; value: string }> = [];

  const foundedYear = school.foundedYear ?? qf?.foundedYear;
  if (foundedYear) facts.push({ label: "Năm thành lập", value: String(foundedYear) });

  const schoolType = school.schoolType ?? qf?.schoolType;
  if (schoolType) facts.push({ label: "Loại trường", value: schoolType });

  const students = school.totalStudents
    ? school.totalStudents.toLocaleString("en-US")
    : qf?.studentCount;
  if (students) facts.push({ label: "Số lượng sinh viên", value: students });

  const intakes = school.intakes?.length ? school.intakes : qf?.intakes;
  if (intakes?.length) facts.push({ label: "Kỳ nhập học", value: intakes.join(", ") });

  const websiteUrl = school.websiteUrl ?? qf?.websiteUrl;

  if (facts.length === 0 && !websiteUrl) return null;

  return (
    <div className="rounded-xl bg-white p-6 shadow-md">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
        Thông tin nhanh
      </h3>
      <dl className="space-y-3">
        {facts.map((f) => (
          <div key={f.label} className="flex items-baseline justify-between gap-3 text-sm">
            <dt className="shrink-0 text-slate-500">{f.label}</dt>
            <dd className="text-right font-semibold text-slate-800">{f.value}</dd>
          </div>
        ))}
        {websiteUrl && (
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <dt className="shrink-0 text-slate-500">Website</dt>
            <dd className="min-w-0 text-right font-semibold">
              <a
                href={websiteUrl}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="break-all text-primary hover:text-primary-light"
              >
                {websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

/** Bảng chi phí — cột cost_breakdown (migration #7) */
function CostBreakdownSection({ data }: { data: SchoolCostBreakdown }) {
  return (
    <section id="chi-phi" className="scroll-mt-24">
      <SectionHeading icon={DollarSign} title="Học phí & chi phí" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">Khoản mục</th>
              <th className="px-4 py-3 font-semibold">Chi phí ({data.currency}/năm)</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/60" : ""}>
                <td className="px-4 py-2.5 text-slate-700">{row.label}</td>
                <td className="px-4 py-2.5 font-semibold text-slate-800">
                  {formatCostAmount(row)}
                </td>
              </tr>
            ))}
            {data.totalEstimate && (
              <tr className="border-t-2 border-primary/20 bg-primary/5">
                <td className="px-4 py-3 font-bold text-primary">{data.totalEstimate.label}</td>
                <td className="px-4 py-3 font-bold text-primary">
                  {formatCostAmount(data.totalEstimate)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Bảng điều kiện nhập học — cột admission_requirements (migration #7) */
function AdmissionRequirementsSection({ data }: { data: SchoolAdmissionRequirements }) {
  return (
    <section id="dieu-kien-nhap-hoc" className="scroll-mt-24">
      <SectionHeading icon={CheckCircle} title="Điều kiện nhập học" />
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-semibold">Bậc học</th>
              <th className="px-4 py-3 font-semibold">GPA</th>
              <th className="px-4 py-3 font-semibold">Tiếng Anh</th>
              <th className="px-4 py-3 font-semibold">Yêu cầu khác</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, idx) => (
              <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/60" : ""}>
                <td className="px-4 py-2.5 font-semibold text-slate-800">{row.level}</td>
                <td className="px-4 py-2.5 text-slate-700">{row.gpa ?? "—"}</td>
                <td className="px-4 py-2.5 text-slate-700">{row.ielts ?? "—"}</td>
                <td className="px-4 py-2.5 text-slate-700">{row.other ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.notes && <p className="mt-2 text-xs text-slate-500">{data.notes}</p>}
    </section>
  );
}

/** 1 section động — content_sections (migration #5, union html/list/table) */
function ContentSectionBlock({ section, id }: { section: SchoolSection; id?: string }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 text-lg font-bold text-primary">{section.title}</h2>
      {section.type === "html" && (
        <div
          className="space-y-3 text-sm leading-relaxed text-slate-700 [&_a]:text-primary [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-lg"
          // Nguồn: admin/crawler qua service role (không phải input người dùng) + đã sanitize
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(section.content) }}
        />
      )}
      {section.type === "list" && (
        <ul className="space-y-2.5">
          {section.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-accent-orange" aria-hidden />
              <span className="text-sm text-slate-700">{item}</span>
            </li>
          ))}
        </ul>
      )}
      {section.type === "table" && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                {section.headers.map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.rows.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 1 ? "bg-slate-50/60" : ""}>
                  {section.headers.map((h) => (
                    <td key={h} className="px-4 py-2.5 text-slate-700">
                      {row[h] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** ── Page chính ─────────────────────────────────────────────── */

export default async function SchoolDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const school = await getSchoolBySlug(params.slug);
  if (!school) notFound();

  const relatedSchools = await fetchSchoolsBySlugs(school.relatedSlugs ?? []);

  const countryName =
    destinations.find((c) => c.code === school.country)?.name.replace("Du học ", "") ??
    school.country;
  const provinceName =
    provinces.find((p) => p.code === school.province)?.name ?? school.province;

  // Bản đồ: chỉ nhận https (chống chèn src bẩn từ dữ liệu crawler)
  const mapSrc =
    school.mapEmbedUrl && /^https:\/\//i.test(school.mapEmbedUrl) ? school.mapEmbedUrl : null;

  // Mục lục — theo đúng thứ tự render cột trái
  const toc: Array<{ id: string; label: string }> = [];
  if (school.description) toc.push({ id: "gioi-thieu", label: `Giới thiệu ${school.name}` });
  if (school.highlights?.length) toc.push({ id: "diem-noi-bat", label: "Điểm nổi bật" });
  if (school.programs?.length) toc.push({ id: "nganh-hoc", label: "Ngành học thế mạnh" });
  if (school.costBreakdown?.rows.length) toc.push({ id: "chi-phi", label: "Học phí & chi phí" });
  if (school.admissionRequirements?.rows.length)
    toc.push({ id: "dieu-kien-nhap-hoc", label: "Điều kiện nhập học" });
  if (school.requirements?.length) toc.push({ id: "yeu-cau-dau-vao", label: "Yêu cầu đầu vào" });
  school.contentSections?.forEach((s, i) =>
    toc.push({ id: `noi-dung-${i + 1}`, label: s.title })
  );
  if (mapSrc) toc.push({ id: "vi-tri", label: "Vị trí trên bản đồ" });

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
              {/* Nhãn thông minh Program Tags (v1.13.0) */}
              <ProgramTags school={school} className="mt-3 justify-center md:justify-start" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-12">
          {/* ── Cột trái: Nội dung chi tiết ── */}
          <div className="space-y-10 md:col-span-8">
            {/* Mục lục bài viết (như think.edu.vn) */}
            <TableOfContents items={toc} />

            {/* Giới thiệu */}
            {school.description && (
              <section id="gioi-thieu" className="scroll-mt-24">
                <h2 className="mb-4 text-lg font-bold text-primary">Giới thiệu</h2>
                <p className="text-sm leading-relaxed text-slate-700">
                  {school.description}
                </p>
              </section>
            )}

            {/* Điểm nổi bật */}
            {school.highlights && school.highlights.length > 0 && (
              <section id="diem-noi-bat" className="scroll-mt-24">
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
              <section id="nganh-hoc" className="scroll-mt-24">
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

            {/* Bảng chi phí (migration #7) */}
            {school.costBreakdown && school.costBreakdown.rows.length > 0 && (
              <CostBreakdownSection data={school.costBreakdown} />
            )}

            {/* Bảng điều kiện nhập học (migration #7) */}
            {school.admissionRequirements && school.admissionRequirements.rows.length > 0 && (
              <AdmissionRequirementsSection data={school.admissionRequirements} />
            )}

            {/* Yêu cầu đầu vào */}
            {school.requirements && school.requirements.length > 0 && (
              <section id="yeu-cau-dau-vao" className="scroll-mt-24">
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

            {/* Nội dung chi tiết động — content_sections (migration #5, từ crawler/admin) */}
            {school.contentSections?.map((section, idx) => (
              <ContentSectionBlock key={idx} section={section} id={`noi-dung-${idx + 1}`} />
            ))}

            {/* Vị trí trên bản đồ — map_embed_url (migration #5, sửa qua Tab Vị trí & Bản đồ) */}
            {mapSrc && <MapSection src={mapSrc} schoolName={school.name} />}

            {/* Khối CTA — tắt qua Tab Liên kết & CTA (show_cta) */}
            {school.showCta !== false && <CtaBox />}

            {/* Bài viết liên quan — related_slugs */}
            {relatedSchools.length > 0 && <RelatedSchoolsSection schools={relatedSchools} />}
          </div>

          {/* ── Cột phải: Sticky Sidebar ── */}
          <aside className="md:col-span-4">
            <div className="sticky top-24 space-y-5">
              <SidebarCard
                tuitionUsd={school.tuitionUsd}
                scholarshipUpTo={school.scholarshipUpTo}
              />
              <QuickFactsCard school={school} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}