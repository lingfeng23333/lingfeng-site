import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Wallpaper from "@/components/Wallpaper";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
const ogImage = `${siteUrl}/og.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl || "http://localhost:3000"),
  title: {
    default: "风起之地",
    template: "%s · 风起之地",
  },
  description:
    "风起之地——一切的起始点。凌风的个人站：追番、分集感想与日常随笔。",
  openGraph: {
    title: "风起之地",
    description: "一切的起始点 · 凌风的个人站：追番、分集感想与日常随笔。",
    type: "website",
    images: [{ url: ogImage, width: 1200, height: 630, alt: "风起之地" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "风起之地",
    images: [ogImage],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="relative flex min-h-full flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');",
          }}
        />
        <Wallpaper />
        <Header />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
