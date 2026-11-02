import { MetadataRoute } from "next";

import { listContent } from "@/lib/api/content";
import type { ContentSummary } from "@/lib/api/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let entries: Array<{ slug: string; updatedAt?: string | null }> = [];
  try {
    const result = await listContent({ page: 0, size: 1000 });
    entries = result.content.map((c: ContentSummary) => ({
      slug: c.slug,
      updatedAt: c.publishedAt,
    }));
  } catch {
    entries = [];
  }

  const changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] =
    "monthly";

  return [
    {
      url: "https://pranaveda.dev",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://pranaveda.dev/yoga",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://pranaveda.dev/videos",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://pranaveda.dev/calm-music",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://pranaveda.dev/breathing",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: "https://pranaveda.dev/about",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://pranaveda.dev/safety",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: "https://pranaveda.dev/privacy",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: "https://pranaveda.dev/terms",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...entries.map((entry) => ({
      url: `https://pranaveda.dev/yoga/${entry.slug}`,
      lastModified: entry.updatedAt ? new Date(entry.updatedAt) : new Date(),
      changeFrequency: changeFreq,
      priority: 0.7,
    })),
  ];
}