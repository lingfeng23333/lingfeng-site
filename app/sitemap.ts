import type { MetadataRoute } from "next";
import { getIndex } from "@/lib/data";
import { getAllPosts } from "@/lib/posts";
import { getResources } from "@/lib/resources";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://lingfeng.example.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const { lastSyncAt } = getIndex();
  const lastModified = new Date(lastSyncAt);

  const statics: MetadataRoute.Sitemap = [
    "",
    "/blog",
    "/bangumi",
    "/resources",
    "/tags",
    "/archives",
    "/about",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified,
  }));

  const posts: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  const subjects: MetadataRoute.Sitemap = getIndex().subjects.map((s) => ({
    url: `${siteUrl}/bangumi/${s.id}`,
    lastModified,
  }));

  const resources: MetadataRoute.Sitemap = getResources().flatMap((r) => [
    {
      url: `${siteUrl}/resources/${r.id}`,
      lastModified,
    },
    ...r.chapters.map((c) => ({
      url: `${siteUrl}/resources/${r.id}/${c.file.replace(/\.md$/, "")}`,
      lastModified,
    })),
  ]);

  return [...statics, ...posts, ...subjects, ...resources];
}
