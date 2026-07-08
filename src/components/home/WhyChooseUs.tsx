import { BadgeCheck, Clock, ShieldCheck, Users } from "lucide-react";
import { LeadForm } from "@/components/home/LeadForm";

const REASONS = [
  {
    icon: Users,
    title: "Đội ngũ tư vấn hơn 10 năm kinh nghiệm",
    description:
      "Chuyên viên hoạt động trong ngành lâu năm, sẵn sàng tư vấn cho bạn bất cứ thời gian nào, kể cả ngoài giờ.",
  },
  {
    icon: BadgeCheck,
    title: "Hồ sơ tư vấn lựa chọn ngành học phù hợp",
    description:
      "Định hướng trường phù hợp với trình độ và khả năng tài chính, giúp bạn phát huy tối đa thế mạnh của bản thân.",
  },
  {
    icon: ShieldCheck,
    title: "Tỷ lệ đậu visa cao",
    description:
      "Hỗ trợ chứng minh tài chính, luyện phỏng vấn và hoàn thiện hồ sơ chuẩn chỉnh — 99% học sinh tin tưởng và hài lòng.",
  },
  {
    icon: Clock,
    title: "Xử lý hồ sơ nhanh chóng",
    description:
      "Quy trình chuẩn hóa giúp rút ngắn thời gian xử lý hồ sơ, kịp mọi kỳ nhập học trong năm.",
  },
] as const;

export function WhyChooseUs() {
  return (
    <section className="bg-white py-14" aria-labelledby="why-title">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-2">
        {/* Cột trái: lý do chọn ROG */}
        <div>
          <h2 id="why-title" className="mb-8 text-2xl font-extrabold uppercase text-slate-800">
            Vì sao nên chọn <span className="text-primary">ROG Education</span>?
          </h2>
          <ul className="space-y-6">
            {REASONS.map((reason) => (
              <li key={reason.title} className="flex gap-4">
                <span className="mt-1 shrink-0 rounded-lg bg-primary/10 p-3">
                  <reason.icon className="h-6 w-6 text-primary" aria-hidden />
                </span>
                <div>
                  <h3 className="font-bold text-slate-800">{reason.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {reason.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột phải: card lead form nền primary */}
        <div id="lead-form" className="scroll-mt-28">
          <div className="rounded-2xl bg-primary p-6 shadow-xl md:p-8">
            <h2 className="mb-1 text-2xl font-extrabold text-white">
              Đăng ký nhận tư vấn ngay
            </h2>
            <p className="mb-6 text-sm text-white/80">
              Miễn phí đánh giá hồ sơ &amp; lộ trình du học phù hợp nhất với bạn.
            </p>
            <LeadForm variant="dark" />
          </div>
        </div>
      </div>
    </section>
  );
}
