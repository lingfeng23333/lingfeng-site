import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Post } from "./types";

function postsDir() {
  return path.join(process.cwd(), "content", "posts");
}

const CJK_REGEX = /[\u3400-\u9fff\u3040-\u30ff\uac00-\ud7af]/g;

function countWords(text: string): number {
  const cjkCount = (text.match(CJK_REGEX) ?? []).length;
  const latinCount = text
    .replace(CJK_REGEX, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return cjkCount + latinCount;
}

function readPost(file: string): Post | null {
  const full = path.join(postsDir(), file);
  if (!fs.existsSync(full)) return null;
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  const slug = file.replace(/\.mdx?$/, "");
  const tags = Array.isArray(data.tags)
    ? data.tags.map((t) => String(t))
    : [];
  const words = countWords(content);

  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? ""),
    tags,
    summary: data.summary ? String(data.summary) : undefined,
    spoiler: Boolean(data.spoiler),
    subjectId: data.subject_id ? Number(data.subject_id) : undefined,
    ep: data.ep !== undefined ? Number(data.ep) : undefined,
    anime: data.anime ? String(data.anime) : undefined,
    content,
    wordCount: words,
    readingMinutes: Math.max(1, Math.round(words / 400)),
  };
}

export function getAllPosts(): Post[] {
  if (!fs.existsSync(postsDir())) return [];
  return fs
    .readdirSync(postsDir())
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => readPost(f))
    .filter((p): p is Post => p !== null)
    .sort((a, b) => {
      const byDate = b.date.localeCompare(a.date);
      if (byDate !== 0) return byDate;
      const byEpisode = (b.ep ?? -1) - (a.ep ?? -1);
      if (byEpisode !== 0) return byEpisode;
      return a.slug.localeCompare(b.slug);
    });
}

export function getPostBySlug(slug: string): Post | null {
  for (const ext of [".md", ".mdx"]) {
    const post = readPost(`${slug}${ext}`);
    if (post) return post;
  }
  return null;
}

export function getPostsBySubject(subjectId: number): Post[] {
  return getAllPosts()
    .filter((p) => p.subjectId === subjectId)
    .sort((a, b) => (a.ep ?? 0) - (b.ep ?? 0));
}

export function getAdjacentPosts(
  slug: string,
): { prev?: Post; next?: Post } {
  const posts = getAllPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx < 0) return {};
  return {
    next: posts[idx - 1],
    prev: posts[idx + 1],
  };
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
