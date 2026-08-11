import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getChapter, getResources } from "@/lib/resources";

export function generateStaticParams() {
  return getResources().flatMap((r) =>
    r.chapters.map((c) => ({
      id: r.id,
      chapter: c.file.replace(/\.md$/, ""),
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; chapter: string }>;
}): Promise<Metadata> {
  const { id, chapter } = await params;
  const data = getChapter(id, `${chapter}.md`);
  return { title: data ? `${data.title} · ${data.meta.title}` : "章节" };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ id: string; chapter: string }>;
}) {
  const { id, chapter } = await params;
  const data = getChapter(id, `${chapter}.md`);
  if (!data) notFound();

  const { meta, index, title, content } = data;
  const prev = meta.chapters[index - 1];
  const next = meta.chapters[index + 1];

  return (
    <div className="space-y-6">
      <div className="paper-panel rounded-3xl p-6 sm:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
          <Link href="/resources" className="transition hover:text-accent-600">
            资源
          </Link>
          <span>/</span>
          <Link
            href={`/resources/${meta.id}`}
            className="transition hover:text-accent-600"
          >
            {meta.title}
          </Link>
        </div>

        <p className="mt-4 text-xs font-medium text-accent-600">
          {meta.chapters[index].number} /{" "}
          {String(meta.chapters.length).padStart(2, "0")}
        </p>
        <h1 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          {title}
        </h1>

        <div className="prose mt-8 max-w-none prose-headings:text-ink-900 prose-a:text-accent-600 prose-strong:text-ink-900">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content}
          </ReactMarkdown>
        </div>

        <nav className="mt-10 flex flex-wrap items-stretch justify-between gap-4 border-t border-paper-300 pt-6">
          {prev ? (
            <Link
              href={`/resources/${meta.id}/${prev.file.replace(/\.md$/, "")}`}
              className="max-w-[45%] text-sm text-ink-500 transition hover:text-accent-600"
            >
              ← {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/resources/${meta.id}/${next.file.replace(/\.md$/, "")}`}
              className="max-w-[45%] text-right text-sm text-ink-500 transition hover:text-accent-600"
            >
              {next.title} →
            </Link>
          ) : (
            <Link
              href={`/resources/${meta.id}`}
              className="text-sm text-accent-600 hover:underline"
            >
              返回目录 →
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
