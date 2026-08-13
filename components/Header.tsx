"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const nav = [
  { href: "/", label: "首页" },
  { href: "/blog", label: "博客" },
  { href: "/bangumi", label: "追番" },
  { href: "/stats", label: "统计" },
  { href: "/resources", label: "资源" },
  { href: "/tags", label: "标签" },
  { href: "/archives", label: "归档" },
  { href: "/about", label: "关于" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-paper-300 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-wide text-ink-900"
        >
          风起<span className="text-gradient">之地</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-2.5 py-1.5 text-sm transition ${
                isActive(item.href)
                  ? "bg-accent-500/10 text-accent-600"
                  : "text-ink-700 hover:bg-paper-200 hover:text-ink-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg border border-paper-300 text-ink-700 transition hover:border-accent-500/50 md:hidden"
        >
          <span
            className={`h-0.5 w-4 rounded-full bg-current transition ${
              open ? "translate-y-1 rotate-45" : ""
            }`}
          />
          <span
            className={`h-0.5 w-4 rounded-full bg-current transition ${
              open ? "-translate-y-1 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {open ? (
        <nav className="border-t border-paper-300 bg-white/95 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="grid grid-cols-2 gap-1">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  isActive(item.href)
                    ? "bg-accent-500/10 font-medium text-accent-600"
                    : "text-ink-700 hover:bg-paper-200"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
