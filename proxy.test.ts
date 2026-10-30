import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PREVIEW_ACCESS_COOKIE, previewAccessToken } from "@/lib/basic-auth";
import { proxy } from "./proxy";

const basic = (user: string, password: string) =>
  `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
const request = (path: string, headers: Record<string, string> = {}) =>
  new NextRequest(`https://spectrum-livepreview.thrillworks.site${path}`, { headers });

describe("proxy", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("BASIC_AUTH_ENABLED", "");
    vi.stubEnv("BASIC_AUTH_USER", "spectrum");
    vi.stubEnv("BASIC_AUTH_PASSWORD", "pw");
  });
  afterEach(() => vi.unstubAllEnvs());

  it("challenges a request with no credentials", () => {
    const res = proxy(request("/"));
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toMatch(/^Basic realm=/);
    expect(res.headers.get("cache-control")).toBe("no-store");
  });

  it("challenges wrong credentials and a forged cookie", () => {
    expect(proxy(request("/", { authorization: basic("spectrum", "nope") })).status).toBe(401);
    expect(proxy(request("/", { cookie: `${PREVIEW_ACCESS_COOKIE}=forged` })).status).toBe(401);
  });

  it("passes the right credentials", () => {
    const res = proxy(request("/about", { authorization: basic("spectrum", "pw") }));
    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("passes the preview access cookie without credentials", () => {
    const cookie = `${PREVIEW_ACCESS_COOKIE}=${previewAccessToken()}`;
    expect(proxy(request("/about", { cookie })).headers.get("x-middleware-next")).toBe("1");
  });

  it("leaves the health check, preview entry point and webhook open", () => {
    for (const path of ["/robots.txt", "/api/draft?secret=x", "/api/revalidate"]) {
      expect(proxy(request(path)).headers.get("x-middleware-next"), path).toBe("1");
    }
  });

  it("refuses everything when the gate is on but no password is set", () => {
    vi.stubEnv("BASIC_AUTH_PASSWORD", "");
    expect(proxy(request("/", { authorization: basic("spectrum", "") })).status).toBe(401);
  });

  it("does nothing when the gate is turned off", () => {
    vi.stubEnv("BASIC_AUTH_ENABLED", "false");
    expect(proxy(request("/")).headers.get("x-middleware-next")).toBe("1");
  });
});
