import type { Testimonial } from "@/types";

/** Minh chứng visa / cảm nhận học viên — TODO: thay bằng dữ liệu + ảnh thật (đã che thông tin nhạy cảm). */
export const testimonials: Testimonial[] = [
  {
    id: "t1",
    studentName: "Lê Hà",
    program: "Du học Mỹ",
    quote:
      "Cảm ơn ROG đã đồng hành trong suốt quá trình chuẩn bị hồ sơ. Em đã nhận visa Mỹ chỉ sau một lần phỏng vấn duy nhất!",
  },
  {
    id: "t2",
    studentName: "Phạm Tuấn",
    program: "Du học Canada",
    quote:
      "Đội ngũ tư vấn rất tận tâm, hỗ trợ em từ chọn trường, săn học bổng 40% đến luyện phỏng vấn visa. Rất đáng tin cậy.",
  },
  {
    id: "t3",
    studentName: "Ngọc Anh",
    program: "Du học Úc",
    quote:
      "Nhờ ROG mà em hoàn tất hồ sơ du học Úc chỉ trong 6 tuần, kịp nhập học kỳ tháng 7. Dịch vụ nhanh và chuyên nghiệp.",
  },
];
