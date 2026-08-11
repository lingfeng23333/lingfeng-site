import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-paper-300 py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-4 text-sm text-ink-400 sm:flex-row sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} 凌风 · 风起之地</p>
        <div className="flex items-center gap-4">
          <a
            href="https://bgm.tv/user/966130"
            target="_blank"
            rel="noreferrer"
            className="transition hover:text-accent-700"
          >
            Bangumi
          </a>
          <Link href="/rss.xml" className="transition hover:text-accent-700">
            RSS
          </Link>
          <Link href="/about" className="transition hover:text-accent-700">
            关于
          </Link>
          <Link href="/resources" className="transition hover:text-accent-700">
            资源
          </Link>
          <Link href="/write" className="transition hover:text-accent-700">
            写作台
          </Link>
        </div>
      </div>
    </footer>
  );
}
