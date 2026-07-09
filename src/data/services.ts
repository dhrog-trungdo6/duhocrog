import type {
  FAQItem,
  PricingItem,
  ServiceMenuItem,
  VisaProcessStep,
  VisaType,
} from "@/types";

// ── Service Menu Items (cho dropdown trong RogHeader) ──────────────

export const serviceMenuData: ServiceMenuItem[] = [
  {
    label: "Dịch Vụ Visa",
    href: "/dich-vu/visa",
    children: [
      { label: "Visa Mỹ", href: "/dich-vu/visa" },
      { label: "Visa Anh", href: "/dich-vu/visa" },
      { label: "Visa Úc", href: "/dich-vu/visa" },
      { label: "Visa Canada", href: "/dich-vu/visa" },
      { label: "Visa Singapore", href: "/dich-vu/visa" },
    ],
  },
  {
    label: "Gia Hạn Visa",
    href: "/dich-vu/gia-han-visa",
  },
  {
    label: "Bảo Hiểm Du Học",
    href: "/dich-vu/bao-hiem",
  },
  {
    label: "Dịch Thuật Công Chứng",
    href: "/dich-vu/dich-thuat",
  },
  {
    label: "Luyện Phỏng Vấn Visa",
    href: "/dich-vu/luyen-phong-van",
  },
];

// ── Visa Types ─────────────────────────────────────────────────────

export const visaTypes: VisaType[] = [
  {
    id: "du-hoc",
    name: "Visa Du Học",
    description:
      "Visa dành cho học sinh, sinh viên Việt Nam muốn du học tại các trường được công nhận ở nước ngoài.",
    icon: "GraduationCap",
  },
  {
    id: "du-lich",
    name: "Visa Du Lịch",
    description:
      "Visa ngắn hạn dành cho mục đích du lịch, tham quan và khám phá.",
    icon: "Plane",
  },
  {
    id: "tham-than",
    name: "Visa Thăm Thân",
    description:
      "Visa dành cho người có người thân đang sinh sống, học tập hoặc làm việc ở nước ngoài.",
    icon: "Users",
  },
];

// ── Visa Process Steps ─────────────────────────────────────────────

export const visaProcessSteps: VisaProcessStep[] = [
  {
    step: 1,
    title: "Tư vấn & Đánh giá hồ sơ",
    description:
      "Chuyên viên ROG đánh giá hồ sơ của bạn, tư vấn loại visa phù hợp và lộ trình chuẩn bị.",
  },
  {
    step: 2,
    title: "Chuẩn bị hồ sơ",
    description:
      "Hướng dẫn bạn chuẩn bị đầy đủ các giấy tờ cần thiết theo checklist của từng quốc gia.",
  },
  {
    step: 3,
    title: "Hoàn thiện & Nộp đơn",
    description:
      "ROG kiểm tra, hoàn thiện hồ sơ và nộp đơn xin visa lên Đại sứ quán/Lãnh sự quán.",
  },
  {
    step: 4,
    title: "Luyện phỏng vấn",
    description:
      "Thực hành phỏng vấn 1-1 với chuyên gia, chuẩn bị các câu hỏi thường gặp.",
  },
  {
    step: 5,
    title: "Nhận kết quả & Hỗ trợ sau visa",
    description:
      "Theo dõi kết quả, hỗ trợ các thủ tục sau khi có visa: đặt vé máy bay, tìm chỗ ở...",
  },
];

// ── Document Requirements ──────────────────────────────────────────

export const documentRequirements = [
  {
    category: "Giấy tờ cá nhân",
    items: [
      "Hộ chiếu còn hạn ít nhất 6 tháng",
      "Ảnh thẻ 4x6cm (nền trắng, chụp trong 6 tháng gần nhất)",
      "Sơ yếu lý lịch (có xác nhận địa phương)",
      "CMND/CCCD (bản sao công chứng)",
      "Giấy khai sinh (bản sao)",
    ],
  },
  {
    category: "Giấy tờ học tập",
    items: [
      "Thư mời nhập học (CAS/I-20/CoE...) từ trường",
      "Bảng điểm & bằng cấp cao nhất (dịch thuật công chứng)",
      "Chứng chỉ tiếng Anh (IELTS/TOEFL/Duolingo...)",
      "Kế hoạch học tập (Study Plan) chi tiết",
    ],
  },
  {
    category: "Giấy tờ tài chính",
    items: [
      "Sổ tiết kiệm (số dư tối thiểu theo yêu cầu từng nước)",
      "Xác nhận số dư ngân hàng",
      "Chứng minh thu nhập (HĐLĐ, bảng lương, giấy phép kinh doanh...)",
      "Giấy tờ tài sản đảm bảo (sổ đỏ, đăng ký xe...)",
    ],
  },
  {
    category: "Giấy tờ bổ sung (tùy quốc gia)",
    items: [
      "Giấy khám sức khỏe",
      "Lý lịch tư pháp (Police Check)",
      "Bảo hiểm y tế du học (OSHC, IHS...)",
      "Thư giải trình (nếu có gap year, chuyển ngành...)",
    ],
  },
];

