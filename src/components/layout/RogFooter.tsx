import Link from "next/link";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { destinations } from "@/data/destinations";

/* lucide-react đã gỡ icon thương hiệu — dùng SVG inline */
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 21.9v-8.4h2.8l.5-3.3h-3.3V8.1c0-1 .3-1.6 1.7-1.6h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.4v3.3h2.8v8.4h3.3z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
    </svg>
  );
}

function TiktokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.4V2h-3.2v12.9a2.7 2.7 0 1 1-2.7-2.7c.3 0 .6 0 .8.1V9a6 6 0 1 0 5.1 5.9V8.7a8 8 0 0 0 4.5 1.4V6.9c-.2 0-.5 0-.7-.2z" />
    </svg>
  );
}

const QUICK_LINKS = [
  { label: "Về ROG Education", href: "#" },
  { label: "Sự kiện", href: "#" },
  { label: "Liên hệ", href: "#" },
  { label: "Visa thành công", href: "#" },
  { label: "Chính sách bảo mật", href: "#" },
  { label: "Điều khoản sử dụng", href: "#" },
] as const;

export function RogFooter() {
  return (
    <footer className="bg-navy text-slate-300">
      {/* Hotline banner mỏng full-width */}
      <div className="bg-primary py-3 text-center">
        <a
          href={siteConfig.hotlineHref}
          className="inline-flex items-center gap-2 font-bold text-white"
        >
          <Phone className="h-5 w-5" aria-hidden />
          Hotline: {siteConfig.hotline}
        </a>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Cột 1: liên hệ — lấy từ siteConfig, KHÔNG hardcode */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase text-white">
            Thông tin liên hệ
          </h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span>{siteConfig.address}</span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <a href={siteConfig.hotlineHref} className="hover:text-white">
                {siteConfig.hotline}
              </a>
            </li>
            <li className="flex gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <a href={`mailto:${siteConfig.email}`} className="hover:text-white">
                {siteConfig.email}
              </a>
            </li>
            <li className="flex gap-2">
              <Globe className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <a href={siteConfig.url} className="hover:text-white">
                {siteConfig.url.replace("https://", "")}
              </a>
            </li>
          </ul>
        </div>

        {/* Cột 2: quốc gia du học */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase text-white">
            Quốc gia du học
          </h3>
          <ul className="grid grid-cols-1 gap-2 text-sm">
            {destinations.slice(0, 8).map((c) => (
              <li key={c.code}>
                <Link href="#destinations" className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 3: quick links */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase text-white">
            Tìm hiểu thêm
          </h3>
          <ul className="space-y-2 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 4: social + newsletter */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase text-white">
            Kết nối với ROG
          </h3>
          <div className="mb-6 flex gap-3">
            <a
              href={siteConfig.social.facebook}
              aria-label="Facebook ROG Education"
              className="rounded-full bg-white/10 p-2.5 transition-colors hover:bg-primary"
            >
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a
              href={siteConfig.social.youtube}
              aria-label="YouTube ROG Education"
              className="rounded-full bg-white/10 p-2.5 transition-colors hover:bg-primary"
            >
              <YoutubeIcon className="h-5 w-5" />
            </a>
            <a
              href={siteConfig.social.tiktok}
              aria-label="TikTok ROG Education"
              className="rounded-full bg-white/10 p-2.5 transition-colors hover:bg-primary"
            >
              <TiktokIcon className="h-5 w-5" />
            </a>
          </div>

          <h4 className="mb-2 text-sm font-semibold text-white">
            Đăng ký nhận thông tin
          </h4>
          <form className="flex gap-2" action="#">
            <input
              type="email"
              required
              placeholder="Email của bạn"
              aria-label="Email đăng ký newsletter"
              className="w-full rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-dark"
            >
              Gửi
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
