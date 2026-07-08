import { Suspense } from "react";
import { HeroBanner } from "@/components/home/HeroBanner";
import { StudyDestinations } from "@/components/home/StudyDestinations";
import { StatsCounter } from "@/components/home/StatsCounter";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { EventsTabs } from "@/components/home/EventsTabs";
import { NewsAndScholarships } from "@/components/home/NewsAndScholarships";
import { SchoolFinder } from "@/components/home/SchoolFinder";
import { TestimonialCarousel } from "@/components/home/TestimonialCarousel";
import { UniversityPartners } from "@/components/home/UniversityPartners";
import { SectionSkeleton } from "@/components/ui/Skeleton";

export default function HomePage() {
  return (
    <main>
      {/* Phần tĩnh — không cần Suspense */}
      <HeroBanner />
      <StudyDestinations />
      <StatsCounter />
      <WhyChooseUs />

      {/* Sự kiện sắp/đã diễn ra — tab + empty state */}
      <EventsTabs />

      {/* Các phần sẽ fetch data động sau này — bọc Suspense sẵn */}
      <Suspense fallback={<SectionSkeleton />}>
        <NewsAndScholarships />
      </Suspense>

      {/* ⭐ Tính năng lõi */}
      <Suspense fallback={<SectionSkeleton />}>
        <SchoolFinder />
      </Suspense>

      <TestimonialCarousel />

      <Suspense fallback={<SectionSkeleton />}>
        <UniversityPartners />
      </Suspense>
    </main>
  );
}
