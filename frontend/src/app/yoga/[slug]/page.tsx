import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PoseDetail } from "@/components/library/PoseDetail";
import { StepTutorial } from "@/components/guided/StepTutorial";
import { PostureCoach } from "@/components/coach/PostureCoach";
import { SessionTimer } from "@/components/session/SessionTimer";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
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

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <PoseDetail detail={detail} />
        {detail.steps.length > 0 ? (
          <section className="mx-auto w-full max-w-6xl px-3 pb-6 sm:px-8 sm:pb-8" aria-label="Guided practice">
            <StepTutorial steps={detail.steps} poseTitle={detail.summary.title} />
          </section>
        ) : null}
        <div className="mx-auto w-full max-w-6xl px-5 pb-4 sm:px-8">
          <PostureCoach poseTitle={detail.summary.title} />
        </div>
        <div className="mx-auto w-full max-w-6xl px-5 pb-4 sm:px-8">
          <SessionTimer contentId={detail.summary.id} defaultMinutes={detail.summary.durationMinutes ?? 10} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
