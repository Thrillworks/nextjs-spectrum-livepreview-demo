import { revalidateTag } from "next/cache";
import { CONTENTFUL_TAG } from "@/lib/contentful/queries";

// Point a Contentful webhook (publish/unpublish events) at this route with an
// "x-revalidate-secret" header set to CONTENTFUL_REVALIDATE_SECRET.
export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret");

  if (!process.env.CONTENTFUL_REVALIDATE_SECRET || secret !== process.env.CONTENTFUL_REVALIDATE_SECRET) {
    return Response.json({ message: "Invalid secret" }, { status: 401 });
  }

  revalidateTag(CONTENTFUL_TAG, "max");
  return Response.json({ revalidated: true, now: Date.now() });
}
