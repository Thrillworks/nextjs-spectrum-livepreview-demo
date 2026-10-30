import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import {
  CROSS_SITE_COOKIE,
  PREVIEW_ACCESS_COOKIE,
  PREVIEW_ACCESS_MAX_AGE,
  isBasicAuthEnabled,
  previewAccessToken,
} from "@/lib/basic-auth";

const DRAFT_COOKIE = "__prerender_bypass";

// Contentful preview URL: /api/draft?secret=<CONTENTFUL_PREVIEW_SECRET>&slug={entry.fields.slug}
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const slug = searchParams.get("slug") ?? "home";

  if (!process.env.CONTENTFUL_PREVIEW_SECRET || secret !== process.env.CONTENTFUL_PREVIEW_SECRET) {
    return new Response("Invalid secret", { status: 401 });
  }

  (await draftMode()).enable();

  // Next sets the draft mode cookie without Partitioned, so a browser that blocks
  // third-party cookies drops it inside Contentful's preview iframe. Set it again with
  // the same value and Partitioned. The preview secret also grants the access cookie
  // that the basic auth gate accepts (lib/basic-auth.ts).
  const store = await cookies();
  const draftValue = store.get(DRAFT_COOKIE)?.value;
  if (draftValue) {
    store.set(DRAFT_COOKIE, draftValue, CROSS_SITE_COOKIE);
  }
  const token = previewAccessToken();
  if (isBasicAuthEnabled() && token) {
    store.set(PREVIEW_ACCESS_COOKIE, token, { ...CROSS_SITE_COOKIE, maxAge: PREVIEW_ACCESS_MAX_AGE });
  }

  redirect(slug === "home" ? "/" : `/${encodeURIComponent(slug)}`);
}
