import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArticleView } from "@/components/ArticleView";
import { ContentfulPage } from "@/components/ContentfulPage";
import { Sections } from "@/components/sections";
import { isContentfulConfigured } from "@/lib/contentful/client";
import { getArticle, getArticleSlugs, getPage, getPageSlugs } from "@/lib/contentful/queries";

export async function generateStaticParams() {
  const [pageSlugs, articleSlugs] = await Promise.all([getPageSlugs(), getArticleSlugs()]);
  const slugs = [...new Set([...pageSlugs, ...articleSlugs])].filter((slug) => slug !== "home");

  // Cache Components requires at least one param at build time. The
  // placeholder has no matching entry, so it resolves to a 404.
  return slugs.length > 0
    ? slugs.map((slug) => ({ slug }))
    : [{ slug: "__placeholder__" }];
}

// The URL is the Contentful slug. Pages are checked first, then articles.
async function SlugPage({ params }: Pick<PageProps<"/[slug]">, "params">) {
  const { slug } = await params;
  if (!isContentfulConfigured) return <ContentfulPage slug={slug} />;

  const page = await getPage(slug);
  if (page) {
    return (
      <main className="flex-1">
        <Sections sections={page.sections} />
      </main>
    );
  }

  const article = await getArticle(slug);
  if (article) return <ArticleView {...article} />;

  notFound();
}

// params is awaited inside Suspense so entries published after the build are
// served from the app shell and filled in on first visit.
export default function Page({ params }: PageProps<"/[slug]">) {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <SlugPage params={params} />
    </Suspense>
  );
}
