"use client";

import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import { ArticleView } from "@/components/ArticleView";
import { toArticle } from "@/lib/contentful/mappers";
import type { ArticleResult } from "@/lib/contentful/types";

// Receives the untransformed GraphQL result, runs it through the live updates
// hook, then maps the (possibly updated) result to component props.
export function LiveArticle({ article }: { article: ArticleResult }) {
  const updatedArticle = useContentfulLiveUpdates(article);

  return <ArticleView {...toArticle(updatedArticle)} />;
}
