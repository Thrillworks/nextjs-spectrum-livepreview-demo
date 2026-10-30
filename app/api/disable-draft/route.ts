import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { CROSS_SITE_COOKIE } from "@/lib/basic-auth";

export async function GET() {
  (await draftMode()).disable();
  // /api/draft sets the cookie with Partitioned, and a partitioned cookie is only
  // removed by an expiry that is also partitioned.
  (await cookies()).set("__prerender_bypass", "", { ...CROSS_SITE_COOKIE, expires: new Date(0) });
  redirect("/");
}
