import type { School } from "@/types";

/**
 * Mock data trường/học bổng cho SchoolFinder.
 * TODO: thay bằng API/CMS thật; logoUrl đang trỏ placeholder.
 */
export const schools: School[] = [
  { id: "s01", name: "Ball State University", slug: "ball-state-university", country: "us", province: "us-ny", level: "dai-hoc", tuitionUsd: 28000, scholarshipUpTo: 50, logoUrl: "/partners/placeholder.svg" },
  { id: "s02", name: "UMass Boston", slug: "umass-boston", country: "us", province: "us-ma", level: "dai-hoc", tuitionUsd: 36000, scholarshipUpTo: 40, logoUrl: "/partners/placeholder.svg" },
  { id: "s03", name: "Green River College", slug: "green-river-college", country: "us", province: "us-ca", level: "cao-dang", tuitionUsd: 12000, scholarshipUpTo: 20, logoUrl: "/partners/placeholder.svg" },
  { id: "s04", name: "Texas Tech University", slug: "texas-tech-university", country: "us", province: "us-tx", level: "sau-dai-hoc", tuitionUsd: 24000, scholarshipUpTo: 60, logoUrl: "/partners/placeholder.svg" },
  { id: "s05", name: "University of Toronto", slug: "university-of-toronto", country: "ca", province: "ca-on", level: "dai-hoc", tuitionUsd: 45000, scholarshipUpTo: 30, logoUrl: "/partners/placeholder.svg" },
  { id: "s06", name: "Seneca Polytechnic", slug: "seneca-polytechnic", country: "ca", province: "ca-on", level: "cao-dang", tuitionUsd: 16000, scholarshipUpTo: 25, logoUrl: "/partners/placeholder.svg" },
  { id: "s07", name: "Bodwell High School", slug: "bodwell-high-school", country: "ca", province: "ca-bc", level: "thpt", tuitionUsd: 22000, logoUrl: "/partners/placeholder.svg" },
  { id: "s08", name: "University of Sydney", slug: "university-of-sydney", country: "au", province: "au-nsw", level: "dai-hoc", tuitionUsd: 38000, scholarshipUpTo: 50, logoUrl: "/partners/placeholder.svg" },
  { id: "s09", name: "Monash University", slug: "monash-university", country: "au", province: "au-vic", level: "sau-dai-hoc", tuitionUsd: 34000, scholarshipUpTo: 40, logoUrl: "/partners/placeholder.svg" },
  { id: "s10", name: "Griffith University", slug: "griffith-university", country: "au", province: "au-qld", level: "dai-hoc", tuitionUsd: 26000, scholarshipUpTo: 50, logoUrl: "/partners/placeholder.svg" },
  { id: "s11", name: "University of Winchester", slug: "university-of-winchester", country: "uk", province: "uk-ldn", level: "dai-hoc", tuitionUsd: 20000, scholarshipUpTo: 50, logoUrl: "/partners/placeholder.svg" },
  { id: "s12", name: "University of Manchester", slug: "university-of-manchester", country: "uk", province: "uk-man", level: "sau-dai-hoc", tuitionUsd: 32000, scholarshipUpTo: 35, logoUrl: "/partners/placeholder.svg" },
  { id: "s13", name: "Kaplan International London", slug: "kaplan-international-london", country: "uk", province: "uk-ldn", level: "anh-ngu", tuitionUsd: 9000, logoUrl: "/partners/placeholder.svg" },
  { id: "s14", name: "MDIS Singapore", slug: "mdis-singapore", country: "sg", province: "sg-sg", level: "dai-hoc", tuitionUsd: 15000, scholarshipUpTo: 30, logoUrl: "/partners/placeholder.svg" },
  { id: "s15", name: "Kaplan Singapore", slug: "kaplan-singapore", country: "sg", province: "sg-sg", level: "cao-dang", tuitionUsd: 11000, scholarshipUpTo: 20, logoUrl: "/partners/placeholder.svg" },
  { id: "s16", name: "Dublin City University", slug: "dublin-city-university", country: "ie", province: "ie-dub", level: "dai-hoc", tuitionUsd: 18000, scholarshipUpTo: 40, logoUrl: "/partners/placeholder.svg" },
  { id: "s17", name: "University of Auckland", slug: "university-of-auckland", country: "nz", province: "nz-akl", level: "dai-hoc", tuitionUsd: 25000, scholarshipUpTo: 30, logoUrl: "/partners/placeholder.svg" },
  { id: "s18", name: "EHL Hospitality Lausanne", slug: "ehl-hospitality-lausanne", country: "ch", province: "ch-ge", level: "dai-hoc", tuitionUsd: 42000, scholarshipUpTo: 25, logoUrl: "/partners/placeholder.svg" },
  { id: "s19", name: "Sorbonne Université", slug: "sorbonne-universite", country: "fr", province: "fr-par", level: "sau-dai-hoc", tuitionUsd: 6000, scholarshipUpTo: 100, logoUrl: "/partners/placeholder.svg" },
  { id: "s20", name: "Taylor's University", slug: "taylor-s-university", country: "my", province: "my-kl", level: "dai-hoc", tuitionUsd: 9000, scholarshipUpTo: 50, logoUrl: "/partners/placeholder.svg" },
  { id: "s21", name: "CIA Cebu — English Academy", slug: "cia-cebu-english-academy", country: "ph", province: "ph-ceb", level: "anh-ngu", tuitionUsd: 4500, logoUrl: "/partners/placeholder.svg" },
  { id: "s22", name: "Assumption University", slug: "assumption-university", country: "th", province: "th-bkk", level: "dai-hoc", tuitionUsd: 7000, scholarshipUpTo: 30, logoUrl: "/partners/placeholder.svg" },
];
