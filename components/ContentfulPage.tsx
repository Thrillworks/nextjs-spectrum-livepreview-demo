import { notFound } from "next/navigation";
import { LivePage } from "@/components/live-preview/LivePage";
import { isContentfulConfigured } from "@/lib/contentful/client";
import { getPage } from "@/lib/contentful/queries";

export async function ContentfulPage({ slug }: { slug: string }) {
  if (!isContentfulConfigured) return <SetupNotice />;

  const page = await getPage(slug);
  if (!page) notFound();

  return <LivePage page={page} />;
}

function SetupNotice() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Connect Contentful</h1>
      <p className="leading-7 text-zinc-600 dark:text-zinc-400">
        Copy <code className="font-mono">.env.example</code> to{" "}
        <code className="font-mono">.env.local</code>, add your space ID and access tokens,
        then restart the dev server. Run <code className="font-mono">npm run contentful:seed</code>{" "}
        to create the content model and sample pages.
      </p>
    </main>
  );
}
