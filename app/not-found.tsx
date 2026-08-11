import Link from "next/link";
import QuoteCard from "@/components/QuoteCard";
import { getRandomQuote } from "@/lib/quotes";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-gradient font-display text-6xl font-bold">404</p>
      <h1 className="mt-4 font-display text-xl text-ink-900">迷路了？</h1>
      <p className="mt-2 text-sm text-ink-400">这里什么都没有，只有一句名言。</p>
      <div className="mt-8 w-full max-w-lg">
        <QuoteCard initial={getRandomQuote()} />
      </div>
      <Link
        href="/"
        className="mt-8 rounded-full bg-gradient-to-r from-accent-500 to-flare-500 px-6 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        回到首页
      </Link>
    </div>
  );
}
