import { describe, it, expect } from "vitest";
import { TOKEN_TTL_LIMITS, isValidTokenTTL, parseTokenTTL } from "../useAppClientCreateForm";

describe("useAppClientCreateForm token TTL limits", () => {
  it("defines correct accessToken limits and defaults", () => {
    expect(TOKEN_TTL_LIMITS.accessToken.min).toBe(5);
    expect(TOKEN_TTL_LIMITS.accessToken.max).toBe(480);
    expect(TOKEN_TTL_LIMITS.accessToken.defaultValue).toBe("15");
  });

  it("defines correct refreshToken limits and defaults", () => {
    expect(TOKEN_TTL_LIMITS.refreshToken.min).toBe(24);
    expect(TOKEN_TTL_LIMITS.refreshToken.max).toBe(720);
    expect(TOKEN_TTL_LIMITS.refreshToken.defaultValue).toBe("168");
  });

  it("validates accessToken TTL values correctly", () => {
    expect(isValidTokenTTL(parseTokenTTL("4"), TOKEN_TTL_LIMITS.accessToken)).toBe(false);
    expect(isValidTokenTTL(parseTokenTTL("5"), TOKEN_TTL_LIMITS.accessToken)).toBe(true);
    expect(isValidTokenTTL(parseTokenTTL("15"), TOKEN_TTL_LIMITS.accessToken)).toBe(true);
    expect(isValidTokenTTL(parseTokenTTL("480"), TOKEN_TTL_LIMITS.accessToken)).toBe(true);
    expect(isValidTokenTTL(parseTokenTTL("481"), TOKEN_TTL_LIMITS.accessToken)).toBe(false);
  });

  it("validates refreshToken TTL values correctly", () => {
    expect(isValidTokenTTL(parseTokenTTL("23"), TOKEN_TTL_LIMITS.refreshToken)).toBe(false);
    expect(isValidTokenTTL(parseTokenTTL("24"), TOKEN_TTL_LIMITS.refreshToken)).toBe(true);
    expect(isValidTokenTTL(parseTokenTTL("168"), TOKEN_TTL_LIMITS.refreshToken)).toBe(true);
    expect(isValidTokenTTL(parseTokenTTL("720"), TOKEN_TTL_LIMITS.refreshToken)).toBe(true);
    expect(isValidTokenTTL(parseTokenTTL("721"), TOKEN_TTL_LIMITS.refreshToken)).toBe(false);
  });
});
