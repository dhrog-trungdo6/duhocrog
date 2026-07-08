import type { EventItem } from "@/types";

/**
 * Sự kiện tư vấn du học — mock; chuyển sang bảng `events` Supabase khi có admin CMS.
 * Tab "Sắp diễn ra" đang trống có chủ đích để hiển thị empty state (giống mẫu).
 */
export const events: EventItem[] = [
  {
    id: "ev1",
    title: "Ngày hội du học Mỹ — Gặp gỡ đại diện 20+ trường",
    description:
      "Gặp trực tiếp đại diện tuyển sinh các trường Mỹ, đánh giá hồ sơ miễn phí và săn học bổng lên đến 50%.",
    startsAt: "2026-05-16T09:00:00+07:00",
    location: "Khách sạn Rex, Quận 1, TP.HCM",
    href: "#",
  },
  {
    id: "ev2",
    title: "Hội thảo visa du học Úc sau Assessment Level 2",
    description:
      "Cập nhật chính sách visa Úc mới nhất cho học sinh Việt Nam và chiến lược nộp hồ sơ kỳ nhập học tháng 7.",
    startsAt: "2026-04-11T14:00:00+07:00",
    location: "Văn phòng ROG Education",
    href: "#",
  },
  {
    id: "ev3",
    title: "Workshop luyện phỏng vấn visa Mỹ 1-1",
    description:
      "Chuyên gia ROG mô phỏng buổi phỏng vấn thật tại Lãnh sự quán, chỉnh sửa câu trả lời cho từng hồ sơ.",
    startsAt: "2026-03-07T09:00:00+07:00",
    location: "Online qua Zoom",
    href: "#",
  },
];
