import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Wallpaper from "@/components/Wallpaper";

export const metadata: Metadata = {
  title: {
    default: "凌风的个人站",
    template: "%s · 凌风的个人站",
  },
  description: "凌风的个人站：追番、分集感想与日常随笔。",
  openGraph: {
    title: "凌风的个人站",
    description: "追番、分集感想与日常随笔。",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="relative flex min-h-full flex-col">
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
