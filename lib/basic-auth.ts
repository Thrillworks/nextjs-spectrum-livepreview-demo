import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// HTTP Basic authentication for the whole site, so the demo is not public or crawlable.
//
// The Contentful preview pane loads the site in a cross-site iframe. Chrome shows the
// Basic auth prompt there in a normal window, but suppresses it when third-party
// cookies are blocked (incognito, and browsers that block them by default), and the
// pane then shows only the 401 body. So the preview link, which already carries
// CONTENTFUL_PREVIEW_SECRET, also sets a partitioned access cookie that this gate
// accepts in place of Basic credentials. Partitioned (CHIPS) cookies are kept in a
// cross-site iframe even when third-party cookies are blocked.
//
// Defaults: on in production, off in `next dev`. BASIC_AUTH_ENABLED=true|false
// overrides either way. With the gate on and no BASIC_AUTH_PASSWORD configured,
// every gated request is refused rather than let through.

// ASCII only: the realm goes into a header value, and a character above 255 throws
// when the 401 is built.
export const BASIC_AUTH_REALM = "Spectrum live preview";
export const DEFAULT_BASIC_AUTH_USER = "spectrum";
export const PREVIEW_ACCESS_COOKIE = "preview_access";
export const PREVIEW_ACCESS_MAX_AGE = 60 * 60 * 12;

// Paths that answer without credentials. Each has its own protection or serves nothing
// private:
//   /robots.txt       App Runner health check, and it tells crawlers to stay out
//   /api/draft        Contentful preview entry point; checks CONTENTFUL_PREVIEW_SECRET
//   /api/revalidate   Contentful webhook; checks CONTENTFUL_REVALIDATE_SECRET
const UNGATED_PATHS = ["/robots.txt", "/api/draft", "/api/revalidate"];

type Env = Readonly<Record<string, string | undefined>>;

const TRUTHY = new Set(["1", "true", "yes", "on", "enabled"]);
const FALSY = new Set(["0", "false", "no", "off", "disabled"]);

// Whole path segments only, so a later route such as /api/drafts is not exempted by
// accident.
export function isUngatedPath(pathname: string): boolean {
  return UNGATED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

// An unrecognised value falls back to the default instead of to "off", so a typo
// cannot expose the site.
export function isBasicAuthEnabled(env: Env = process.env): boolean {
  const raw = env.BASIC_AUTH_ENABLED?.trim().toLowerCase();
  if (raw && TRUTHY.has(raw)) return true;
  if (raw && FALSY.has(raw)) return false;
  return env.NODE_ENV === "production";
}

export function basicAuthCredentials(env: Env = process.env) {
  return {
    user: env.BASIC_AUTH_USER?.trim() || DEFAULT_BASIC_AUTH_USER,
    password: env.BASIC_AUTH_PASSWORD ?? "",
  };
}

export function wwwAuthenticateValue(): string {
  return `Basic realm="${BASIC_AUTH_REALM}", charset="UTF-8"`;
}

// Hashing first gives both sides the same length, so the comparison takes the same time
// whatever the input.
function safeEqual(a: string, b: string): boolean {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
}

export function parseAuthorizationHeader(header: string | null) {
  if (!header) return undefined;
  const [scheme, encoded] = header.split(" ");
  if (scheme?.toLowerCase() !== "basic" || !encoded) return undefined;

  const decoded = Buffer.from(encoded, "base64").toString("utf8");
  // Split on the first colon only: a password may contain colons.
  const index = decoded.indexOf(":");
  if (index < 0) return undefined;
  return { user: decoded.slice(0, index), password: decoded.slice(index + 1) };
}

export function isAuthorized(header: string | null, env: Env = process.env): boolean {
  const expected = basicAuthCredentials(env);
  if (!expected.password) return false;
  const supplied = parseAuthorizationHeader(header);
  if (!supplied) return false;
  // Both comparisons always run, so timing does not reveal whether the user was right.
  const userOk = safeEqual(supplied.user, expected.user);
  const passwordOk = safeEqual(supplied.password, expected.password);
  return userOk && passwordOk;
}

// The cookie value is derived from the password, so changing the password revokes
// every issued cookie, and the value cannot be produced without knowing it.
export function previewAccessToken(env: Env = process.env): string {
  const { password } = basicAuthCredentials(env);
  if (!password) return "";
  return createHmac("sha256", password).update("spectrum-preview-access-v1").digest("hex");
}

export function hasPreviewAccess(cookieValue: string | undefined, env: Env = process.env): boolean {
  const expected = previewAccessToken(env);
  if (!expected || !cookieValue) return false;
  return safeEqual(cookieValue, expected);
}

// Shared by the access cookie and the re-issued draft mode cookie. SameSite=None and
// Secure are required for a cross-site iframe; Partitioned keeps the cookie when
// third-party cookies are blocked.
export const CROSS_SITE_COOKIE = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  partitioned: true,
  path: "/",
} as const;
