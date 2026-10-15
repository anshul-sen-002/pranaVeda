import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentDetailView } from "@/components/library/ContentDetailView";
import { getContent } from "@/lib/api/content";

// The detail page reads uncached data in generateMetadata (per-slug SEO) as
// well as the body, so it cannot be statically prerendered — render it per
// request instead of failing the build.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getContent(slug).catch(() => null);
  if (!detail) return { title: "Not found | PranaVeda" };
  return {
    title: `${detail.summary.title} | PranaVeda`,
    description: detail.seoDescription ?? detail.summary.summary ?? undefined,
  };
}

export default async function YogaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = await getContent(slug).catch(() => null);

  // Drafts/archived are a 404 for the public API — surface a real 404 page.
  if (!detail) notFound();

  return <ContentDetailView detail={detail} />;
}
