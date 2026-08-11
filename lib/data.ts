import fs from "node:fs";
import path from "node:path";
import type {
  BangumiDataFile,
  BangumiIndexFile,
  Subject,
} from "./types";

function dataDir() {
  return path.join(process.cwd(), "data", "bangumi");
}

export function getData(): BangumiDataFile {
  return JSON.parse(
    fs.readFileSync(path.join(dataDir(), "user.json"), "utf8"),
  ) as BangumiDataFile;
}

export function getIndex(): BangumiIndexFile {
  return JSON.parse(
    fs.readFileSync(path.join(dataDir(), "index.json"), "utf8"),
  ) as BangumiIndexFile;
}

export function getSubject(id: number): Subject | null {
  const file = path.join(dataDir(), "subjects", `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as Subject;
}

export function getSubjectsByType(type: number) {
  return getIndex().subjects
    .filter((s) => s.collectionType === type)
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
}
