"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/bangumi", label: "追番" },
  { href: "/tags", label: "标签" },
  { href: "/archives", label: "归档" },
  { href: "/about", label: "关于" },
];

export default function Header() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-paper-300 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-wide text-ink-900"
        >
          凌风<span className="text-gradient">的个人站</span>
        </Link>
        <nav className="flex items-center gap-0.5 sm:gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-2 py-1.5 text-[13px] transition sm:px-2.5 sm:text-sm ${
                isActive(item.href)
                  ? "bg-accent-500/10 text-accent-600"
                  : "text-ink-700 hover:bg-paper-200 hover:text-ink-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
