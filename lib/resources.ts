import fs from "node:fs";
import path from "node:path";

export interface ResourceChapter {
  number: string;
  file: string;
  title: string;
}

export interface ResourceMeta {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  cover: string;
  source?: string;
  description?: string;
  chapters: ResourceChapter[];
}

function resourcesDir() {
  return path.join(process.cwd(), "data", "resources");
}

export function getResources(): ResourceMeta[] {
  if (!fs.existsSync(resourcesDir())) return [];
  return fs
    .readdirSync(resourcesDir())
    .filter((dir) =>
      fs.existsSync(path.join(resourcesDir(), dir, "meta.json")),
    )
    .map((dir) =>
      JSON.parse(
        fs.readFileSync(path.join(resourcesDir(), dir, "meta.json"), "utf8"),
      ) as ResourceMeta,
    )
    .sort((a, b) =>
      a.number.localeCompare(b.number, "en", { numeric: true }),
    );
}

export function getResource(id: string): ResourceMeta | null {
  return getResources().find((r) => r.id === id) ?? null;
}

export function getChapter(
  resourceId: string,
  file: string,
): {
  meta: ResourceMeta;
  index: number;
  title: string;
  content: string;
} | null {
  const meta = getResource(resourceId);
  if (!meta) return null;
  const index = meta.chapters.findIndex((c) => c.file === file);
  if (index < 0) return null;
  const filePath = path.join(resourcesDir(), resourceId, "chapters", file);
  if (!fs.existsSync(filePath)) return null;
  return {
    meta,
    index,
    title: meta.chapters[index].title,
    content: fs.readFileSync(filePath, "utf8"),
  };
}
