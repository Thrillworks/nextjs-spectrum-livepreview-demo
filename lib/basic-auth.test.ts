import { describe, expect, it } from "vitest";
import {
  BASIC_AUTH_REALM,
  basicAuthCredentials,
  hasPreviewAccess,
  isAuthorized,
  isBasicAuthEnabled,
  isUngatedPath,
  parseAuthorizationHeader,
  previewAccessToken,
  wwwAuthenticateValue,
} from "./basic-auth";

const basic = (user: string, password: string) =>
  `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
const ENV = { BASIC_AUTH_USER: "spectrum", BASIC_AUTH_PASSWORD: "s3cret:with:colons" };

describe("isBasicAuthEnabled", () => {
  it("is on in production and off in development by default", () => {
    expect(isBasicAuthEnabled({ NODE_ENV: "production" })).toBe(true);
    expect(isBasicAuthEnabled({ NODE_ENV: "development" })).toBe(false);
  });

  it("is overridden in either direction by BASIC_AUTH_ENABLED", () => {
    expect(isBasicAuthEnabled({ NODE_ENV: "production", BASIC_AUTH_ENABLED: "false" })).toBe(false);
    expect(isBasicAuthEnabled({ NODE_ENV: "development", BASIC_AUTH_ENABLED: " TRUE " })).toBe(true);
  });

  it("falls back to the default on an unrecognised value instead of turning off", () => {
    expect(isBasicAuthEnabled({ NODE_ENV: "production", BASIC_AUTH_ENABLED: "ture" })).toBe(true);
  });
});

describe("isUngatedPath", () => {
  it("exempts the health check, the preview entry point and the webhook", () => {
    expect(isUngatedPath("/robots.txt")).toBe(true);
    expect(isUngatedPath("/api/draft")).toBe(true);
    expect(isUngatedPath("/api/revalidate")).toBe(true);
  });

  it("matches whole path segments only", () => {
    expect(isUngatedPath("/api/drafts")).toBe(false);
    expect(isUngatedPath("/api/draft-admin")).toBe(false);
    expect(isUngatedPath("/robots.txt.bak")).toBe(false);
  });

  it("gates pages, images and the draft switch-off route", () => {
    for (const path of ["/", "/about", "/_next/image", "/api/disable-draft"]) {
      expect(isUngatedPath(path), path).toBe(false);
    }
  });
});

describe("isAuthorized", () => {
  it("accepts the configured user and a password containing colons", () => {
    expect(isAuthorized(basic("spectrum", "s3cret:with:colons"), ENV)).toBe(true);
  });

  it("rejects a wrong user, a wrong password, another scheme and garbage", () => {
    expect(isAuthorized(basic("someone", "s3cret:with:colons"), ENV)).toBe(false);
    expect(isAuthorized(basic("spectrum", "wrong"), ENV)).toBe(false);
    expect(isAuthorized("Bearer abc", ENV)).toBe(false);
    expect(isAuthorized("Basic !!!", ENV)).toBe(false);
    expect(isAuthorized(null, ENV)).toBe(false);
  });

  it("refuses everyone when no password is configured", () => {
    expect(isAuthorized(basic("spectrum", ""), { BASIC_AUTH_USER: "spectrum" })).toBe(false);
  });

  it("defaults the user to spectrum", () => {
    expect(basicAuthCredentials({}).user).toBe("spectrum");
  });

  it("parses only the first colon as the separator", () => {
    expect(parseAuthorizationHeader(basic("a", "b:c"))).toEqual({ user: "a", password: "b:c" });
  });
});

describe("preview access cookie", () => {
  it("accepts the token derived from the password and nothing else", () => {
    const token = previewAccessToken(ENV);
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(hasPreviewAccess(token, ENV)).toBe(true);
    expect(hasPreviewAccess(token.replace(/.$/, (c) => (c === "0" ? "1" : "0")), ENV)).toBe(false);
    expect(hasPreviewAccess(undefined, ENV)).toBe(false);
    expect(hasPreviewAccess("", ENV)).toBe(false);
  });

  it("is revoked when the password changes", () => {
    const token = previewAccessToken(ENV);
    expect(hasPreviewAccess(token, { ...ENV, BASIC_AUTH_PASSWORD: "rotated" })).toBe(false);
  });

  it("is never valid when no password is configured", () => {
    expect(previewAccessToken({})).toBe("");
    expect(hasPreviewAccess("", {})).toBe(false);
  });
});

describe("wwwAuthenticateValue", () => {
  // Header values are ByteStrings; a character above 255 would make every 401 a 500.
  it("contains only header-safe characters", () => {
    const value = wwwAuthenticateValue();
    expect([...value].every((c) => c.charCodeAt(0) <= 255)).toBe(true);
    expect(value).toContain(BASIC_AUTH_REALM);
  });
});
