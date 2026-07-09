"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, GraduationCap, Menu, Phone, Search, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { serviceMenuData } from "@/data/services";
import { studyAbroadMenuData } from "@/data/destinations";
import StudyAbroadMegaMenu from "@/components/layout/StudyAbroadMegaMenu";
import { studyDestinations } from "@/data/megaMenu";

const NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Về chúng tôi", href: "#" },
  { label: "Du học", href: "#destinations", hasDropdown: true, dropdownKey: "study" as const },
  { label: "DỊCH VỤ", href: "#", hasDropdown: true, dropdownKey: "services" as const },
  { label: "Tìm Trường", href: "/tim-truong" },
  { label: "Tuyển sinh", href: "#school-finder" },
  { label: "Tin tức", href: "#news" },
] as const;

export function RogHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [studyDropdownOpen, setStudyDropdownOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileStudyOpen, setMobileStudyOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      {/* Top bar: logo + hotline + CTA */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2" aria-label={siteConfig.name}>
          {/* TODO: thay bằng logo thật (next/image) */}
          <GraduationCap className="h-9 w-9 text-primary" aria-hidden />
          <span className="text-xl font-extrabold leading-tight">
            <span className="text-primary">ROG</span>
            <span className="text-accent">Education</span>
          </span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={siteConfig.hotlineHref}
            className="flex items-center gap-2 font-bold text-accent"
            aria-label={`Gọi hotline ${siteConfig.hotline}`}
          >
            <Phone className="h-5 w-5" aria-hidden />
            <span>
              <span className="block text-xs font-medium uppercase text-slate-500">
                ROG Overseas Centre
              </span>
              Hotline: {siteConfig.hotline}
            </span>
          </a>
          <a href="#lead-form">
            <Button variant="accent">Đăng ký tư vấn</Button>
          </a>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-primary md:hidden"
          aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Navigation bar */}
      <nav className="hidden bg-primary md:block" aria-label="Điều hướng chính">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          <ul className="flex">
            {NAV_ITEMS.map((item) => {
              if ("hasDropdown" in item && item.hasDropdown && item.dropdownKey === "services") {
                return (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setServicesDropdownOpen(true)}
                    onMouseLeave={() => setServicesDropdownOpen(false)}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 px-4 py-3 text-sm font-semibold uppercase text-white transition-colors hover:bg-primary-light"
                      onClick={(e) => e.preventDefault()}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${servicesDropdownOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </Link>
                    {servicesDropdownOpen && (
                      <ul className="absolute left-0 top-full z-50 min-w-[220px] rounded-b-md bg-neutral-800 py-2 shadow-lg">
                        {serviceMenuData.map((svc) => (
                          <li key={svc.label}>
                            <Link
                              href={svc.href}
                              className="block px-4 py-2.5 text-sm text-white transition-colors hover:bg-primary"
                            >
                              <span className="font-semibold">{svc.label}</span>
                              {svc.children && svc.children.length > 0 && (
                                <ul className="ml-3 mt-1 space-y-1">
                                  {svc.children.map((child) => (
                                    <li key={child.label}>
                                      <Link
                                        href={child.href}
                                        className="block py-1 text-xs text-gray-300 transition-colors hover:text-accent-orange"
                                      >
                                        {child.label}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }
              if ("hasDropdown" in item && item.hasDropdown && item.dropdownKey === "study") {
                return (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setStudyDropdownOpen(true)}
                    onMouseLeave={() => setStudyDropdownOpen(false)}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-1 px-4 py-3 text-sm font-semibold uppercase text-white transition-colors hover:bg-primary-light"
                      onClick={(e) => e.preventDefault()}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${studyDropdownOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </Link>
                    {studyDropdownOpen && (
                      <StudyAbroadMegaMenu destinations={studyDestinations} />
                    )}
                  </li>
                );
              }
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-sm font-semibold uppercase text-white transition-colors hover:bg-primary-light"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="rounded-md p-2 text-white transition-colors hover:bg-primary-light"
            aria-label="Tìm kiếm"
          >
            <Search className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t bg-white md:hidden" aria-label="Menu di động">
          <ul>
            {NAV_ITEMS.map((item) => {
              if ("hasDropdown" in item && item.hasDropdown && item.dropdownKey === "services") {
                return (
                  <li key={item.label} className="border-b border-slate-100">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800"
                      onClick={() => setMobileServicesOpen((v) => !v)}
                      aria-expanded={mobileServicesOpen}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                    {mobileServicesOpen && (
                      <ul className="bg-slate-50 px-4 pb-3">
                        {serviceMenuData.map((svc) => (
                          <li key={svc.label}>
                            <Link
                              href={svc.href}
                              className="block py-2 text-sm font-medium text-slate-700 transition-colors hover:text-primary"
                              onClick={() => {
                                setMobileServicesOpen(false);
                                setMobileOpen(false);
                              }}
                            >
                              {svc.label}
                            </Link>
                            {svc.children && svc.children.length > 0 && (
                              <ul className="ml-4 space-y-1">
                                {svc.children.map((child) => (
                                  <li key={child.label}>
                                    <Link
                                      href={child.href}
                                      className="block py-1.5 text-xs text-slate-500 transition-colors hover:text-primary"
                                      onClick={() => {
                                        setMobileServicesOpen(false);
                                        setMobileOpen(false);
                                      }}
                                    >
                                      {child.label}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }
              if ("hasDropdown" in item && item.hasDropdown && item.dropdownKey === "study") {
                return (
                  <li key={item.label} className="border-b border-slate-100">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-slate-800"
                      onClick={() => setMobileStudyOpen((v) => !v)}
                      aria-expanded={mobileStudyOpen}
                    >
                      {item.label}
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${mobileStudyOpen ? "rotate-180" : ""}`}
                        aria-hidden
                      />
                    </button>
                    {mobileStudyOpen && (
                      <ul className="bg-slate-50 px-4 pb-3">
                        {studyAbroadMenuData.map((sItem) => (
                          <li key={sItem.label}>
                            <Link
                              href={sItem.href}
                              className="block py-2 text-sm font-medium text-slate-700 transition-colors hover:text-primary"
                              onClick={() => {
                                setMobileStudyOpen(false);
                                setMobileOpen(false);
                              }}
                            >
                              {sItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="block border-b border-slate-100 px-4 py-3 text-sm font-semibold text-slate-800"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
            <li className="p-4">
              <a
                href={siteConfig.hotlineHref}
                className="flex items-center gap-2 font-bold text-accent"
              >
                <Phone className="h-5 w-5" aria-hidden />
                Hotline: {siteConfig.hotline}
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
