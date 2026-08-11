import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CoverImage from "@/components/CoverImage";
import { getResources, getResource } from "@/lib/resources";

export function generateStaticParams() {
  return getResources().map((r) => ({ id: r.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resource = getResource(id);
  return { title: resource?.title };
}

export default async function ResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const resource = getResource(id);
  if (!resource) notFound();

  return (
    <div className="space-y-8">
      <header className="paper-panel flex flex-col gap-6 rounded-3xl p-6 sm:flex-row sm:p-8">
        <CoverImage
          src={resource.cover}
          alt={resource.title}
          className="h-72 w-52 shrink-0 self-center rounded-2xl object-cover shadow-lg sm:self-auto"
        />
        <div className="min-w-0 flex-1">
          <span className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-bold text-accent-600">
            资源 #{resource.number}
          </span>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
            {resource.title}
          </h1>
          {resource.subtitle ? (
            <p className="mt-1 text-sm text-ink-500">{resource.subtitle}</p>
          ) : null}
          {resource.description ? (
            <p className="mt-3 text-sm leading-7 text-ink-700">
              {resource.description}
            </p>
          ) : null}
          {resource.source ? (
            <a
              href={resource.source}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs text-accent-600 hover:underline"
            >
              原始出处 ↗
            </a>
          ) : null}
        </div>
      </header>

      <section className="paper-panel rounded-3xl p-6 sm:p-8">
        <h2 className="font-display text-lg font-semibold text-ink-900">
          目录（{resource.chapters.length} 章）
        </h2>
        <ol className="mt-4 divide-y divide-paper-300">
          {resource.chapters.map((chapter, i) => (
            <li key={chapter.file}>
              <Link
                href={`/resources/${resource.id}/${chapter.file.replace(/\.md$/, "")}`}
                className="flex items-baseline gap-3 py-3 transition hover:text-accent-600"
              >
                <span className="w-8 shrink-0 text-sm font-bold text-accent-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-ink-800">{chapter.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
