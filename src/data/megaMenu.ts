import type { StudyDestination } from "@/types";
import { destinations } from "@/data/destinations";

/** Tên quốc gia lấy từ nguồn chuẩn `destinations` — tránh trôi dữ liệu khi đổi tên. */
const countryName = (code: string): string =>
  destinations.find((d) => d.code === code)?.name ?? code;

/** Mock data cho Mega Menu "DU HỌC" — 6 quốc gia, mỗi nước 1 bài nổi bật + 3 bài liên quan.
 *  Bài viết: thumbnailUrl bỏ trống → component tự render placeholder gradient. */
export const studyDestinations: StudyDestination[] = [
  {
    id: "us",
    slug: "my",
    name: countryName("us"),
    shortName: "MỸ",
    featuredArticle: {
      id: "us-feat-1",
      title: "Học bổng 100% các trường Top tại Mỹ kỳ Fall 2026",
      excerpt:
        "Cơ hội nhận học bổng toàn phần từ các trường đại học hàng đầu Hoa Kỳ cho kỳ nhập học Fall 2026. Điều kiện ứng tuyển và deadline mới nhất.",
      href: "#",
      isHot: true,
      publishedAt: "2026-06-15T00:00:00Z",
    },
    relatedArticles: [
      {
        id: "us-rel-1",
        title: "Điều kiện xin visa du học Mỹ mới nhất 2026",
        excerpt:
          "Cập nhật những thay đổi trong quy trình xin visa F-1, thời gian xét duyệt và tỷ lệ đậu visa.",
        href: "#",
        publishedAt: "2026-06-20T00:00:00Z",
      },
      {
        id: "us-rel-2",
        title: "Chi phí du học Mỹ: Học phí & Sinh hoạt phí 2026",
        excerpt:
          "Tổng hợp chi phí du học Mỹ theo từng bang: California, New York, Texas... và cách tiết kiệm hiệu quả.",
        href: "#",
        publishedAt: "2026-06-10T00:00:00Z",
      },
      {
        id: "us-rel-3",
        title: "Top 10 ngành học dễ định cư tại Mỹ sau tốt nghiệp",
        excerpt:
          "STEM, Nursing, Business Analytics... — những ngành có lộ trình OPT dài và cơ hội việc làm cao.",
        href: "#",
        publishedAt: "2026-05-28T00:00:00Z",
      },
    ],
  },
  {
    id: "ca",
    slug: "canada",
    name: countryName("ca"),
    shortName: "CANADA",
    featuredArticle: {
      id: "ca-feat-1",
      title: "Chính sách SDS 2026: Xét visa du học Canada nhanh trong 20 ngày",
      excerpt:
        "Chương trình Study Direct Stream (SDS) mở rộng — lộ trình nhanh nhất để du học Canada. Điều kiện mới nhất và hồ sơ cần chuẩn bị.",
      href: "#",
      isHot: true,
      publishedAt: "2026-07-01T00:00:00Z",
    },
    relatedArticles: [
      {
        id: "ca-rel-1",
        title: "Định cư Canada sau du học: Từ PGWP đến PR",
        excerpt:
          "Lộ trình hoàn chỉnh từ giấy phép làm việc sau tốt nghiệp (PGWP) đến thường trú nhân (PR) cho du học sinh.",
        href: "#",
        publishedAt: "2026-06-25T00:00:00Z",
      },
      {
        id: "ca-rel-2",
        title: "Học phí các trường Canada: So sánh Ontario, BC, Québec",
        excerpt:
          "Bảng so sánh học phí theo tỉnh bang và các chương trình học bổng đầu vào phổ biến tại Canada.",
        href: "#",
        publishedAt: "2026-06-18T00:00:00Z",
      },
      {
        id: "ca-rel-3",
        title: "Du học Canada không cần IELTS: Các trường chấp nhận Duolingo",
        excerpt:
          "Danh sách các trường đại học và cao đẳng Canada chấp nhận chứng chỉ Duolingo English Test thay thế IELTS.",
        href: "#",
        publishedAt: "2026-06-05T00:00:00Z",
      },
    ],
  },
  {
    id: "au",
    slug: "uc",
    name: countryName("au"),
    shortName: "ÚC",
    featuredArticle: {
      id: "au-feat-1",
      title: "Học bổng Chính phủ Úc Australia Awards 2026 — mở đơn từ tháng 8",
      excerpt:
        "Học bổng toàn phần của Chính phủ Úc dành cho sinh viên Việt Nam. Điều kiện, ngành học và cách chuẩn bị hồ sơ.",
      href: "#",
      publishedAt: "2026-06-22T00:00:00Z",
    },
    relatedArticles: [
      {
        id: "au-rel-1",
        title: "Danh sách trường Group of Eight (Go8): Điều kiện đầu vào & học phí",
        excerpt:
          "8 trường đại học hàng đầu nước Úc — cập nhật yêu cầu GPA, IELTS và học phí cho sinh viên quốc tế.",
        href: "#",
        publishedAt: "2026-06-30T00:00:00Z",
      },
      {
        id: "au-rel-2",
        title: "Visa 485 Úc: Ở lại làm việc sau tốt nghiệp đến 5 năm",
        excerpt:
          "Tất tần tật về visa Temporary Graduate (subclass 485) — điều kiện, thời hạn mới và các ngành ưu tiên.",
        href: "#",
        publishedAt: "2026-06-12T00:00:00Z",
      },
      {
        id: "au-rel-3",
        title: "Chi phí sinh hoạt tại Sydney, Melbourne, Brisbane 2026",
        excerpt:
          "Cập nhật mức sống tối thiểu theo yêu cầu visa Úc và chi phí thực tế tại 3 thành phố lớn nhất.",
        href: "#",
        publishedAt: "2026-06-08T00:00:00Z",
      },
    ],
  },
  {
    id: "uk",
    slug: "anh",
    name: countryName("uk"),
    shortName: "ANH",
    featuredArticle: {
      id: "uk-feat-1",
      title: "Graduate Route Visa 2026: Làm việc 2-3 năm tại Anh sau tốt nghiệp",
      excerpt:
        "Cập nhật mới nhất về visa Graduate Route cho sinh viên quốc tế — điều kiện, ngành nghề và mức lương tối thiểu.",
      href: "#",
      publishedAt: "2026-07-02T00:00:00Z",
    },
    relatedArticles: [
      {
        id: "uk-rel-1",
        title: "Học bổng Chevening 2026/2027: Hướng dẫn chi tiết từ A-Z",
        excerpt:
          "Học bổng toàn phần danh giá nhất của Chính phủ Anh — tiêu chí chọn ứng viên và lịch trình nộp đơn.",
        href: "#",
        publishedAt: "2026-06-28T00:00:00Z",
      },
      {
        id: "uk-rel-2",
        title: "Top trường Russell Group: University of Manchester, UCL, Imperial...",
        excerpt:
          "So sánh điều kiện đầu vào, học phí và học bổng của các trường trong nhóm Russell Group danh tiếng.",
        href: "#",
        publishedAt: "2026-06-15T00:00:00Z",
      },
      {
        id: "uk-rel-3",
        title: "Foundation Year tại Anh: Lộ trình cho học sinh hết lớp 11",
        excerpt:
          "Không cần bằng THPT — chương trình Foundation Year giúp bạn vào thẳng năm nhất các trường đại học Anh Quốc.",
        href: "#",
        publishedAt: "2026-06-01T00:00:00Z",
      },
    ],
  },
  {
    id: "sg",
    slug: "singapore",
    name: countryName("sg"),
    shortName: "SINGAPORE",
    featuredArticle: {
      id: "sg-feat-1",
      title: "Du học Singapore 2026: Học phí chỉ từ 200 triệu/năm — Bằng cấp quốc tế",
      excerpt:
        "Singapore đang trở thành điểm đến du học hot với mức học phí cạnh tranh và bằng cấp từ các trường top UK, Úc, Mỹ.",
      href: "#",
      publishedAt: "2026-06-18T00:00:00Z",
    },
    relatedArticles: [
      {
        id: "sg-rel-1",
        title: "Kaplan Singapore vs MDIS vs James Cook: Nên chọn trường nào?",
        excerpt:
          "So sánh chi tiết 3 trường đào tạo quốc tế hàng đầu tại Singapore: học phí, chương trình, cơ hội chuyển tiếp.",
        href: "#",
        publishedAt: "2026-07-05T00:00:00Z",
      },
      {
        id: "sg-rel-2",
        title: "Điều kiện xin visa du học Singapore — Student Pass 2026",
        excerpt:
          "Quy trình xin Student Pass (visa du học Singapore): hồ sơ, thời gian xét duyệt và tỷ lệ đậu.",
        href: "#",
        publishedAt: "2026-06-22T00:00:00Z",
      },
      {
        id: "sg-rel-3",
        title: "Chi phí sinh hoạt tại Singapore cho du học sinh 2026",
        excerpt:
          "Tổng hợp mức sống: nhà ở, ăn uống, đi lại... cho du học sinh tại đảo quốc sư tử.",
        href: "#",
        publishedAt: "2026-06-10T00:00:00Z",
      },
    ],
  },
  {
    id: "nz",
    slug: "new-zealand",
    name: countryName("nz"),
    shortName: "NEW ZEALAND",
    featuredArticle: {
      id: "nz-feat-1",
      title: "Du học New Zealand 2026: Học phí thấp — Cơ hội định cư cao",
      excerpt:
        "New Zealand nổi tiếng với chất lượng giáo dục Anh Quốc, học phí cạnh tranh và chính sách định cư cởi mở cho du học sinh.",
      href: "#",
      publishedAt: "2026-06-25T00:00:00Z",
    },
    relatedArticles: [
      {
        id: "nz-rel-1",
        title: "8 trường đại học công lập New Zealand: Học phí & Học bổng",
        excerpt:
          "Cập nhật danh sách đầy đủ 8 trường đại học công lập tại New Zealand kèm học phí và chương trình học bổng.",
        href: "#",
        publishedAt: "2026-07-03T00:00:00Z",
      },
      {
        id: "nz-rel-2",
        title: "Visa Post-Study Work New Zealand: Ở lại 3 năm sau tốt nghiệp",
        excerpt:
          "Điều kiện và quy trình xin visa làm việc sau du học tại New Zealand — cơ hội định cư lâu dài.",
        href: "#",
        publishedAt: "2026-06-20T00:00:00Z",
      },
      {
        id: "nz-rel-3",
        title: "Du học New Zealand ngành Hospitality: Cơ hội việc làm & định cư",
        excerpt:
          "Ngành Quản trị Khách sạn — Du lịch tại New Zealand: chương trình đào tạo, yêu cầu đầu vào và triển vọng nghề nghiệp.",
        href: "#",
        publishedAt: "2026-06-14T00:00:00Z",
      },
    ],
  },
];