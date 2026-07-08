import type { Article, Scholarship } from "@/types";

/** Tin tức du học — mock, thay bằng CMS/API sau. */
export const articles: Article[] = [
  {
    id: "n1",
    title: "Du học cấp 2 ở Anh: Điều kiện, thông tin, chi phí",
    excerpt:
      "Mọi thứ tưởng chừng như phức tạp sẽ trở nên đơn giản khi bạn nắm rõ lộ trình chuẩn bị hồ sơ từ sớm...",
    publishedAt: "2026-06-28T08:00:00Z",
    href: "#",
  },
  {
    id: "n2",
    title: "Xin visa du học Úc thuận lợi hơn khi Việt Nam lên Assessment Level 2",
    excerpt:
      "Ngày 30/9, Bộ Nội vụ Úc đã chính thức công bố quyết định nâng Việt Nam từ Assessment Level 3 lên Level 2...",
    publishedAt: "2026-06-20T08:00:00Z",
    href: "#",
  },
  {
    id: "n3",
    title: "Du học Tết: Thông tin, điều kiện, chi phí",
    excerpt:
      "Du học Tết đang trở thành xu hướng mới cho học sinh, sinh viên Việt Nam muốn khám phá thế giới...",
    publishedAt: "2026-06-12T08:00:00Z",
    href: "#",
  },
  {
    id: "n4",
    title: "Du học hè Tây Ban Nha 2026 — Chương trình Hè Kinh doanh Quốc tế",
    excerpt:
      "Chương trình Du học Hè Tây Ban Nha: Kinh doanh Quốc tế — EU Business School là lựa chọn hấp dẫn...",
    publishedAt: "2026-06-05T08:00:00Z",
    href: "#",
  },
  {
    id: "n5",
    title: "Du học hè New Zealand 2026: Điều kiện, chi phí",
    excerpt:
      "Du học hè New Zealand đang trở thành lựa chọn hàng đầu cho những ai mong muốn vừa rèn luyện tiếng Anh...",
    publishedAt: "2026-05-28T08:00:00Z",
    href: "#",
  },
];

/** Học bổng / sự kiện — mock, thay bằng CMS/API sau. */
export const scholarships: Scholarship[] = [
  {
    id: "sc1",
    title: "Cập nhật học bổng mới nhất Ball State University",
    excerpt:
      "Ball State University mang đến nhiều lựa chọn học bổng cho sinh viên quốc tế ở bậc đại học, với giá trị lên đến 50%...",
    universityName: "Ball State University",
    href: "#",
  },
  {
    id: "sc2",
    title: "Cập nhật học bổng mới nhất Churchill Institute of Higher Education",
    excerpt:
      "Churchill Institute of Higher Education hiện có chính sách học bổng và hỗ trợ học phí dành cho sinh viên quốc tế...",
    universityName: "Churchill Institute",
    href: "#",
  },
  {
    id: "sc3",
    title: "Cập nhật học bổng mới nhất Management Development Institute of Singapore",
    excerpt:
      "Management Development Institute of Singapore hiện có nhiều học bổng dành cho sinh viên theo học nhóm ngành Du lịch...",
    universityName: "MDIS",
    href: "#",
  },
  {
    id: "sc4",
    title: "Cập nhật học bổng mới nhất University of Winchester",
    excerpt:
      "Học bổng University of Winchester mang đến cơ hội tối ưu ngân sách du học Anh cho sinh viên Việt Nam...",
    universityName: "University of Winchester",
    href: "#",
  },
  {
    id: "sc5",
    title: "Cập nhật học bổng mới nhất Wilfrid Laurier University",
    excerpt:
      "Với thế mạnh về Kinh doanh, Công nghệ, Khoa học và chương trình thực tập hưởng lương, Wilfrid Laurier University...",
    universityName: "Wilfrid Laurier University",
    href: "#",
  },
];
