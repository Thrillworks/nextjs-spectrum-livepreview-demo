import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

// Contentful preview URL: /api/draft?secret=<CONTENTFUL_PREVIEW_SECRET>&slug={entry.fields.slug}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "home";

  if (!process.env.CONTENTFUL_PREVIEW_SECRET || secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("Invalid secret", { status: 401 });
  }

  (await draftMode()).enable();
  redirect(slug === "home" ? "/" : `/${encodeURIComponent(slug)}`);
}
