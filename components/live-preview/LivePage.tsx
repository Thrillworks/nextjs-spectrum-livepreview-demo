"use client";

import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import { Sections } from "@/components/sections";
import { toPage } from "@/lib/contentful/mappers";
import type { PageResult } from "@/lib/contentful/types";

// Receives the untransformed GraphQL result, runs it through the live updates
// hook, then maps the (possibly updated) result to component props.
export function LivePage({ page }: { page: PageResult }) {
  const updatedPage = useContentfulLiveUpdates(page);

  return (
    <main className="flex-1">
      <Sections sections={toPage(updatedPage).sections} />
    </main>
  );
}
