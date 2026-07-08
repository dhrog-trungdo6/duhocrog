import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { RogHeader } from "@/components/layout/RogHeader";
import { RogFooter } from "@/components/layout/RogFooter";
import { FloatingCTA } from "@/components/layout/FloatingCTA";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Tư vấn du học Anh, Úc, Mỹ, Canada, Singapore`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "vi_VN",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: siteConfig.name }], // TODO: thêm ảnh og thật vào /public
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={beVietnam.variable}>
      <body className="bg-white font-sans text-slate-900 antialiased">
        <ErrorBoundary moduleName="RootLayout">
          <RogHeader />
          {children}
          <RogFooter />
          <FloatingCTA />
        </ErrorBoundary>
      </body>
    </html>
  );
}