// ── Pricing ────────────────────────────────────────────────────────

export const visaPricing: PricingItem[] = [
  {
    service: "Tư vấn & Đánh giá hồ sơ ban đầu",
    price: "Miễn phí",
    note: "Tư vấn trực tiếp hoặc online qua Zoom",
  },
  {
    service: "Dịch vụ xin Visa Du học (trọn gói)",
    price: "8.000.000 - 15.000.000 VNĐ",
    note: "Tùy quốc gia và độ phức tạp hồ sơ",
  },
  {
    service: "Dịch vụ xin Visa Du lịch",
    price: "3.000.000 - 5.000.000 VNĐ",
  },
  {
    service: "Dịch vụ xin Visa Thăm thân",
    price: "3.500.000 - 6.000.000 VNĐ",
  },
  {
    service: "Dịch thuật & Công chứng hồ sơ",
    price: "Liên hệ",
    note: "Tính theo số lượng & ngôn ngữ",
  },
  {
    service: "Luyện phỏng vấn Visa (2 buổi)",
    price: "1.500.000 VNĐ",
    note: "1-1 với chuyên gia giàu kinh nghiệm",
  },
  {
    service: "Phí Lãnh sự quán (lệ phí visa)",
    price: "Theo quy định từng nước",
    note: "ROG không thu hộ — học viên tự nộp tại Lãnh sự quán",
  },
];

// ── Why Choose ROG for Visa ────────────────────────────────────────

export const whyChooseRogVisa: string[] = [
  "Hơn 10 năm kinh nghiệm xử lý hồ sơ visa các nước",
  "Tỷ lệ đậu visa du học trên 95%",
  "Đội ngũ chuyên viên am hiểu luật di trú từng quốc gia",
  "Hỗ trợ luyện phỏng vấn 1-1 miễn phí",
  "Không phát sinh chi phí ẩn — báo giá minh bạch ngay từ đầu",
  "Theo dõi tiến trình hồ sơ 24/7 qua Zalo/Email",
  "Hỗ trợ cả sau khi có visa: đặt vé, tìm nhà, đón sân bay",
];

// ── FAQ ────────────────────────────────────────────────────────────

export const visaFAQs: FAQItem[] = [
  {
    question: "Thời gian xử lý visa du học mất bao lâu?",
    answer:
      "Thời gian xử lý visa tùy thuộc vào từng quốc gia. Visa Úc thường mất 2-4 tuần, visa Anh 3 tuần (có thể chọn Priority 5 ngày hoặc Super Priority 24h), visa Mỹ cần đặt lịch phỏng vấn trước 1-2 tháng. ROG sẽ tư vấn timeline cụ thể cho trường hợp của bạn.",
  },
  {
    question: "Nếu bị từ chối visa, tôi có được hỗ trợ nộp lại không?",
    answer:
      "Có. ROG sẽ cùng bạn phân tích lý do từ chối, khắc phục điểm yếu trong hồ sơ và hỗ trợ nộp lại. Trong nhiều trường hợp, chúng tôi sẽ hỗ trợ miễn phí hoặc giảm phí dịch vụ cho lần nộp thứ hai.",
  },
  {
    question: "Tôi cần chứng minh tài chính bao nhiêu tiền?",
    answer:
      "Mỗi quốc gia có yêu cầu khác nhau. Ví dụ: Úc yêu cầu chứng minh 1 năm học phí + sinh hoạt phí (~AUD 29,710/năm), Anh yêu cầu 1 năm học phí + £1,334/tháng (ngoài London), Mỹ yêu cầu chứng minh 1 năm toàn bộ chi phí theo I-20. ROG sẽ tư vấn con số cụ thể và cách chứng minh phù hợp với gia đình bạn.",
  },
  {
    question: "Tôi có thể đặt lịch tư vấn visa miễn phí không?",
    answer:
      "Hoàn toàn có thể. Bạn có thể để lại thông tin qua form Đăng ký tư vấn trên website, hoặc gọi hotline 0909 000 000 để được tư vấn trực tiếp. Buổi tư vấn đầu tiên luôn miễn phí.",
  },
  {
    question: "ROG có hỗ trợ visa cho phụ huynh đi cùng không?",
    answer:
      "Có. ROG hỗ trợ xin visa du lịch/thăm thân cho phụ huynh muốn đưa con sang nhập học hoặc thăm con trong quá trình du học. Chúng tôi tư vấn chiến lược nộp hồ sơ đồng thời hoặc tách riêng để tối ưu tỷ lệ đậu.",
  },
  {
    question: "Hồ sơ yếu (gap year dài, học lực trung bình...) có xin được visa không?",
    answer:
      "Mỗi trường hợp đều có cơ hội nếu được chuẩn bị hồ sơ đúng cách. ROG đã xử lý thành công nhiều case khó: gap year 3-5 năm, chuyển ngành, lớn tuổi... Chúng tôi sẽ giúp bạn xây dựng Study Plan và thư giải trình thuyết phục để tối đa tỷ lệ đậu visa.",
  },
];